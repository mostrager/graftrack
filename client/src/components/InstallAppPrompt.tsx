import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InstallAppPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');
    
    if (isInstalled) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if prompt was dismissed recently
    const dismissedAt = localStorage.getItem('installPromptDismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return; // Don't show for 7 days after dismissal
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt if not in standalone mode
    if (isIOSDevice && !(window.navigator as any).standalone) {
      setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS installation instructions
      toast({
        title: "Install GrafTrack",
        description: "Tap the share button and select 'Add to Home Screen'",
      });
    } else if (deferredPrompt) {
      // Show Android/Chrome install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "GrafTrack will be added to your home screen",
        });
      }
      
      setDeferredPrompt(null);
    }
    
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-secondary rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-accent-foreground" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install GrafTrack</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {isIOS
                ? "Add to your home screen for the best experience"
                : "Install our app for offline access and push notifications"}
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{isIOS ? "How to Install" : "Install"}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}