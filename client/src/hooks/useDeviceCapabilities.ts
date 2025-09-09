import { useState, useEffect } from "react";

interface DeviceCapabilities {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isStandalone: boolean;
  hasNotch: boolean;
  supportsVibration: boolean;
  supportsTouchID: boolean;
  supportsHaptics: boolean;
  networkSpeed: "slow" | "fast" | "unknown";
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isStandalone: false,
    hasNotch: false,
    supportsVibration: false,
    supportsTouchID: false,
    supportsHaptics: false,
    networkSpeed: "unknown"
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
    
    // Check if app is running as standalone (installed)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    // Check for notch (iPhone X and later)
    const hasNotch = 
      isIOS && 
      window.screen.height >= 812 && 
      window.devicePixelRatio >= 2;

    // Check for vibration API support
    const supportsVibration = "vibrate" in navigator;

    // Check for Touch ID / Face ID availability (iOS)
    const supportsTouchID = 
      isIOS && 
      "credentials" in navigator &&
      "preventSilentAccess" in (navigator.credentials as any);

    // Check for haptic feedback support
    const supportsHaptics = 
      supportsVibration && 
      (isIOS || (isAndroid && parseInt(userAgent.match(/android\s(\d+)/)?.[1] || "0") >= 10));

    // Check network speed
    let networkSpeed: "slow" | "fast" | "unknown" = "unknown";
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;
      if (effectiveType === "slow-2g" || effectiveType === "2g") {
        networkSpeed = "slow";
      } else if (effectiveType === "4g") {
        networkSpeed = "fast";
      }
    }

    setCapabilities({
      isIOS,
      isAndroid,
      isMobile,
      isStandalone,
      hasNotch,
      supportsVibration,
      supportsTouchID,
      supportsHaptics,
      networkSpeed
    });
  }, []);

  return capabilities;
}

// Utility function for haptic feedback
export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  if (!navigator.vibrate) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 20]
  };

  navigator.vibrate(patterns[type]);
}