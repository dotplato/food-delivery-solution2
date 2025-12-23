"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, Pencil, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { MenuItemDialog } from "./menu-item-dialog";
import Loader from "@/components/ui/loader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { MenuItem, Category } from "@/lib/types";
import {
  fetchCategories,
  fetchMenuItemsWithCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/lib/fetch/admin/menu-items-helper"; // ✅ helper import

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }: any) => <div>${row.original.price.toFixed(2)}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: any) => (
      <div>{row.original.category?.name || "Uncategorized"}</div>
    ),
  },
  {
    accessorKey: "available",
    header: "Status",
    cell: ({ row }: any) => (
      <Badge variant={row.original.available ? "default" : "secondary"}>
        {row.original.available ? "Available" : "Unavailable"}
      </Badge>
    ),
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }: any) => (
      <Badge variant={row.original.featured ? "default" : "outline"}>
        {row.original.featured ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit"
          onClick={() => row.original.onEdit(row.original)}
          className="mr-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={() => row.original.onDelete(row.original.id)}
        >
          <Trash className="h-4 w-4 text-brand-500" />
        </Button>
      </div>
    ),
  },
];

export default function MenuItemsPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [cats, items] = await Promise.all([
      fetchCategories(),
      fetchMenuItemsWithCategory(),
    ]);

    // Add actions directly to items
    const itemsWithActions = items.map((item) => ({
      ...item,
      onEdit: (itm: MenuItem) => {
        setSelectedItem(itm);
        setDialogOpen(true);
      },
      onDelete: async (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
          const success = await deleteMenuItem(id);
          if (success) {
            // Remove item from state immediately
            setMenuItems((prevItems) => prevItems.filter((i) => i.id !== id));
          } else {
            alert("Failed to delete menu item");
          }
        }
      },
    }));

    setCategories(cats);
    setMenuItems(itemsWithActions);
    setLoading(false);
  };

  const handleSave = async (item: Partial<MenuItem>) => {
    if (selectedItem) {
      const updatedItem = await updateMenuItem(selectedItem.id, item);
      if (updatedItem) {
        // Update the item in state while preserving sort order
        setMenuItems((prevItems) =>
          prevItems.map((i) =>
            i.id === selectedItem.id
              ? {
                  ...updatedItem,
                  onEdit: (i as any).onEdit,
                  onDelete: (i as any).onDelete,
                }
              : i
          )
        );
        setDialogOpen(false);
        setSelectedItem(null);
      } else {
        alert("Failed to save menu item");
      }
    } else {
      const newItem = await addMenuItem(item);
      if (newItem) {
        // Add new item to the beginning of the list (most recent first)
        setMenuItems((prevItems) => [
          {
            ...newItem,
            onEdit: (itm: MenuItem) => {
              setSelectedItem(itm);
              setDialogOpen(true);
            },
            onDelete: async (id: string) => {
              if (confirm("Are you sure you want to delete this item?")) {
                const success = await deleteMenuItem(id);
                if (success) {
                  setMenuItems((prevItems) =>
                    prevItems.filter((i) => i.id !== id)
                  );
                } else {
                  alert("Failed to delete menu item");
                }
              }
            },
          },
          ...prevItems,
        ]);
        setDialogOpen(false);
        setSelectedItem(null);
      } else {
        alert("Failed to save menu item");
      }
    }
  };

  const filteredMenuItems =
    selectedCategories.length === 0
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.category_id && selectedCategories.includes(item.category_id)
        );

  // Paginated data
  const totalItems = filteredMenuItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredMenuItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories]);

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Category Filter */}
      <div className="mb-4 flex justify-between items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              Filter by Category
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({selectedCategories.length})
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {categories.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.id}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={(checked) => {
                  setSelectedCategories((prev) =>
                    checked
                      ? [...prev, cat.id]
                      : prev.filter((id) => id !== cat.id)
                  );
                }}
              >
                {cat.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Badges */}
      {selectedCategories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          {selectedCategories.map((catId) => {
            const category = categories.find((c) => c.id === catId);
            return (
              <Badge
                key={catId}
                variant="secondary"
                className="pl-3 pr-2 py-1 gap-1"
              >
                {category?.name || "Unknown"}
                <button
                  onClick={() => handleRemoveCategory(catId)}
                  className="ml-1 hover:bg-muted rounded-sm p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <DataTable columns={columns} data={paginatedItems} />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                  {totalItems}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={i}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onSave={handleSave}
      />
    </div>
  );
}
