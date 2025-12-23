// Fetch restaurant hours from the database
import { useState, useEffect } from 'react';

export type RestaurantHour = {
  id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  is_open: boolean;
  open_time: string; // HH:MM:SS
  close_time: string;
};

type DayHours = {
  open: string;
  close: string;
};

type RestaurantHoursMap = {
  [key: string]: DayHours;
};

// Cache for restaurant hours to avoid excessive API calls
let cachedHours: RestaurantHoursMap | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Default fallback hours if database is empty or API fails
const DEFAULT_HOURS: RestaurantHoursMap = {
  monday: { open: '12:00', close: '23:59' },
  tuesday: { open: '00:00', close: '23:59' },
  wednesday: { open: '00:00', close: '23:59' },
  thursday: { open: '00:00', close: '23:00' },
  friday: { open: '00:00', close: '2:00' },
  saturday: { open: '00:00', close: '2:00' },
  sunday: { open: '12:00', close: '23:00' }
};

// Convert HH:MM:SS to HH:MM format
function normalizeTime(time: string): string {
  if (!time) return '09:00';
  // Remove seconds if present
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

// Fetch restaurant hours from API
async function fetchRestaurantHours(): Promise<RestaurantHoursMap> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedHours && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedHours;
  }

  try {
    const response = await fetch('/api/restaurant-hours', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch restaurant hours');
    }

    const data: RestaurantHour[] = await response.json();
    
    // If no data, use defaults (only when database is completely empty)
    if (!data || data.length === 0) {
      cachedHours = DEFAULT_HOURS;
      lastFetchTime = now;
      return DEFAULT_HOURS;
    }

    // Convert database format to our map format
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hoursMap: RestaurantHoursMap = {};

    data.forEach((row) => {
      // Only add to map if the day is marked as open
      if (row.is_open && row.day_of_week >= 0 && row.day_of_week <= 6) {
        const dayName = dayNames[row.day_of_week];
        hoursMap[dayName] = {
          open: normalizeTime(row.open_time),
          close: normalizeTime(row.close_time)
        };
      }
      // If is_open is false, we intentionally skip it - the day stays closed
    });

    // DO NOT fill in missing days with defaults
    // If a day is not in the map, it means it's closed

    cachedHours = hoursMap;
    lastFetchTime = now;
    return hoursMap;
  } catch (error) {
    console.error('Error fetching restaurant hours:', error);
    // Return cached data if available, otherwise use defaults
    return cachedHours || DEFAULT_HOURS;
  }
}

export function getCurrentDay(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function getCurrentTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // Returns HH:MM format
}

export async function isRestaurantOpen(): Promise<boolean> {
  const currentDay = getCurrentDay();
  const currentTime = getCurrentTime();
  
  const hours = await fetchRestaurantHours();
  const todayHours = hours[currentDay];
  
  if (!todayHours) {
    return false; // Restaurant is closed on this day
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

export async function getNextOpeningTime(): Promise<string> {
  const currentDay = getCurrentDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = days.indexOf(currentDay);
  
  const hours = await fetchRestaurantHours();
  
  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = days[nextDayIndex];
    const nextDayHours = hours[nextDay];
    
    if (nextDayHours) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dayNames[nextDayIndex]} at ${nextDayHours.open}`;
    }
  }
  
  return 'Soon';
}

export async function getTodayHours(): Promise<DayHours | null> {
  const currentDay = getCurrentDay();
  const hours = await fetchRestaurantHours();
  return hours[currentDay] || null;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Force refresh the cache (useful after admin updates hours)
export function refreshRestaurantHours(): void {
  cachedHours = null;
  lastFetchTime = 0;
  
  // Dispatch custom event to notify all hooks to refetch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('restaurant-hours-updated'));
  }
}

// React Hook for client components to use restaurant status
export function useRestaurantStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [todayHours, setTodayHours] = useState<DayHours | null>(null);
  const [nextOpening, setNextOpening] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        setIsLoading(true);
        const [open, hours, next] = await Promise.all([
          isRestaurantOpen(),
          getTodayHours(),
          getNextOpeningTime()
        ]);
        setIsOpen(open);
        setTodayHours(hours);
        setNextOpening(next);
      } catch (error) {
        console.error('Error updating restaurant status:', error);
        // Set to closed on error for safety
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    // Listen for custom event when hours are updated by admin
    const handleHoursUpdated = () => {
      console.log('Restaurant hours updated, refetching...');
      updateStatus();
    };
    
    window.addEventListener('restaurant-hours-updated', handleHoursUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('restaurant-hours-updated', handleHoursUpdated);
    };
  }, []);

  return { isOpen, todayHours, nextOpening, isLoading };
}
