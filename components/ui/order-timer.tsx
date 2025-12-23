"use client";

import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";

interface OrderTimerProps {
  acceptedAt: string | null | undefined;
  orderStatus?: string;
  updatedAt?: string | null; // When order was last updated (used for completed orders)
  className?: string;
}

const TOTAL_PREP_TIME_MS = 45 * 60 * 1000; // 45 minutes in milliseconds

// Helper function to calculate remaining time (countdown from 45 minutes)
const calculateRemainingTime = (
  acceptedAt: string,
  endTime?: Date
): { time: string; isExpired: boolean } => {
  try {
    const acceptedDate = new Date(acceptedAt);
    const currentTime = endTime || new Date();
    const elapsedMs = currentTime.getTime() - acceptedDate.getTime();

    // Calculate remaining time
    const remainingMs = TOTAL_PREP_TIME_MS - elapsedMs;

    // If time has run out, show negative time
    if (remainingMs <= 0) {
      const overtimeMs = Math.abs(remainingMs);
      const totalSeconds = Math.floor(overtimeMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return {
        time: `-${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`,
        isExpired: true,
      };
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      time: `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
      isExpired: false,
    };
  } catch (error) {
    console.error("Error calculating remaining time:", error);
    return { time: "45:00", isExpired: false };
  }
};

export function OrderTimer({
  acceptedAt,
  orderStatus,
  updatedAt,
  className = "",
}: OrderTimerProps) {
  // Initialize state with calculated time immediately
  const getInitialTime = (): { time: string; isExpired: boolean } => {
    if (!acceptedAt) return { time: "", isExpired: false };
    const isTerminalState =
      orderStatus === "completed" ||
      orderStatus === "cancelled" ||
      orderStatus === "denied";
    if (isTerminalState && updatedAt) {
      return calculateRemainingTime(acceptedAt, new Date(updatedAt));
    }
    return calculateRemainingTime(acceptedAt);
  };

  const [timerState, setTimerState] = useState<{
    time: string;
    isExpired: boolean;
  }>(getInitialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const updatedAtRef = useRef<string | null | undefined>(updatedAt);

  // Update ref when updatedAt changes, but don't trigger effect
  useEffect(() => {
    updatedAtRef.current = updatedAt;
  }, [updatedAt]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!acceptedAt) {
      setTimerState({ time: "", isExpired: false });
      return;
    }

    // Check if order is in a terminal state (completed, cancelled, denied)
    const isTerminalState =
      orderStatus === "completed" ||
      orderStatus === "cancelled" ||
      orderStatus === "denied";

    // If terminal state, use updatedAt as the completion time (frozen time)
    if (isTerminalState) {
      // Use updatedAt from ref if available, otherwise use current time (fallback)
      const completionTime = updatedAtRef.current
        ? new Date(updatedAtRef.current)
        : new Date();
      const frozenState = calculateRemainingTime(acceptedAt, completionTime);
      setTimerState(frozenState);
      return; // Don't set up interval for terminal states
    }

    // Initial calculation for active orders - set immediately
    const initialState = calculateRemainingTime(acceptedAt);
    setTimerState(initialState);

    // Update every second for active orders
    intervalRef.current = setInterval(() => {
      const currentState = calculateRemainingTime(acceptedAt);
      setTimerState(currentState);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [acceptedAt, orderStatus, updatedAt]);

  if (!acceptedAt) {
    return null;
  }

  // Show timer even if time is empty initially (will be set by effect)
  if (!timerState.time) {
    return (
      <div className={`flex items-center gap-1 text-sm font-mono ${className}`}>
        <Clock className="h-3.5 w-3.5" />
        <span>45:00</span>
      </div>
    );
  }

  // Apply red color when timer expires
  const timerColor = timerState.isExpired ? "text-red-600" : "";

  return (
    <div
      className={`flex items-center gap-1 text-sm font-mono ${className} ${timerColor}`}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{timerState.time}</span>
    </div>
  );
}
