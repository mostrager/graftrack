import { Compass } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CompassButtonProps {
  onCompassActivated?: () => void;
}

export default function CompassButton({ onCompassActivated }: CompassButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const requestCompassPermission = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ requires user gesture to request permission
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setIsActive(true);
          toast({
            title: "Compass Activated",
            description: "Your device compass is now tracking your heading",
          });
          onCompassActivated?.();
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable motion sensors in your device settings",
            variant: "destructive",
          });
        }
      } else {
        // Non-iOS or older devices - permission not needed
        setIsActive(true);
        toast({
          title: "Compass Active",
          description: "Tracking your device heading",
        });
        onCompassActivated?.();
      }
    } catch (error) {
      console.error("Error requesting compass permission:", error);
      toast({
        title: "Error",
        description: "Could not activate compass",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={requestCompassPermission}
      className={`fixed top-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
        isActive
          ? "bg-accent text-accent-foreground animate-pulse"
          : "bg-secondary text-secondary-foreground hover:scale-110"
      }`}
      data-testid="button-compass"
      title="Activate Compass"
    >
      <Compass className="w-6 h-6" />
    </button>
  );
}