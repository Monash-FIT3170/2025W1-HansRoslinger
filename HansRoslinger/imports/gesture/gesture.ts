import { select } from "./Select";
import { clear } from "./Clear";
import { filter } from "./Filter";
import { zoom, processZoom } from "./Zoom";
import { processHighlightChart } from "./highlightChart";
import { processClearChart } from "./clearChart";
import { processFilterChart } from "./filterChart";
import { processZoomChart, processZoom } from "./ZoomChart";
import { processSwitchChartType } from "./switchChartType";
import { processSwitchDataset } from "./switchDataset";

enum GestureType {
  CLOSED_FIST,
  I_LOVE_YOU,
  UNIDENTIFIED,
  OPEN_PALM,
  POINTING_UP, // This is with the thumb, and index and pinky fingers outstretched
  THUMB_DOWN,
  THUMB_UP,
  VICTORY, // This is the peace sign
}

enum FunctionType {
  UNUSED,
  SELECT,
  FILTER,
  CLEAR,
  ZOOM
}

export const IDtoEnum: Record<string, GestureType> = {
  "Thumb_Up": GestureType.THUMB_UP,
  "Thumb_Down": GestureType.THUMB_DOWN,
  "Pointing_Up": GestureType.POINTING_UP,
  "Closed_Fist": GestureType.CLOSED_FIST,
  "I_Love_You": GestureType.I_LOVE_YOU,
  "Unidentified": GestureType.UNIDENTIFIED,
  "Open_Palm": GestureType.OPEN_PALM,
  "Victory": GestureType.VICTORY,
};

export const EnumToFunc: Record<FunctionType, any> = {
  [FunctionType.UNUSED]: console.log,
  [FunctionType.SELECT]: select,
  [FunctionType.FILTER]: filter,
  [FunctionType.CLEAR]: clear,
  [FunctionType.ZOOM]: zoom,
};

enum Handedness {
  LEFT = "Left",
  RIGHT = "Right",
}

type Gesture = {
  gestureID: GestureType;
  timestamp: Date;
  handedness: Handedness;
  confidence: number; // 0-1
  landmarks: { x: number; y: number; z?: number }[];
};

// Define a boolean to track the zoom state
let isZoomEnabled = false;
let zoomStartPosition: { x: number; y: number } | null = null;

// Watch for the "chart:zoom" event and toggle the boolean
window.addEventListener("chart:togglezoom", (event: Event) => {
  const customEvent = event as CustomEvent<{ x: number; y: number }>;
  isZoomEnabled = !isZoomEnabled;
  if (isZoomEnabled && customEvent.detail) {
    const { x, y } = customEvent.detail;
    zoomStartPosition = { x: x, y: y };
    console.log(`Zoom enabled. Start position set to:`, zoomStartPosition);
  } else {
    zoomStartPosition = null;
    console.log(`Zoom disabled.`);
  }
});

const defaultMapping = {
  [GestureType.THUMB_UP]: FunctionType.UNUSED,
  [GestureType.THUMB_DOWN]: FunctionType.UNUSED,
  [GestureType.POINTING_UP]: FunctionType.SELECT,
  [GestureType.CLOSED_FIST]: FunctionType.CLEAR,
  [GestureType.I_LOVE_YOU]: FunctionType.UNUSED,
  [GestureType.UNIDENTIFIED]: FunctionType.UNUSED,
  [GestureType.OPEN_PALM]: FunctionType.FILTER,
  [GestureType.VICTORY]: FunctionType.ZOOM,
};

const handleGestureToFunc = (INPUT: GestureType, initialGesture: Gesture, latestGesture: Gesture): void => {
  const label = IDtoEnum[INPUT];
  if (isZoomEnabled) {
    // if gesture is closed fist, we want to end zoom
    if (defaultMapping[label] === FunctionType.ZOOM) {
      zoom(initialGesture, latestGesture);
    }
    else {
      processZoom(zoomStartPosition!, latestGesture);
    }
  } else {
    const handler = EnumToFunc[defaultMapping[label]];
    if (handler) {
      handler(initialGesture, latestGesture);
    } else {
      console.warn(`No handler found for gesture: ${INPUT}`);
    }
  }
};

export { Gesture, GestureType, FunctionType, Handedness, defaultMapping, handleGestureToFunc, isZoomEnabled };

export const gestureToScreenPosition = (
  x: number,
  y: number,
  z?: number,
): { screenX: number; screenY: number } => {
  // Get the screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Flip the x coordinate (mirrored horizontally)
  const flippedX = 1 - x;

  // Convert normalized x and y to absolute screen positions
  const screenX = Math.round(flippedX * screenWidth);
  const screenY = Math.round(y * screenHeight);

  // Optionally, you can use z for depth-related calculations if needed
  if (z !== undefined) {
    console.log(`Depth (z): ${z}`);
  }

  return { screenX, screenY };
};
