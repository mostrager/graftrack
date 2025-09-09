import { useEffect, useRef } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
}

export function useNativeGestures(handlers: SwipeHandlers) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pullDistanceRef = useRef(0);
  const isPullingRef = useRef(false);

  useEffect(() => {
    let isRefreshing = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // Check if we're at the top for pull-to-refresh
      if (window.scrollY === 0 && handlers.onPullToRefresh) {
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Handle pull-to-refresh
      if (isPullingRef.current && deltaY > 0 && !isRefreshing) {
        e.preventDefault();
        pullDistanceRef.current = Math.min(deltaY, 100);
        
        // Visual feedback would go here
        if (pullDistanceRef.current > 60) {
          // Ready to refresh
        }
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Handle pull-to-refresh release
      if (isPullingRef.current && pullDistanceRef.current > 60 && handlers.onPullToRefresh) {
        isRefreshing = true;
        await handlers.onPullToRefresh();
        isRefreshing = false;
      }

      // Reset pull-to-refresh
      isPullingRef.current = false;
      pullDistanceRef.current = 0;

      // Detect swipe gestures (quick swipe within 300ms)
      if (deltaTime < 300) {
        const threshold = 50;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY && absX > threshold) {
          // Horizontal swipe
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        } else if (absY > absX && absY > threshold) {
          // Vertical swipe
          if (deltaY > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          } else if (deltaY < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handlers]);
}