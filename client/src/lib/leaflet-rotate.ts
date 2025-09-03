import L from "leaflet";

// Extend Leaflet to support map rotation with touch gestures
export function initializeMapRotation(map: L.Map) {
  let startBearing = 0;
  let currentBearing = 0;
  let touchStartAngle: number | null = null;
  let touchStartDistance: number | null = null;
  
  // Helper function to get angle between two touch points
  function getTouchAngle(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }
  
  // Helper function to get distance between two touch points
  function getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Apply CSS transform for rotation
  function applyRotation(bearing: number) {
    const container = map.getContainer();
    const panes = container.querySelector('.leaflet-map-pane') as HTMLElement;
    if (panes) {
      panes.style.transform = `rotate(${bearing}deg)`;
      panes.style.transformOrigin = 'center center';
      
      // Rotate markers back to keep them upright
      const markers = container.querySelectorAll('.leaflet-marker-icon');
      markers.forEach((marker: Element) => {
        (marker as HTMLElement).style.transform = `rotate(${-bearing}deg)`;
      });
      
      // Keep popups upright
      const popups = container.querySelectorAll('.leaflet-popup');
      popups.forEach((popup: Element) => {
        (popup as HTMLElement).style.transform = `rotate(${-bearing}deg)`;
      });
    }
  }
  
  // Handle two-finger rotation
  map.getContainer().addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchStartAngle = getTouchAngle(e.touches[0], e.touches[1]);
      touchStartDistance = getTouchDistance(e.touches[0], e.touches[1]);
      startBearing = currentBearing;
    }
  }, { passive: false });
  
  map.getContainer().addEventListener('touchmove', (e: TouchEvent) => {
    if (e.touches.length === 2 && touchStartAngle !== null) {
      e.preventDefault();
      
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
      const angleDelta = currentAngle - touchStartAngle;
      
      currentBearing = (startBearing + angleDelta) % 360;
      applyRotation(currentBearing);
      
      // Handle pinch zoom at the same time
      if (touchStartDistance !== null) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / touchStartDistance;
        
        if (scale > 1.1 || scale < 0.9) {
          const currentZoom = map.getZoom();
          const newZoom = currentZoom + Math.log2(scale);
          map.setZoom(newZoom);
          touchStartDistance = currentDistance;
        }
      }
    }
  }, { passive: false });
  
  map.getContainer().addEventListener('touchend', () => {
    touchStartAngle = null;
    touchStartDistance = null;
  });
  
  // Add reset bearing method
  (map as any).resetBearing = () => {
    currentBearing = 0;
    applyRotation(0);
  };
  
  // Add set bearing method
  (map as any).setBearing = (bearing: number) => {
    currentBearing = bearing % 360;
    applyRotation(currentBearing);
  };
  
  // Add get bearing method
  (map as any).getBearing = () => currentBearing;
}