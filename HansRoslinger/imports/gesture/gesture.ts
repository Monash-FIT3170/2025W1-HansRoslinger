/**
 * Purpose
 * -------
 * This file connects webcam video frames (via react-webcam) to the MediaPipe GestureRecognizer.
 * It handles:
 *   • Loading and initializing gesture recognition.
 *   • Real-time frame analysis using requestAnimationFrame.
 *   • Mapping raw gestures into the app’s Gesture type.
 *   • Single-hand and two-hand gestures, including custom gestures (e.g., DOUBLE_PINCH).
 *   • Forwarding gestures to the GestureHandler which triggers app functions like zoom, filter, select, draw, etc.
 * 
 * Essentially, this is the bridge from raw video input to high-level gesture-driven interactions.
 */
import { select } from "./Select";
import { clear } from "./Clear";
import { filter } from "./Filter";
import { zoom, processZoom } from "./Zoom";
import { processSwitchChartType } from "./switchChartType";
import { processSwitchDataset } from "./switchDataset";
import { click } from "./Click";
import { draw, processDraw, processErase, clearDrawing, showEraserPreview } from "./Draw";
import { FunctionType, GestureType } from "./types";
import { Gesture } from "../mediapipe/types";

// Mapping from FunctionType to actual handler functions
type GestureHandlerFn = (initial: Gesture, latest: Gesture) => void;
export const EnumToFunc: Record<FunctionType, GestureHandlerFn> = {
  [FunctionType.UNUSED]: (() => {}) as GestureHandlerFn,
  [FunctionType.SELECT]: select as GestureHandlerFn,
  [FunctionType.FILTER]: filter as GestureHandlerFn,
  [FunctionType.CLEAR]: clear as GestureHandlerFn,
  [FunctionType.ZOOM]: zoom as GestureHandlerFn,
  [FunctionType.SWITCH_CHART]: processSwitchChartType as GestureHandlerFn,
  [FunctionType.SWITCH_DATA]: processSwitchDataset as GestureHandlerFn,
  [FunctionType.CLICK]: click as GestureHandlerFn,
  [FunctionType.DRAW]: draw as GestureHandlerFn,
};

// Track zoom state
let isZoomEnabled = false;
let zoomStartPosition: { x: number; y: number } | null = null;

// Track draw state
let isDrawEnabled = false;
let drawStartPosition: { x: number; y: number } | null = null;

if (typeof window !== "undefined") {
  // Event listener to toggle zoom mode
  window.addEventListener("chart:togglezoom", (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    isZoomEnabled = !isZoomEnabled;

    if (isZoomEnabled && customEvent.detail) {
      // Store start position for zoom (used for pinch/drag calculations)
      const { x, y } = customEvent.detail;
      zoomStartPosition = { x, y };
      document?.body?.classList.add("zoom-active-outline"); // Visual cue
    } else {
      zoomStartPosition = null;
      document?.body?.classList.remove("zoom-active-outline");
    }
  });

  // Event listener to toggle draw mode
  window.addEventListener("chart:toggledraw", (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    isDrawEnabled = !isDrawEnabled;

    if (isDrawEnabled && customEvent.detail) {
      const { x, y } = customEvent.detail;
      drawStartPosition = { x, y };
      console.log(`Draw enabled. Start position set to:`, drawStartPosition);
      document?.body?.classList.add("draw-active-outline"); // Visual cue
    } else {
      drawStartPosition = null;
      document?.body?.classList.remove("draw-active-outline");
    }
  });
}

// Custom constant mapping for special gestures
const constantMapping: Partial<Record<GestureType, FunctionType>> = {
  [GestureType.DOUBLE_PINCH]: FunctionType.ZOOM, // Always zoom when double pinch
};

// Default mapping from gestures to app functions
const defaultMapping: Record<GestureType, FunctionType> = {
  [GestureType.CLOSED_FIST]: FunctionType.FILTER,
  [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
  [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
  [GestureType.OPEN_PALM]: FunctionType.CLEAR,
  [GestureType.POINTING_UP]: FunctionType.SELECT,
  [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
  [GestureType.THUMB_UP]: FunctionType.UNUSED,
  [GestureType.VICTORY]: FunctionType.UNUSED,
  [GestureType.PINCH]: FunctionType.CLICK,
  [GestureType.DOUBLE_PINCH]: FunctionType.ZOOM,
  [GestureType.TWO_FINGER_POINTING_LEFT]: FunctionType.SWITCH_CHART,
  [GestureType.TWO_FINGER_POINTING_RIGHT]: FunctionType.SWITCH_DATA,
  [GestureType.DRAW]: FunctionType.DRAW,
};

/**
 * Main handler connecting gesture types to application functions
 * 
 * @param INPUT GestureType detected
 * @param initialGesture First frame of this gesture
 * @param latestGesture Most recent frame of this gesture
 * @param mapping Mapping from gestures to function types
 */
const handleGestureToFunc = (
  INPUT: GestureType,
  initialGesture: Gesture,
  latestGesture: Gesture,
  mapping: Record<GestureType, FunctionType>
): void => {
  const label = INPUT;

  // Zoom mode handling
  if (isZoomEnabled) {
    // Closed fist ends zoom
    if (mapping[label] === FunctionType.FILTER) {
      zoom(initialGesture, latestGesture);
    } 
    // Double pinch continues zoom movement
    else if (latestGesture.gestureID === GestureType.DOUBLE_PINCH) {
      processZoom(zoomStartPosition!, latestGesture);
    }
  } 
  // Draw mode handling
  else if (isDrawEnabled) {
    if (latestGesture.gestureID === GestureType.POINTING_UP) {
      processErase(latestGesture); // Eraser gesture
    } else if (mapping[label] === FunctionType.FILTER || mapping[label] === FunctionType.CLEAR) {
      draw(initialGesture, latestGesture); // Closed fist or open palm cancels draw mode
    } else if (latestGesture.gestureID === GestureType.DRAW) {
      processDraw(drawStartPosition!, latestGesture); // Continue drawing
    } else {
      showEraserPreview(latestGesture); // Show eraser indicator without erasing
    }
  } 
  // Default (not zoom or draw)
  else {
    if (mapping[label] === FunctionType.CLEAR) {
      // Clear drawing first before triggering clear function
      clearDrawing();
      const functionType = mapping[label];
      const handler = EnumToFunc[functionType];
      if (handler) {
        console.log(`[GestureHandler] Clearing drawing then calling function '${FunctionType[functionType]}' for gesture '${GestureType[label]}'`);
        handler(initialGesture, latestGesture);
      }
    } else {
      // Normal gesture handling
      const functionType = mapping[label];
      const handler = EnumToFunc[functionType];

      if (handler && functionType !== FunctionType.UNUSED) {
        console.log(`[GestureHandler] Calling function '${FunctionType[functionType]}' for gesture '${GestureType[label]}'`);
        handler(initialGesture, latestGesture);
      } else if (functionType === FunctionType.UNUSED) {
        // Check constantMapping for fallback
        const defaultFunction = constantMapping[label];
        if (defaultFunction) {
          const defaultHandler = EnumToFunc[defaultFunction];
          if (defaultHandler) {
            defaultHandler(initialGesture, latestGesture);
          }
        }
        console.log(`[GestureHandler] Ignoring intentionally unused gesture: ${GestureType[label]}`);
      } else {
        console.warn(`[GestureHandler] No handler configured for gesture: ${GestureType[label]} (${INPUT})`);
      }
    }
  }
};

export { Gesture, GestureType, FunctionType, handleGestureToFunc, isZoomEnabled, defaultMapping, isDrawEnabled };
