import { useEffect, useRef } from "react";
import L from "leaflet";
import { GraffitiLocation } from "@shared/schema";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapViewProps {
  center: { lat: number; lng: number };
  locations: GraffitiLocation[];
  onMapClick: (lat: number, lng: number) => void;
  isAddingLocation: boolean;
  tempMarkerPosition?: { lat: number; lng: number } | null;
}

export default function SimpleMapView({ 
  center, 
  locations, 
  onMapClick, 
  isAddingLocation,
  tempMarkerPosition
}: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log("Initializing map...");
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle map clicks
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      console.log("Map clicked!", e.latlng.lat, e.latlng.lng, "isAddingLocation:", isAddingLocation);
      if (isAddingLocation) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    mapInstanceRef.current.on('click', handleClick);

    return () => {
      mapInstanceRef.current?.off('click', handleClick);
    };
  }, [isAddingLocation, onMapClick]);

  // Show temp marker when position changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old temp marker
    if (tempMarkerRef.current) {
      mapInstanceRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }

    // Add new temp marker
    if (tempMarkerPosition) {
      console.log("Adding red marker at:", tempMarkerPosition);
      
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = L.marker([tempMarkerPosition.lat, tempMarkerPosition.lng], {
        icon: redIcon
      }).addTo(mapInstanceRef.current);

      marker.bindPopup("New location - click Save to confirm").openPopup();
      tempMarkerRef.current = marker;
    }
  }, [tempMarkerPosition]);

  // Show saved locations
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    locations.forEach(location => {
      L.marker([location.latitude, location.longitude])
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div>
            <p class="font-medium">${(location as any).title || location.description || "Graffiti Location"}</p>
            <p class="text-xs">${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
          </div>
        `);
    });
  }, [locations]);

  // Update cursor
  useEffect(() => {
    if (mapInstanceRef.current) {
      const container = mapInstanceRef.current.getContainer();
      container.style.cursor = isAddingLocation ? 'crosshair' : '';
    }
  }, [isAddingLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ position: 'relative', zIndex: 0 }}
    />
  );
}