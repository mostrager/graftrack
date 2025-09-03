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
        
        // Update heading if available from GPS
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
      if ((event as any).webkitCompassHeading !== undefined) {
        // iOS devices with compass
        const compassHeading = (event as any).webkitCompassHeading;
        setUserHeading(compassHeading);
      } else if (event.alpha !== null && event.absolute) {
        // Android devices - use absolute orientation
        // Convert alpha to compass heading (0 = North)
        const heading = (360 - event.alpha) % 360;
        setUserHeading(heading);
      } else if (event.alpha !== null) {
        // Fallback for relative orientation
        const heading = event.alpha;
        setUserHeading(heading);
      }
    };

    // Function to request permission and start listening
    const startCompass = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ requires permission
        try {
          const response = await (DeviceOrientationEvent as any).requestPermission();
          if (response === 'granted') {
            window.addEventListener('deviceorientationabsolute', handleOrientation);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        // Non-iOS devices or older iOS
        window.addEventListener('deviceorientationabsolute', handleOrientation);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };
    
    startCompass();

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

    // Create custom north arrow icon for user location
    const northArrowIcon = L.divIcon({
      html: `
        <div style="
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <!-- Pulsing glow -->
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <!-- North Arrow Container -->
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            transform: rotate(${userHeading}deg);
            transition: transform 0.3s ease;
          ">
            <!-- Arrow shape -->
            <svg width="40" height="40" viewBox="0 0 40 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
              <!-- North pointer (blue) -->
              <path d="M20,8 L25,25 L20,22 L15,25 Z" fill="#2563eb" stroke="white" stroke-width="1"/>
              <!-- South pointer (white) -->
              <path d="M20,32 L15,15 L20,18 L25,15 Z" fill="white" stroke="#2563eb" stroke-width="1"/>
              <!-- Center dot -->
              <circle cx="20" cy="20" r="3" fill="#2563eb" stroke="white" stroke-width="1"/>
            </svg>
            <!-- N label -->
            <div style="
              position: absolute;
              top: -5px;
              left: 17px;
              color: white;
              font-size: 10px;
              font-weight: bold;
              text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            ">N</div>
          </div>
          <!-- Heading display -->
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
          ">${Math.round(userHeading)}°</div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      className: '',
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });

    // Add user marker with north arrow
    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: northArrowIcon,
      zIndexOffset: 1000
    }).addTo(mapInstanceRef.current);

    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>Your Location</strong><br>
        <small>Heading: ${Math.round(userHeading)}°</small>
      </div>
    `);
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

    // Add new location markers with directional indicators if available
    locations.forEach(location => {
      // Check if location has heading data
      const headings = (location as any).photoHeadings as number[] | undefined;
      const primaryHeading = headings && headings.length > 0 ? headings[0] : null;
      
      let markerIcon;
      if (primaryHeading !== null && primaryHeading > 0) {
        // Create custom icon with directional indicator
        markerIcon = L.divIcon({
          html: `
            <div style="
              width: 35px;
              height: 45px;
              position: relative;
            ">
              <!-- Direction indicator -->
              <div style="
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%) rotate(${primaryHeading}deg);
                transform-origin: center 22px;
              ">
                <svg width="35" height="45" viewBox="0 0 35 45">
                  <!-- Field of view arc -->
                  <path d="M17.5,22 L10,5 A 15 15 0 0 1 25,5 Z" 
                    fill="rgba(255, 102, 0, 0.3)" 
                    stroke="rgba(255, 102, 0, 0.6)" 
                    stroke-width="1"/>
                </svg>
              </div>
              <!-- Standard marker pin -->
              <div style="
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
              ">
                <svg width="25" height="41" viewBox="0 0 25 41">
                  <path d="M12.5,0 C5.6,0 0,5.6 0,12.5 C0,21.9 12.5,41 12.5,41 S25,21.9 25,12.5 C25,5.6 19.4,0 12.5,0 Z" 
                    fill="#ff6600" 
                    stroke="white" 
                    stroke-width="2"/>
                  <circle cx="12.5" cy="12.5" r="4" fill="white"/>
                </svg>
              </div>
              <!-- Heading label -->
              <div style="
                position: absolute;
                top: -8px;
                right: -5px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 1px 3px;
                border-radius: 8px;
                font-size: 9px;
                font-weight: bold;
              ">${Math.round(primaryHeading)}°</div>
            </div>
          `,
          className: '',
          iconSize: [35, 45],
          iconAnchor: [17.5, 41],
          popupAnchor: [0, -41]
        });
      } else {
        // Use default marker
        markerIcon = new L.Icon.Default();
      }
      
      const marker = L.marker([location.latitude, location.longitude], {
        icon: markerIcon
      }).addTo(mapInstanceRef.current!);
      
      marker.bindPopup(`
        <div style="min-width: 150px;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">${location.title || "Graffiti Spot"}</p>
          ${location.city ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${location.city}</p>` : ''}
          ${primaryHeading ? `<p style="margin: 0 0 4px 0; font-size: 11px; color: #888;">📷 Heading: ${Math.round(primaryHeading)}°</p>` : ''}
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