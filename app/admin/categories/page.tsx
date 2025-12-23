"use client";

import { fetchCategoriesFromSupabase } from "@/lib/fetch/admin/categories"; 
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import Loader from "@/components/ui/loader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { Category } from "@/lib/types";

function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSave: (item: Partial<Category>) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  // Load selected category data into form
  useState(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image_url: category.image_url || "",
      });
    } else {
      setForm({ name: "", slug: "", description: "", image_url: "" });
    }
  });

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {category ? "Edit Category" : "Add Category"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.image_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, image_url: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
}

export default function CategoriesTable({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const fetchCategories = async () => {
  setLoading(true);
  const data = await fetchCategoriesFromSupabase();
  setCategories(data);
  setLoading(false);
};
useEffect(() => {
  fetchCategories();
}, []);

  const handleSave = async (item: Partial<Category>) => {
    try {
      if (selectedCategory) {
        await supabase
          .from("categories")
          .update(item)
          .eq("id", selectedCategory.id);
      } else {
        await supabase.from("categories").insert(item);
      }
      setDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      alert("Failed to save category");
    }
  };

  const handleEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-2">
            Manage your menu categories
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <Loader />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(cat)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSave}
      />
    </div>
  );
}
