import { supabase } from "@/lib/supabase/client";

/**
 * Upload a menu item image to Supabase storage
 * @param file - The image file to upload
 * @param itemId - Optional item ID for organizing files
 * @returns The public URL of the uploaded image or null on error
 */
export async function uploadMenuItemImage(
  file: File,
  itemId?: string
): Promise<string | null> {
  try {
    console.log("Starting upload for file:", file.name);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    // Use original filename (sanitized for safe storage)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = itemId
      ? `${itemId}/${sanitizedFileName}`
      : sanitizedFileName;

    console.log("Generated filename:", fileName);

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from("menu-items")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error details:", error);
      alert("Failed to upload image. Please check console for details.");
      return null;
    }

    console.log("Upload successful, data:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-items").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Error uploading image. Please try again.");
    return null;
  }
}

/**
 * Delete a menu item image from Supabase storage
 * @param imageUrl - The full public URL of the image
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteMenuItemImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return true;

    // Extract the file path from the URL
    const urlParts = imageUrl.split("/storage/v1/object/public/menu-items/");
    if (urlParts.length < 2) {
      console.warn("Invalid image URL format:", imageUrl);
      return false;
    }

    const fileName = urlParts[1];

    // Delete file from storage
    const { error } = await supabase.storage
      .from("menu-items")
      .remove([fileName]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Get public URL for an uploaded image
 * @param path - The storage path of the image
 * @returns The public URL
 */
export function getPublicUrl(path: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from("menu-items").getPublicUrl(path);
  return publicUrl;
}
