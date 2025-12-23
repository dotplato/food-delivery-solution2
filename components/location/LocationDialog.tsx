"use client";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { RESTAURANT_LOCATION } from "./LeafletMap";
import { Button } from "../ui/button";

const GoogleMapPicker = dynamic(() => import("./LeafletMap"), { ssr: false });

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationDialog({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (loc: { lat: number; lng: number; address: string, isWithinDeliveryArea: boolean, deliveryDistance: number }) => void; }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [isWithinDeliveryArea, setIsWithinDeliveryArea] = useState(true);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  // Set initial position to restaurant if not set
  useEffect(() => {
    if (open && !position) {
      setPosition([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]);
    }
  }, [open, position]);

  // Robustly check if Google APIs are ready (poll for up to 2 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;
    function checkGoogleReady() {
      if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.places) {
        setGoogleReady(true);
        if (!autocompleteServiceRef.current) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
        if (!geocoderRef.current) {
          geocoderRef.current = new window.google.maps.Geocoder();
        }
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
      }
    }
    if (!googleReady && open) {
      checkGoogleReady();
      interval = setInterval(checkGoogleReady, 100);
      timeout = setTimeout(() => {
        if (interval) clearInterval(interval);
        if (!googleReady) setLoadError("Google Maps Places library failed to load. Check your API key and library settings.");
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [open, googleReady]);

  // Reverse geocode when position changes (Google Geocoding API via SDK)
  useEffect(() => {
    if (position && geocoderRef.current) {
      const [lat, lng] = position;
      geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress("");
        }
      });
    }
  }, [position]);

  // Calculate delivery distance and check if within 8 miles
  useEffect(() => {
    if (position) {
      const dist = haversineDistance(
        position[0],
        position[1],
        RESTAURANT_LOCATION.lat,
        RESTAURANT_LOCATION.lng
      );
      setDeliveryDistance(dist);
      setIsWithinDeliveryArea(dist <= 8);
    } else {
      setDeliveryDistance(null);
      setIsWithinDeliveryArea(true);
    }
  }, [position]);

  // Search for address (Google Places Autocomplete via SDK)
  useEffect(() => {
    if (!search || !googleReady || !mapLoaded) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (autocompleteServiceRef.current) {
        autocompleteServiceRef.current.getPlacePredictions({ input: search }, (predictions: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions);
          } else {
            setSearchResults([]);
          }
        });
      }
    }, 400);
  }, [search, googleReady, mapLoaded]);

  // Set marker when search result is clicked (get place details for lat/lng via SDK)
  const handleResultClick = (result: any) => {
    if (!placesServiceRef.current && mapRef.current && window.google && window.google.maps.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
    }
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails({ placeId: result.place_id }, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          setPosition([place.geometry.location.lat(), place.geometry.location.lng()]);
          setSearchResults([]);
          setSearch(result.description);
        }
      });
    }
  };

  // Save location
  const handleSave = () => {
    if (position && address && typeof deliveryDistance === 'number' && typeof isWithinDeliveryArea === 'boolean' && isWithinDeliveryArea) {
      const [lat, lng] = position;
      localStorage.setItem("user_location", JSON.stringify({ lat, lng, address, isWithinDeliveryArea, deliveryDistance }));
      onSelect({ lat, lng, address, isWithinDeliveryArea, deliveryDistance });
      onClose();
    }
  };

  // Pass map ref to GoogleMapPicker for PlacesService
  const handleMapLoad = (map: any) => {
    mapRef.current = map;
    setMapLoaded(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
        </DialogHeader>
        {loadError && (
          <div className="text-brand-600 mb-4">{loadError}</div>
        )}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a location..."
            className="w-full px-3 py-2 rounded border border-gray-300 mb-2"
            disabled={!googleReady || !mapLoaded}
          />
          {searchResults.length > 0 && (
            <div className="bg-white border rounded shadow max-h-40 overflow-y-auto z-50 relative">
              {searchResults.map((result: any, i: number) => (
                <div
                  key={i}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleResultClick(result)}
                >
                  {result.description}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-64 w-full rounded overflow-hidden mb-4">
          <GoogleMapPicker position={position} setPosition={setPosition} onMapLoad={handleMapLoad} />
        </div>
        <div className="mb-4 text-sm text-gray-700 min-h-[2em]">
          {address ? <span>Selected Address: <b>{address}</b></span> : <span className="text-gray-400">No address selected</span>}
        </div>
        {deliveryDistance !== null && (
          <div className={isWithinDeliveryArea ? "text-green-700 mb-2" : "text-brand-600 mb-2 font-semibold"}>
            {isWithinDeliveryArea
              ? `You are within our delivery area (${deliveryDistance.toFixed(2)} miles from the restaurant).`
              : `Sorry, you are outside our delivery area (${deliveryDistance.toFixed(2)} miles from the restaurant). Only pickup is available.`}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !position ||
              !address ||
              typeof deliveryDistance !== "number" ||
              !isWithinDeliveryArea
            }
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
            title={
              !isWithinDeliveryArea
                ? "Delivery is not available for this location. Please select a location within 8 miles."
                : ""
            }
          >
            Save Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 