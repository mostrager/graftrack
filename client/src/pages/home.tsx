import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraffitiLocation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import MapView from "@/components/MapView";
import TopBar from "@/components/TopBar";
import AddLocationPanel from "@/components/AddLocationPanel";
import LocationDetailsPanel from "@/components/LocationDetailsPanel";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target } from "lucide-react";

export default function Home() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GraffitiLocation | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery<GraffitiLocation[]>({
    queryKey: ["/api/locations"],
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const response = await apiRequest("POST", "/api/locations", locationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setShowAddPanel(false);
      setIsAddingLocation(false);
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
    if (isAddingLocation) {
      setCurrentPosition({ lat, lng });
      setShowAddPanel(true);
      setIsAddingLocation(false);
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
      <TopBar locationCount={locations.length} />

      {/* Map Container */}
      <div className="pt-20 h-screen">
        <MapView
          center={currentPosition}
          locations={locations}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          isAddingLocation={isAddingLocation}
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
      <AddLocationPanel
        isOpen={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        currentPosition={currentPosition}
        onSave={handleSaveLocation}
        isLoading={createLocationMutation.isPending}
      />

      {/* Location Details Panel */}
      <LocationDetailsPanel
        isOpen={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        location={selectedLocation}
      />
    </div>
  );
}
