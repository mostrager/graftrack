import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraffitiLocation, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import EnhancedMapView from "@/components/EnhancedMapView";
import MobileHeader from "@/components/MobileHeader";
import MobileNavBar from "@/components/MobileNavBar";
import MobileProfilePanel from "@/components/MobileProfilePanel";
import AddLocationPanel from "@/components/AddLocationPanel";
import LocationDetailsPanel from "@/components/LocationDetailsPanel";
import CompassButton from "@/components/CompassButton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Target } from "lucide-react";

export default function Home() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GraffitiLocation | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [newLocationPosition, setNewLocationPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth() as { user: User | null; isLoading: boolean; isAuthenticated: boolean };

  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery<GraffitiLocation[]>({
    queryKey: ["/api/locations"],
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const locationWithUser = {
        ...locationData,
        userId: user?.id, // Use authenticated user's ID
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
    console.log("=== MAP CLICKED ===");
    console.log("Coordinates:", lat, lng);
    console.log("isAddingLocation:", isAddingLocation);
    console.log("==================");
    
    if (isAddingLocation) {
      console.log("SETTING NEW MARKER POSITION:", lat, lng);
      setNewLocationPosition({ lat, lng });
      setIsAddingLocation(false);
      // Small delay to ensure state updates properly
      setTimeout(() => {
        console.log("OPENING ADD PANEL...");
        setShowAddPanel(true);
      }, 100);
      toast({
        title: "Location Marked!",
        description: "Fill out the details below",
      });
    }
  };

  const handleMarkerClick = (location: GraffitiLocation) => {
    setSelectedLocation(location);
    setShowDetailsPanel(true);
  };

  const handleAddLocationClick = () => {
    console.log("=== + BUTTON CLICKED ===");
    console.log("Current isAddingLocation:", isAddingLocation);
    
    if (isAddingLocation) {
      console.log("CANCELLING ADD MODE");
      setIsAddingLocation(false);
      setNewLocationPosition(null);
      toast({
        title: "Cancelled",
        description: "Location adding cancelled",
      });
    } else {
      console.log("ENTERING ADD MODE");
      setIsAddingLocation(true);
      setNewLocationPosition(null);
      setShowAddPanel(false);
      toast({
        title: "Add Mode Active",
        description: "Now tap on the map to place a marker",
      });
    }
    console.log("New isAddingLocation:", !isAddingLocation);
    console.log("=======================");
  };

  const handleSaveLocation = (locationData: any) => {
    createLocationMutation.mutate(locationData);
  };

  const handleLogOut = () => {
    window.location.href = "/api/logout";
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
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Mobile Header */}
      <MobileHeader locationCount={locations.length} />

      {/* Map Container - Full Screen */}
      <div className="flex-1 relative z-0" style={{ paddingTop: '56px', paddingBottom: '64px' }}>
        <CompassButton />
        <EnhancedMapView
          center={currentPosition}
          locations={locations}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          isAddingLocation={isAddingLocation}
          tempMarkerPosition={newLocationPosition}
        />
        
        {/* Target indicator when in add mode */}
        {isAddingLocation && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Target className="w-8 h-8 text-accent animate-pulse" />
              <p className="mt-2 px-4 py-2 bg-accent/90 text-accent-foreground rounded-full text-sm font-medium street-text">
                TAP MAP TO MARK SPOT
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar 
        onAddClick={handleAddLocationClick}
        onProfileClick={() => setShowProfilePanel(true)}
        onListClick={() => {
          toast({
            title: "Coming Soon",
            description: "List view will be available soon!",
          });
        }}
        isAddingLocation={isAddingLocation}
      />

      {/* Add Location Panel */}
      {(newLocationPosition || currentPosition) && (
        <AddLocationPanel
          isOpen={showAddPanel}
          onClose={() => {
            setShowAddPanel(false);
            setIsAddingLocation(false);
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

      {/* Profile Panel */}
      <MobileProfilePanel
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        user={user}
        locationCount={locations.length}
        onLogout={handleLogOut}
      />
    </div>
  );
}