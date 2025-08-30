import { Settings, List, SprayCan } from "lucide-react";

interface TopBarProps {
  locationCount: number;
}

export default function TopBar({ locationCount }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-b border-border z-40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <SprayCan className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">GraffitiTracker</h1>
            <p className="text-xs text-muted-foreground" data-testid="text-location-count">
              {locationCount} location{locationCount !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="min-h-11 min-w-11 p-2 rounded-lg bg-secondary text-secondary-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            className="min-h-11 min-w-11 p-2 rounded-lg bg-secondary text-secondary-foreground"
            data-testid="button-saved-locations"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
