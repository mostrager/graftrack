import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { GraffitiLocation } from "@shared/schema";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import { initializeMapRotation } from "@/lib/leaflet-rotate";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EnhancedMapViewProps {
  center: { lat: number; lng: number };
  locations: GraffitiLocation[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick?: (location: GraffitiLocation) => void;
  isAddingLocation: boolean;
  tempMarkerPosition?: { lat: number; lng: number } | null;
}

export default function EnhancedMapView({ 
  center, 
  locations, 
  onMapClick, 
  onMarkerClick,
  isAddingLocation,
  tempMarkerPosition
}: EnhancedMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const locationMarkersRef = useRef<L.Marker[]>([]);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Initialize map with rotation support
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log("Initializing enhanced map...");
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      // Enable touch gestures
      touchZoom: true,
      doubleClickZoom: true,
      dragging: true,
      boxZoom: false
    });
    
    mapInstanceRef.current = map;
    
    // Initialize rotation support
    initializeMapRotation(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    // Add control buttons
    const CustomControls = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        
        // Reset North button
        const resetButton = L.DomUtil.create('a', '', container);
        resetButton.innerHTML = '🧭';
        resetButton.title = 'Reset North';
        resetButton.href = '#';
        resetButton.style.fontSize = '20px';
        resetButton.style.lineHeight = '30px';
        resetButton.style.textAlign = 'center';
        resetButton.style.width = '34px';
        resetButton.style.height = '34px';
        resetButton.style.display = 'block';
        
        L.DomEvent.on(resetButton, 'click', function(e: Event) {
          e.preventDefault();
          if (mapInstanceRef.current) {
            (mapInstanceRef.current as any).resetBearing();
          }
        });
        
        // Center on user button
        const centerButton = L.DomUtil.create('a', '', container);
        centerButton.innerHTML = '📍';
        centerButton.title = 'My Location';
        centerButton.href = '#';
        centerButton.style.fontSize = '20px';
        centerButton.style.lineHeight = '30px';
        centerButton.style.textAlign = 'center';
        centerButton.style.width = '34px';
        centerButton.style.height = '34px';
        centerButton.style.display = 'block';
        centerButton.style.borderTop = '1px solid #ccc';
        
        L.DomEvent.on(centerButton, 'click', function(e: Event) {
          e.preventDefault();
          if (mapInstanceRef.current && userLocation) {
            mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 17);
          }
        });
        
        return container;
      }
    });
    
    new CustomControls({ position: 'topright' }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Track user location and heading
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        
        // Update heading if available
        if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
          setUserHeading(position.coords.heading);
        }
      },
      (error) => {
        console.error("Error tracking location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    // Also listen for device orientation for heading
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if ((event as any).webkitCompassHeading) {
        // iOS devices
        setUserHeading((event as any).webkitCompassHeading);
      } else if (event.alpha !== null) {
        // Android devices
        // Convert alpha to compass heading
        const heading = (360 - event.alpha) % 360;
        setUserHeading(heading);
      }
    };

    // Request permission for iOS devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientationabsolute', handleOrientation);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS devices
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Update user marker with directional arrow
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    // Create custom arrow icon for user location
    const arrowIcon = L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <!-- Blue pulsing circle -->
          <div style="
            position: absolute;
            width: 30px;
            height: 30px;
            background: rgba(37, 99, 235, 0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <!-- Blue dot -->
          <div style="
            position: absolute;
            width: 12px;
            height: 12px;
            background: #2563eb;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 2;
          "></div>
          <!-- Direction arrow -->
          <div style="
            position: absolute;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 20px solid #2563eb;
            transform: rotate(${userHeading}deg) translateY(-10px);
            transform-origin: center bottom;
            z-index: 1;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add user marker
    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: arrowIcon,
      zIndexOffset: 1000
    }).addTo(mapInstanceRef.current);

    marker.bindPopup("Your Location");
    userMarkerRef.current = marker;

  }, [userLocation, userHeading]);

  // Handle map clicks
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      console.log("Map clicked at:", e.latlng);
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    mapInstanceRef.current.on('click', handleClick);

    return () => {
      mapInstanceRef.current?.off('click', handleClick);
    };
  }, [onMapClick]);

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
      console.log("Adding temp marker at:", tempMarkerPosition);
      
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

      marker.bindPopup("New graffiti spot - tap Save to confirm").openPopup();
      tempMarkerRef.current = marker;
      
      // Pan to the new marker
      mapInstanceRef.current.setView([tempMarkerPosition.lat, tempMarkerPosition.lng], 17);
    }
  }, [tempMarkerPosition]);

  // Show saved locations
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old location markers
    locationMarkersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    locationMarkersRef.current = [];

    // Add new location markers
    locations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="min-width: 150px;">
            <p style="font-weight: 600; margin: 0 0 4px 0;">${location.title || "Graffiti Spot"}</p>
            ${location.city ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${location.city}</p>` : ''}
            <p style="margin: 0; font-size: 11px; color: #888;">${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
          </div>
        `);
      
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(location));
      }
      
      locationMarkersRef.current.push(marker);
    });
  }, [locations, onMarkerClick]);

  // Update cursor for add mode
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