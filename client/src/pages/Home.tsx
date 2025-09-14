import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraffitiLocation, User, Prospect } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import EnhancedMapView from "@/components/EnhancedMapView";
import MobileHeader from "@/components/MobileHeader";
import MobileNavBar from "@/components/MobileNavBar";
import MobileProfilePanel from "@/components/MobileProfilePanel";
import AddLocationPanel from "@/components/AddLocationPanel";
import AddProspectPanel from "@/components/AddProspectPanel";
import LocationDetailsPanel from "@/components/LocationDetailsPanel";
import CompassButton from "@/components/CompassButton";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

export default function Home() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [addMode, setAddMode] = useState<"graffiti" | "prospect">("graffiti");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showProspectPanel, setShowProspectPanel] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GraffitiLocation | null>(null);
  // Default to New York City coordinates immediately
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.0060 });
  const [newLocationPosition, setNewLocationPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth() as { user: User | null; isLoading: boolean; isAuthenticated: boolean };

  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery<GraffitiLocation[]>({
    queryKey: ["/api/locations"],
  });

  // Fetch all prospects
  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ["/api/prospects"],
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

  // Create prospect mutation
  const createProspectMutation = useMutation({
    mutationFn: async (prospectData: any) => {
      const prospectWithUser = {
        ...prospectData,
        userId: user?.id,
      };
      const response = await apiRequest("POST", "/api/prospects", prospectWithUser);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      setShowProspectPanel(false);
      setIsAddingLocation(false);
      setNewLocationPosition(null);
      toast({
        title: "Success",
        description: "Prospect marked successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating prospect:", error);
      toast({
        title: "Error",
        description: "Failed to save prospect. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Try to get user's actual position (but start with default)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Update to actual position if available
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep default position
        }
      );
    }
    // Keep default position if geolocation not available
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    console.log("=== MAP CLICKED ===");
    console.log("Coordinates:", lat, lng);
    console.log("isAddingLocation:", isAddingLocation);
    console.log("addMode:", addMode);
    console.log("==================");
    
    if (isAddingLocation) {
      console.log("SETTING NEW MARKER POSITION:", lat, lng);
      setNewLocationPosition({ lat, lng });
      setIsAddingLocation(false);
      // Small delay to ensure state updates properly
      setTimeout(() => {
        if (addMode === "graffiti") {
          console.log("OPENING ADD GRAFFITI PANEL...");
          setShowAddPanel(true);
        } else {
          console.log("OPENING ADD PROSPECT PANEL...");
          setShowProspectPanel(true);
        }
      }, 100);
      toast({
        title: addMode === "graffiti" ? "Location Marked!" : "Prospect Marked!",
        description: addMode === "graffiti" ? "Fill out the details below" : "Add notes about this spot",
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

  const handleSaveProspect = (prospectData: any) => {
    createProspectMutation.mutate(prospectData);
  };

  const handleLogOut = () => {
    window.location.href = "/api/logout";
  };

  // Remove loading state since currentPosition always has a value now

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
          prospects={prospects}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          isAddingLocation={isAddingLocation}
          tempMarkerPosition={newLocationPosition}
        />
        
        {/* Target indicator when in add mode */}
        {isAddingLocation && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Plus className={`w-16 h-16 ${addMode === "graffiti" ? "text-accent" : "text-red-500"} animate-pulse`} />
              <p className={`mt-2 px-4 py-2 ${addMode === "graffiti" ? "bg-accent/90 text-accent-foreground" : "bg-red-500/90 text-white"} rounded-full text-sm font-medium street-text`}>
                {addMode === "graffiti" ? "TAP MAP TO MARK SPOT" : "TAP MAP TO MARK PROSPECT"}
              </p>
            </div>
          </div>
        )}
        
        {/* Mode Toggle */}
        {isAddingLocation && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-card border border-border rounded-full shadow-lg p-1 flex">
              <button
                onClick={() => setAddMode("graffiti")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  addMode === "graffiti" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-mode-graffiti"
              >
                🎨 Graffiti
              </button>
              <button
                onClick={() => setAddMode("prospect")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  addMode === "prospect" 
                    ? "bg-red-500 text-white" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-mode-prospect"
              >
                ❌ Prospect
              </button>
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

      {/* Add Prospect Panel */}
      {(newLocationPosition || currentPosition) && (
        <AddProspectPanel
          isOpen={showProspectPanel}
          onClose={() => {
            setShowProspectPanel(false);
            setIsAddingLocation(false);
            setNewLocationPosition(null);
          }}
          currentPosition={newLocationPosition || currentPosition!}
          onSave={handleSaveProspect}
          isLoading={createProspectMutation.isPending}
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

      {/* Install App Prompt */}
      <InstallAppPrompt />
    </div>
  );
}