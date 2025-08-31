import { X, LogOut, SprayCan, MapPin, Calendar } from "lucide-react";
import { User } from "@shared/schema";

interface MobileProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  locationCount: number;
  onLogout: () => void;
}

export default function MobileProfilePanel({ 
  isOpen, 
  onClose, 
  user,
  locationCount,
  onLogout 
}: MobileProfilePanelProps) {
  if (!user) return null;

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
            <h3 className="heading font-bold text-xl">PROFILE</h3>
            <button 
              className="p-2 touch-target" 
              onClick={onClose}
              data-testid="button-close-profile"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          {/* User Info */}
          <div className="flex items-center space-x-4 mb-6">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center">
                <SprayCan className="w-8 h-8 text-accent-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg">{user.firstName || user.email?.split('@')[0] || 'User'}</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground street-text">SPOTS SAVED</span>
              </div>
              <p className="text-2xl font-bold">{locationCount}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground street-text">MEMBER SINCE</span>
              </div>
              <p className="text-lg font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Today'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <button 
            onClick={onLogout}
            className="w-full bg-destructive text-destructive-foreground font-bold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 street-text text-lg touch-target active:scale-95 transition-transform"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>
    </div>
  );
}