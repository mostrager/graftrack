import { X, Calendar, MapPin, Download, Trash2, Edit } from "lucide-react";
import { GraffitiLocation } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ShareLocationButton from "@/components/ShareLocationButton";

interface LocationDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  location: GraffitiLocation | null;
}

export default function LocationDetailsPanel({ 
  isOpen, 
  onClose, 
  location 
}: LocationDetailsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      await apiRequest("DELETE", `/api/locations/${locationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      onClose();
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting location:", error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  if (!isOpen || !location) return null;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      deleteLocationMutation.mutate(location.id);
    }
  };

  // Share is handled by ShareLocationButton component

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const handleExport = () => {
    const exportData = {
      ...location,
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `graffiti-location-${location.id}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Location data downloaded as JSON",
    });
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 rounded-t-2xl max-h-[80vh] overflow-hidden transform transition-transform duration-300 ${
      isOpen ? "translate-y-0" : "translate-y-full"
    }`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="heading font-semibold text-lg">Location Details</h3>
          <div className="flex items-center space-x-2">
            <ShareLocationButton location={location} />
            <button 
              className="min-h-11 min-w-11 p-2 text-accent"
              data-testid="button-edit-location"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button 
              className="min-h-11 min-w-11 p-2" 
              onClick={onClose}
              data-testid="button-close-details-panel"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span data-testid="text-date-added">
            Added {formatDate(location.createdAt)}
          </span>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)]">
        {/* Location Address */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm" data-testid="text-location-address">
                {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        {location.photos && location.photos.length > 0 && (
          <div className="mb-6">
            <h4 className="heading font-medium mb-3 text-sm">Photos</h4>
            <div className="grid grid-cols-2 gap-3">
              {location.photos.map((photoUrl, index) => (
                <div 
                  key={index} 
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                  data-testid={`img-location-photo-${index}`}
                >
                  <img 
                    src={photoUrl} 
                    alt={`Graffiti photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(photoUrl, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {location.description && (
          <div className="mb-6">
            <h4 className="heading font-medium mb-3 text-sm">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-location-description">
              {location.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {location.tags && location.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="heading font-medium mb-3 text-sm">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {location.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20"
                  data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-border">
          <button 
            className="w-full min-h-12 bg-accent text-accent-foreground font-medium py-3 rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center"
            onClick={handleGetDirections}
            data-testid="button-get-directions"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Get Directions
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="min-h-12 bg-secondary text-secondary-foreground font-medium py-3 rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center"
              onClick={handleExport}
              data-testid="button-export-location"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              className="min-h-12 bg-destructive text-destructive-foreground font-medium py-3 rounded-lg hover:bg-destructive/90 transition-colors flex items-center justify-center"
              onClick={handleDelete}
              disabled={deleteLocationMutation.isPending}
              data-testid="button-delete-location"
            >
              {deleteLocationMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
