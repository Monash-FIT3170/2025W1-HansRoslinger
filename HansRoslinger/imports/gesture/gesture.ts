/**
 * Purpose
 * -------
 * This file implements a gesture detection pipeline that connects a webcam
 * video feed (`react-webcam`) to the MediaPipe `GestureRecognizer`. It:
 *   • Loads and initializes the gesture recognition model with retry logic.
 *   • Runs a requestAnimationFrame loop to analyze video frames in real time.
 *   • Maps recognized gestures (and custom heuristics like pinch/pointing)
 *     into the app’s `Gesture` type.
 *   • Detects both single-hand and two-hand gestures, with custom rules
 *     (e.g., `DOUBLE_PINCH`).
 *   • Forwards valid gestures into the central `GestureHandler`, which maps
 *     them to configured application functions (zoom, filter, select, etc.).
 *
 * In short: this file is the bridge between raw video input and the higher-
 * level gesture-driven interactions in the app.
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

// Define a boolean to track the zoom state
let isZoomEnabled = false;
let zoomStartPosition: { x: number; y: number } | null = null;

// Define a boolean to track the draw state
let isDrawEnabled = false;
let drawStartPosition: { x: number; y: number } | null = null;

if (typeof window !== "undefined") {
  // Watch for the "chart:zoom" event and toggle the boolean
  window.addEventListener("chart:togglezoom", (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    isZoomEnabled = !isZoomEnabled;
    if (isZoomEnabled && customEvent.detail) {
      const { x, y } = customEvent.detail;
      zoomStartPosition = { x: x, y: y };
      // console.log(`Zoom enabled. Start position set to:`, zoomStartPosition);
      document?.body?.classList.add("zoom-active-outline");
    } else {
      zoomStartPosition = null;
      document?.body?.classList.remove("zoom-active-outline");
    }
  });

  // Watch for the "chart:draw" event and toggle the boolean
  window.addEventListener("chart:toggledraw", (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    isDrawEnabled = !isDrawEnabled;
    if (isDrawEnabled && customEvent.detail) {
      const { x, y } = customEvent.detail;
      drawStartPosition = { x: x, y: y };
      console.log(`Draw enabled. Start position set to:`, drawStartPosition);
      document?.body?.classList.add("draw-active-outline");
    } else {
      drawStartPosition = null;
      document?.body?.classList.remove("draw-active-outline");
    }
  });
}

const constantMapping: Partial<Record<GestureType, FunctionType>> = {
  [GestureType.DOUBLE_PINCH]: FunctionType.ZOOM,
};

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

const handleGestureToFunc = (INPUT: GestureType, initialGesture: Gesture, latestGesture: Gesture, mapping: Record<GestureType, FunctionType>): void => {
  const label = INPUT;
  
  if (isZoomEnabled) {
    console.log(mapping[label], FunctionType.FILTER);
    // if gesture is closed fist, we want to end zoom
    if (mapping[label] === FunctionType.FILTER) {
      zoom(initialGesture, latestGesture);
    } else if (latestGesture.gestureID === GestureType.DOUBLE_PINCH) {
      processZoom(zoomStartPosition!, latestGesture);
    }
  } else if (isDrawEnabled) {
    console.log(`draw mode enabled`);
    // In draw mode, handle special gestures
    if (latestGesture.gestureID === GestureType.POINTING_UP) {
      // Pointing finger acts as an eraser
      processErase(latestGesture);
    } else if (mapping[label] === FunctionType.FILTER) {
      // Closed fist exits draw mode
      draw(initialGesture, latestGesture);
    } else if (mapping[label] === FunctionType.CLEAR) {
      // Open palm cancels draw mode
      draw(initialGesture, latestGesture);
    } else if (
      latestGesture.gestureID === GestureType.DRAW
    ) {
      // Continue drawing for confirmed or briefly unidentified frames
      processDraw(drawStartPosition!, latestGesture);
    } else {
      // For any other gesture, hide the eraser indicator since we're not in erase mode
      showEraserPreview(latestGesture);
    }
    // All other gestures are ignored in draw mode
  } else {
    // Not in zoom or draw mode - normal gesture handling
    if (mapping[label] === FunctionType.CLEAR) {
      // Open palm: first clear drawing, then do normal clear function
      clearDrawing();
      // Then continue with normal clear function
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
