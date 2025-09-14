import { SprayCan } from "lucide-react";

interface MobileHeaderProps {
  locationCount: number;
}

export default function MobileHeader({ locationCount }: MobileHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-card z-40 safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <SprayCan className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h1 className="heading font-bold text-lg text-foreground">GRAFTRACK</h1>
          </div>
        </div>
        <div className="text-xs text-muted-foreground street-text">
          {locationCount} SPOTS
        </div>
      </div>
    </div>
  );
}