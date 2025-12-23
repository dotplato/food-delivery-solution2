"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useRef } from "react";

export const RESTAURANT_LOCATION = { lat: 53.23674334142961, lng: -1.4252599604172964 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

export default function GoogleMapPicker({ position, setPosition, onMapLoad }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void, onMapLoad?: (map: any) => void }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '',
    libraries: ['places'],
  });
  const mapRef = useRef<any>(null);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition([e.latLng.lat(), e.latLng.lng()]);
    }
  }, [setPosition]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition([e.latLng.lat(), e.latLng.lng()]);
    }
  }, [setPosition]);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={position ? { lat: position[0], lng: position[1] } : RESTAURANT_LOCATION}
      zoom={position ? 17 : 13}
      onClick={onMapClick}
      onLoad={map => {
        mapRef.current = map;
        if (onMapLoad) onMapLoad(map);
      }}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {position && (
        <Marker
          position={{ lat: position[0], lng: position[1] }}
          draggable
          onDragEnd={onMarkerDragEnd}
        />
      )}
    </GoogleMap>
  );
} 