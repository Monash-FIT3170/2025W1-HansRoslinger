// ImageAssetHandler.tsx
// Handles zoom, clear, and image asset logic for SA mode
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export interface UseImageAssetZoomReturn {
  imageScale: { scale: number };
  setImageScale: Dispatch<SetStateAction<{ scale: number }>>;
  zoomStartPosition: { x: number; y: number };
  setZoomStartPosition: Dispatch<SetStateAction<{ x: number; y: number }>>;
  isZoomEnabled: boolean;
  setIsZoomEnabled: Dispatch<SetStateAction<boolean>>;
  handleZoomGesture: (e: Event) => void;
  handleClearGesture: () => void;
}

export function useImageAssetZoom(): UseImageAssetZoomReturn {
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomStartPosition, setZoomStartPosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState<{ scale: number }>({ scale: 1 });

  // Only allow uniform scaling, and never below 1x
  // Accepts existing chart gesture payload: { scaleX, scaleY }
  const handleZoomGesture = (e: Event) => {
    if (!isZoomEnabled) return;
    const ce = e as CustomEvent<{
      scaleX?: number;
      scaleY?: number;
      scale?: number;
    }>;
    const raw = ce.detail?.scale ?? ce.detail?.scaleX ?? 1;
    const next = Math.max(0.2, Number.isFinite(raw) ? (raw as number) : 1);
    setImageScale({ scale: next });
  };

  // Clear gesture resets zoom
  const handleClearGesture = () => {
    setImageScale({ scale: 1 });
    setIsZoomEnabled(false);
    setZoomStartPosition({ x: 0, y: 0 });
  };

  // Listen for zoom and clear gestures
  useEffect(() => {
    window.addEventListener("chart:zoom", handleZoomGesture);
    window.addEventListener("chart:clear", handleClearGesture);
    return () => {
      window.removeEventListener("chart:zoom", handleZoomGesture);
      window.removeEventListener("chart:clear", handleClearGesture);
    };
  }, [isZoomEnabled]);

  // Listen for entering/exiting zoom mode, capturing start position
  useEffect(() => {
    const handleToggleZoom = (event: Event) => {
      const customEvent = event as CustomEvent<{ x: number; y: number }>;
      setIsZoomEnabled((prev) => {
        const next = !prev;
        if (next && customEvent.detail) {
          setZoomStartPosition({
            x: customEvent.detail.x,
            y: customEvent.detail.y,
          });
        } else {
          setZoomStartPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    window.addEventListener("chart:togglezoom", handleToggleZoom);
    return () =>
      window.removeEventListener("chart:togglezoom", handleToggleZoom);
  }, []);

  return {
    imageScale,
    setImageScale,
    zoomStartPosition,
    setZoomStartPosition,
    isZoomEnabled,
    setIsZoomEnabled,
    handleZoomGesture,
    handleClearGesture,
  };
}
