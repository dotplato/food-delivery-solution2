// components/admin/restaurant-hours-dialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { refreshRestaurantHours } from "@/lib/restaurant-hours";

type HourRow = {
  id: string;
  day_of_week: number; // 0 = Sunday
  is_open: boolean;
  open_time: string; // HH:MM:SS
  close_time: string;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Helper function to normalize time to HH:MM:SS format
const normalizeTime = (time: string): string => {
  if (!time) return "09:00:00";
  // Remove any milliseconds or timezone info
  const cleaned = time.split(".")[0].split("+")[0].split("-")[0].trim();
  // If already in HH:MM:SS format, return as is
  if (cleaned.length === 8 && cleaned.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return cleaned;
  }
  // If in HH:MM format, add :00
  if (cleaned.length === 5 && cleaned.match(/^\d{2}:\d{2}$/)) {
    return cleaned + ":00";
  }
  // Default fallback
  return "09:00:00";
};

// Helper function to get time for input field (HH:MM format)
const getTimeForInput = (time: string): string => {
  const normalized = normalizeTime(time);
  return normalized.slice(0, 5); // Return HH:MM
};

export default function RestaurantHoursDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [hours, setHours] = useState<HourRow[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!open) return;

    const fetchHours = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("restaurant_hours")
          .select("*")
          .order("day_of_week", { ascending: true });

        if (error) {
          console.error("Error fetching restaurant hours:", error);
          toast.error("Failed to load restaurant hours. Using defaults.");
        }

        let fetchedHours = (data || []) as HourRow[];

        // If no hours exist yet, initialize with defaults
        if (!fetchedHours || fetchedHours.length === 0) {
          fetchedHours = dayNames.map((_, index) => ({
            id: `temp-${index}`, // Temporary ID
            day_of_week: index,
            is_open: true,
            open_time: "09:00:00",
            close_time: "17:00:00",
          }));
        } else {
          // Normalize time formats from database
          fetchedHours = fetchedHours.map((h) => ({
            ...h,
            open_time: normalizeTime(h.open_time),
            close_time: normalizeTime(h.close_time),
          }));
          // Ensure we have all 7 days - fill in missing days with defaults
          const existingDays = new Set(fetchedHours.map((h) => h.day_of_week));
          for (let i = 0; i < 7; i++) {
            if (!existingDays.has(i)) {
              fetchedHours.push({
                id: `temp-${i}`,
                day_of_week: i,
                is_open: true,
                open_time: "09:00:00",
                close_time: "17:00:00",
              });
            }
          }
          // Sort by day of week
          fetchedHours.sort((a, b) => a.day_of_week - b.day_of_week);
        }

        setHours(fetchedHours);
      } catch (err: any) {
        console.error("Unexpected error fetching hours:", err);
        // Initialize with defaults on error
        const defaultHours = dayNames.map((_, index) => ({
          id: `temp-${index}`,
          day_of_week: index,
          is_open: true,
          open_time: "09:00:00",
          close_time: "17:00:00",
        }));
        setHours(defaultHours);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, [open]);

  const handleToggleOpen = (index: number, value: boolean) => {
    const newHours = [...hours];
    newHours[index].is_open = value;
    setHours(newHours);
  };

  const handleTimeChange = (
    index: number,
    field: "open_time" | "close_time",
    value: string
  ) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Verify user is authenticated
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to save restaurant hours.");
      }

      // First, fetch all existing records to delete them
      const { data: existingRecords, error: fetchError } = await supabase
        .from("restaurant_hours")
        .select("id");

      if (fetchError) {
        // PGRST116 = no rows returned (not an error)
        if (fetchError.code !== "PGRST116") {
          console.error("Fetch error:", fetchError);
          throw new Error(
            `Failed to fetch existing hours: ${fetchError.message}`
          );
        }
      }

      // Delete all existing records if any exist
      if (existingRecords && existingRecords.length > 0) {
        const idsToDelete = existingRecords.map((r) => r.id);
        const { error: deleteError } = await supabase
          .from("restaurant_hours")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) {
          console.error("Delete error:", deleteError);
          throw new Error(
            `Failed to delete existing hours: ${deleteError.message}`
          );
        }
      }

      // Prepare data for insert (remove temporary IDs and normalize times)
      const hoursToInsert = hours.map(({ id, ...rest }) => {
        return {
          day_of_week: rest.day_of_week,
          is_open: rest.is_open,
          open_time: normalizeTime(rest.open_time),
          close_time: normalizeTime(rest.close_time),
        };
      });

      console.log("Saving hours:", hoursToInsert);

      // Insert all records
      const { data: insertedData, error: insertError } = await supabase
        .from("restaurant_hours")
        .insert(hoursToInsert)
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(
          `Failed to save restaurant hours: ${insertError.message}`
        );
      }

      if (!insertedData || insertedData.length === 0) {
        throw new Error("No data was saved. Please check your permissions.");
      }

      console.log("Successfully saved:", insertedData);

      // Refresh to get the real IDs back
      const { data: refreshedData, error: refreshError } = await supabase
        .from("restaurant_hours")
        .select("*")
        .order("day_of_week", { ascending: true });

      if (refreshError) {
        console.error("Refresh error:", refreshError);
        // Don't throw - we already saved successfully
      }

      if (refreshedData) {
        const typedData = (refreshedData as HourRow[]).map((h) => ({
          ...h,
          open_time: normalizeTime(h.open_time),
          close_time: normalizeTime(h.close_time),
        }));
        // Ensure all 7 days are present
        const existingDays = new Set(typedData.map((h) => h.day_of_week));
        for (let i = 0; i < 7; i++) {
          if (!existingDays.has(i)) {
            typedData.push({
              id: `temp-${i}`,
              day_of_week: i,
              is_open: true,
              open_time: "09:00:00",
              close_time: "17:00:00",
            });
          }
        }
        typedData.sort((a, b) => a.day_of_week - b.day_of_week);
        setHours(typedData);
      }

      toast.success("Restaurant hours saved successfully!");

      // Refresh the cache so menu page gets updated hours immediately
      console.log(
        "Refreshing restaurant hours cache and broadcasting event..."
      );
      refreshRestaurantHours();

      setOpen(false);
    } catch (error: any) {
      console.error("Failed to save hours", error);
      toast.error(
        error.message || "Failed to save restaurant hours. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* The trigger is rendered by the parent component */}
        <></>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Set Restaurant Opening Hours</DialogTitle>
          <DialogDescription>
            Configure open/close times for each day of the week.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {hours.map((row, idx) => (
            <div key={row.id} className="grid grid-cols-5 items-center gap-2">
              <div>{dayNames[row.day_of_week]}</div>
              <Switch
                checked={row.is_open}
                onCheckedChange={(v) => handleToggleOpen(idx, v)}
              />
              <Input
                type="time"
                value={getTimeForInput(row.open_time)}
                disabled={!row.is_open}
                onChange={(e) =>
                  handleTimeChange(idx, "open_time", e.target.value + ":00")
                }
              />
              <Input
                type="time"
                value={getTimeForInput(row.close_time)}
                disabled={!row.is_open}
                onChange={(e) =>
                  handleTimeChange(idx, "close_time", e.target.value + ":00")
                }
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
