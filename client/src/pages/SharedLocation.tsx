import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GraffitiLocation } from "@shared/schema";
import { MapPin, SprayCan, Calendar, Tag, Home, LogIn } from "lucide-react";
import { format } from "date-fns";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function SharedLocation() {
  const { id } = useParams();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch location data (public endpoint)
  const { data: location, isLoading, error } = useQuery<GraffitiLocation>({
    queryKey: [`/api/locations/shared/${id}`],
    retry: false,
  });

  useEffect(() => {
    if (location && !mapLoaded) {
      const map = L.map('shared-map').setView(
        [location.latitude, location.longitude], 
        15
      );
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      L.marker([location.latitude, location.longitude])
        .addTo(map)
        .bindPopup(location.title)
        .openPopup();
      
      setMapLoaded(true);
    }
  }, [location, mapLoaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <SprayCan className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Location Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This graffiti spot might have been removed or the link is invalid.
          </p>
          <Link href="/">
            <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium">
              Go to GrafTrack
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <SprayCan className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl heading">GRAFTRACK</h1>
              <p className="text-xs text-muted-foreground">Shared Location</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/">
              <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Home className="w-5 h-5" />
              </button>
            </Link>
            <a href="/api/login">
              <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Title and Info */}
        <div className="bg-card rounded-xl p-6 mb-4">
          <h2 className="text-2xl font-bold mb-2">{location.title}</h2>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            {location.city && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{location.city}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(location.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {location.description && (
            <p className="text-foreground mb-4">{location.description}</p>
          )}

          {location.tags && location.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {location.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-secondary rounded-full text-sm flex items-center space-x-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-card rounded-xl overflow-hidden mb-4">
          <div id="shared-map" className="h-96 w-full"></div>
        </div>

        {/* Photos */}
        {location.photos && location.photos.length > 0 && (
          <div className="bg-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {location.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${location.title} photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mt-6 text-center">
          <h3 className="font-semibold mb-2">Want to track your own graffiti discoveries?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join GrafTrack to save locations, upload photos, and share with the community.
          </p>
          <a href="/api/login">
            <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium">
              Sign Up Free
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}