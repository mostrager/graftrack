import { useState } from "react";
import { X, MapPin, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddProspectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPosition: { lat: number; lng: number };
  onSave: (prospectData: any) => void;
  isLoading: boolean;
}

export default function AddProspectPanel({ 
  isOpen, 
  onClose, 
  currentPosition, 
  onSave, 
  isLoading 
}: AddProspectPanelProps) {
  const [notes, setNotes] = useState("");
  const [city, setCity] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    console.log("=== SAVE PROSPECT CLICKED ===");
    console.log("Saving prospect at:", currentPosition.lat, currentPosition.lng);
    
    const prospectData = {
      latitude: currentPosition.lat,
      longitude: currentPosition.lng,
      notes: notes.trim() || undefined,
      city: city.trim() || undefined,
    };

    console.log("Prospect data being saved:", prospectData);
    onSave(prospectData);
    
    // Reset form
    setNotes("");
    setCity("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-end transition-opacity duration-300 ${
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`relative w-full bg-card rounded-t-2xl max-h-[70vh] overflow-hidden transform transition-transform duration-300 safe-bottom ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}>
        {/* Handle Bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>
        
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="heading font-bold text-xl">ADD PROSPECT</h3>
            <button 
              className="p-2 touch-target" 
              onClick={onClose}
              data-testid="button-close-prospect-panel"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>
      
        <div className="px-4 pb-4 overflow-y-auto max-h-[calc(70vh-120px)]">
          {/* Location Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm" data-testid="text-prospect-coordinates">
                  {currentPosition ? `${currentPosition.lat.toFixed(4)}, ${currentPosition.lng.toFixed(4)}` : 'Loading...'}
                </p>
                <p className="text-xs text-muted-foreground">Prospect location</p>
              </div>
              <button className="min-h-11 min-w-11 p-2 text-accent">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Prospect spots</strong> are potential locations for future graffiti. Mark walls, surfaces, or areas you want to revisit later.
            </p>
          </div>

          {/* Notes Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Notes (Optional)</label>
            <textarea 
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent min-h-[100px]" 
              placeholder="What makes this a good spot? Any access details, visibility notes, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="textarea-notes"
            />
          </div>

          {/* City Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">City (Optional)</label>
            <input 
              className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent" 
              placeholder="Enter the city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-testid="input-prospect-city"
            />
          </div>
        </div>

        {/* Footer with Save Button */}
        <div className="px-4 pb-4 border-t">
          <button 
            className={`w-full p-4 rounded-xl font-bold text-lg transition-all ${
              isLoading 
                ? "bg-muted text-muted-foreground" 
                : "bg-red-600 hover:bg-red-700 text-white active:scale-95"
            }`}
            onClick={handleSave}
            disabled={isLoading}
            data-testid="button-save-prospect"
          >
            {isLoading ? "SAVING..." : "MARK PROSPECT"}
          </button>
        </div>
      </div>
    </div>
  );
}