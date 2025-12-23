"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuItem, Category } from "@/lib/types";
import { fetchCategories } from "@/lib/fetch/admin/menu-items-dialog";
import { uploadMenuItemImage, deleteMenuItemImage } from "@/lib/upload-helpers";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  image_url: z.string().optional(),
  category_id: z.string().optional(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  onSave: (item: Partial<MenuItem>) => void;
}

export function MenuItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: MenuItemDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image_url: "",
      category_id: "",
      available: true,
      featured: false,
    },
  });

  // ✅ Reset form when editing or creating new
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        image_url: item.image_url || "",
        category_id: item.category_id || "",
        available: item.available,
        featured: item.featured,
      });
      // Set existing image as preview
      setImagePreview(item.image_url || null);
      setSelectedFile(null);
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: "",
        available: true,
        featured: false,
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [item, form]);

  // ✅ Fetch categories from helper
  useEffect(() => {
    async function loadCategories() {
      const data = await fetchCategories();
      setCategories(data);
    }
    loadCategories();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    form.setValue("image_url", "");
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setUploading(true);
    try {
      let imageUrl = values.image_url || "";

      // If a new file is selected, upload it
      if (selectedFile) {
        // If editing and there's an old image, delete it first
        if (item?.image_url) {
          await deleteMenuItemImage(item.image_url);
        }

        // Upload new image
        const uploadedUrl = await uploadMenuItemImage(selectedFile);
        if (!uploadedUrl) {
          alert("Failed to upload image. Please try again.");
          setLoading(false);
          setUploading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const itemData = {
        ...values,
        price: parseFloat(values.price),
        image_url: imageUrl,
      };

      onSave(itemData);
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save menu item");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Field */}
            <div className="space-y-2">
              <FormLabel>Image</FormLabel>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* File Input */}
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Upload an image (max 5MB, JPG/PNG)
              </p>
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Available</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Featured</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {uploading ? "Uploading..." : loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
