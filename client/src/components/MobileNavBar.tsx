import { Map, User, Plus, List } from "lucide-react";

interface MobileNavBarProps {
  onAddClick: () => void;
  onProfileClick: () => void;
  onListClick: () => void;
  isAddingLocation: boolean;
}

export default function MobileNavBar({ 
  onAddClick, 
  onProfileClick, 
  onListClick,
  isAddingLocation 
}: MobileNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {/* Map Tab */}
        <button 
          className="flex flex-col items-center justify-center flex-1 h-full text-primary"
          data-testid="nav-map"
        >
          <Map className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Map</span>
        </button>

        {/* Add Button - Centered and Prominent */}
        <button 
          onClick={onAddClick}
          className={`relative -mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isAddingLocation
              ? "bg-destructive text-destructive-foreground scale-110"
              : "bg-accent text-accent-foreground hover:scale-105"
          }`}
          data-testid="nav-add"
        >
          <Plus className={`w-6 h-6 transition-transform ${isAddingLocation ? 'rotate-45' : ''}`} />
        </button>

        {/* List Tab */}
        <button 
          onClick={onListClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground"
          data-testid="nav-list"
        >
          <List className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">List</span>
        </button>

        {/* Profile Tab */}
        <button 
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground"
          data-testid="nav-profile"
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}