import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraffitiLocation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import MapView from "@/components/MapView";
import TopBar from "@/components/TopBar";
import AddLocationPanel from "@/components/AddLocationPanel";
import LocationDetailsPanel from "@/components/LocationDetailsPanel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { logOut } from "@/lib/firebase";
import { Plus, Target, LogOut, SprayCan } from "lucide-react";

export default function Home() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GraffitiLocation | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [newLocationPosition, setNewLocationPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery<GraffitiLocation[]>({
    queryKey: ["/api/locations"],
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const locationWithUser = {
        ...locationData,
        userId: user?.uid || "demo-user", // Ensure we have a userId even in demo mode
      };
      const response = await apiRequest("POST", "/api/locations", locationWithUser);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setShowAddPanel(false);
      setIsAddingLocation(false);
      setNewLocationPosition(null);
      toast({
        title: "Success",
        description: "Location saved successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating location:", error);
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get user's current position
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to New York City
          setCurrentPosition({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      // Default to New York City
      setCurrentPosition({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    console.log("Map clicked at:", lat, lng, "isAddingLocation:", isAddingLocation);
    if (isAddingLocation) {
      // When in adding mode, set the new location position (this will show a red marker)
      setNewLocationPosition({ lat, lng });
      console.log("Red marker should appear at:", lat, lng);
      // Don't open panel yet - wait for user to confirm
      toast({
        title: "Location Marked",
        description: "Tap 'Save Location' in the panel below to confirm this spot",
      });
      // Open the panel after a short delay
      setTimeout(() => {
        setShowAddPanel(true);
        setIsAddingLocation(false);
      }, 500);
    } else {
      // When not in adding mode, show a toast to prompt user
      toast({
        title: "Add Location Here?",
        description: "Tap the + button and then tap on the map to add a graffiti location",
      });
    }
  };

  const handleMarkerClick = (location: GraffitiLocation) => {
    setSelectedLocation(location);
    setShowDetailsPanel(true);
  };

  const handleAddLocationClick = () => {
    if (isAddingLocation) {
      setIsAddingLocation(false);
      toast({
        title: "Cancelled",
        description: "Location adding cancelled",
      });
    } else {
      setIsAddingLocation(true);
      toast({
        title: "Add Location",
        description: "Tap on the map to add a graffiti location",
      });
    }
  };

  const handleSaveLocation = (locationData: any) => {
    createLocationMutation.mutate(locationData);
  };

  const handleLogOut = () => {
    logOut();
  };

  if (!currentPosition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-b border-border z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <SprayCan className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <h1 className="heading font-bold text-xl text-foreground tracking-wide">GrafTrack</h1>
              <p className="text-xs text-muted-foreground street-text" data-testid="text-location-count">
                {locations.length} location{locations.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-3 mr-2">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-user-avatar"
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  {user.displayName || user.email}
                </span>
              </div>
            )}
            <button 
              className="min-h-11 min-w-11 p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              onClick={handleLogOut}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="pt-20 h-screen">
        <MapView
          center={currentPosition}
          locations={locations}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          isAddingLocation={isAddingLocation}
          userLocation={currentPosition}
          tempMarkerPosition={newLocationPosition}
        />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleAddLocationClick}
        className={`fixed bottom-8 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isAddingLocation
            ? "bg-destructive text-destructive-foreground"
            : "bg-accent text-accent-foreground"
        }`}
        data-testid="button-add-location"
      >
        {isAddingLocation ? <Target className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Add Location Panel */}
      {(newLocationPosition || currentPosition) && (
        <AddLocationPanel
          isOpen={showAddPanel}
          onClose={() => {
            setShowAddPanel(false);
            setNewLocationPosition(null);
          }}
          currentPosition={newLocationPosition || currentPosition!}
          onSave={handleSaveLocation}
          isLoading={createLocationMutation.isPending}
        />
      )}

      {/* Location Details Panel */}
      <LocationDetailsPanel
        isOpen={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        location={selectedLocation}
      />
    </div>
  );
}