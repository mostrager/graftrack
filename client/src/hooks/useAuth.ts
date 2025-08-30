import { useState, useEffect } from "react";
import { onAuthChange, type DemoUser } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Demo mode - automatically sign in after loading
    setTimeout(() => {
      const mockUser: DemoUser = {
        uid: 'demo-user-123',
        email: 'demo@graffiti-tracker.com',
        displayName: 'Demo User',
        photoURL: null,
      };
      
      setUser(mockUser);
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}