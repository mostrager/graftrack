import { useEffect, useRef } from "react";
import L from "leaflet";
import { GraffitiLocation } from "@shared/schema";

// Fix for default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: { lat: number; lng: number };
  locations: GraffitiLocation[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (location: GraffitiLocation) => void;
  isAddingLocation: boolean;
  userLocation?: { lat: number; lng: number };
}

export default function MapView({ 
  center, 
  locations, 
  onMapClick, 
  onMarkerClick, 
  isAddingLocation,
  userLocation 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 13);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Map click handler
    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update map center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], 15);
    }
  }, [center]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    locations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(mapInstanceRef.current!);

      // Create popup content
      const firstPhotoUrl = location.photos && location.photos.length > 0 
        ? location.photos[0] 
        : null;

      const popupContent = `
        <div class="min-w-48">
          ${firstPhotoUrl ? `
            <div class="mb-2">
              <img src="${firstPhotoUrl}" 
                   alt="Graffiti photo" 
                   class="w-full h-24 object-cover rounded-lg">
            </div>
          ` : ''}
          <div class="space-y-2">
            <p class="font-medium text-sm">${location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</p>
            ${location.tags && location.tags.length > 0 ? `
              <p class="text-xs text-gray-600">${location.tags.join(', ')}</p>
            ` : ''}
            <button onclick="window.showLocationDetails('${location.id}')" 
                    class="w-full bg-primary text-primary-foreground text-xs py-2 px-3 rounded-md hover:bg-primary/90 transition-colors">
              View Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Make showLocationDetails globally available
    (window as any).showLocationDetails = (locationId: string) => {
      const location = locations.find(l => l.id === locationId);
      if (location) {
        onMarkerClick(location);
      }
    };
  }, [locations, onMarkerClick]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
    }

    // Create custom user location icon
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: #3b82f6; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 40px; 
            height: 40px; 
            background: rgba(59, 130, 246, 0.2); 
            border-radius: 50%; 
            position: absolute; 
            top: -13px; 
            left: -13px;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Add user location marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
      icon: userIcon,
      zIndexOffset: 1000 // Keep it above other markers
    }).addTo(mapInstanceRef.current);

    userMarker.bindPopup(`
      <div class="text-center">
        <p class="font-medium text-sm mb-1">📍 Your Location</p>
        <p class="text-xs text-gray-600">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</p>
      </div>
    `);

    userMarkerRef.current = userMarker;

  }, [userLocation]);

  // Update cursor style when adding location
  useEffect(() => {
    if (mapInstanceRef.current) {
      const container = mapInstanceRef.current.getContainer();
      if (isAddingLocation) {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
    }
  }, [isAddingLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      data-testid="map-container"
    />
  );
}
