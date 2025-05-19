import { processPointUpGesture } from "./PointUp";
import { processOpenPalmGesture } from "./OpenPalm";
import { processClosedFistGesture } from "./ClosedFist";
import { processVictorySignGesture, processZoom } from "./VictorySign";

enum GestureType {
  CLOSED_FIST,
  I_LOVE_YOU,
  UNIDENTIFIED,
  OPEN_PALM,
  POINTING_UP,        // This is with the thumb, and index and pinky fingers outstretched
  THUMB_DOWN,
  THUMB_UP,
  VICTORY,            // This is the peace sign
}

export const labelMapping: Record<string, GestureType> = {
  "Thumb_Up": GestureType.THUMB_UP,
  "Thumb_Down": GestureType.THUMB_DOWN,
  "Pointing_Up": GestureType.POINTING_UP,
  "Closed_Fist": GestureType.CLOSED_FIST,
  "I_Love_You": GestureType.I_LOVE_YOU,
  "Unidentified": GestureType.UNIDENTIFIED,
  "Open_Palm": GestureType.OPEN_PALM,
  "Victory": GestureType.VICTORY,
};

enum Handedness {
  LEFT = "Left",
  RIGHT = "Right",
}

type Gesture = {
  gestureID: GestureType,
  timestamp: Date,
  handedness: Handedness,
  confidence: number;    // 0-1
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

// Map to track the ON/OFF status of each gesture
const gestureStatusMap: Map<GestureType, boolean> = new Map();

// Initialize all gestures to OFF
Object.values(GestureType)
  .filter((v) => typeof v === "number") // Only enum values, not keys
  .forEach((gesture) => gestureStatusMap.set(gesture as GestureType, false));

/**
 * Sets the status of a gesture.
 * @param gesture - The gesture to update.
 * @param status - The new status: true = ON, false = OFF.
 */
const setGestureStatus = (gesture: GestureType, status: boolean): void => {
  gestureStatusMap.set(gesture, status);
  console.log(`Gesture ${GestureType[gesture]} is now ${status ? "ON" : "OFF"}`);
};

/**
 * Toggles the current status of a gesture.
 * @param gesture - The gesture to toggle.
 */
const toggleGestureStatus = (gesture: GestureType): void => {
  const currentStatus = gestureStatusMap.get(gesture) ?? false;
  gestureStatusMap.set(gesture, !currentStatus);
  console.log(`Gesture ${GestureType[gesture]} toggled to ${!currentStatus ? "ON" : "OFF"}`);
};

/**
 * Gets the current status of a gesture.
 * @param gesture - The gesture to check.
 * @returns boolean indicating ON/OFF status.
 */
const isGestureOn = (gesture: GestureType): boolean => {
  return gestureStatusMap.get(gesture) ?? false;
};

export {setGestureStatus, toggleGestureStatus, isGestureOn };




const defaultMapping = {
  [GestureType.THUMB_UP]: console.log,
  [GestureType.THUMB_DOWN]: console.log,
  [GestureType.POINTING_UP]: isGestureOn(GestureType.POINTING_UP) ? processPointUpGesture : console.log,
  [GestureType.CLOSED_FIST]: isGestureOn(GestureType.CLOSED_FIST) ? processClosedFistGesture : console.log,
  [GestureType.I_LOVE_YOU]: console.log,
  [GestureType.UNIDENTIFIED]: console.log,
  [GestureType.OPEN_PALM]: isGestureOn(GestureType.OPEN_PALM) ? processOpenPalmGesture : console.log,
  [GestureType.VICTORY]: isGestureOn(GestureType.VICTORY) ? processVictorySignGesture : console.log,
};

// Default mapping, would replace console.log with function to be called.
const handleGestureToFunc = (INPUT: GestureType, initialGesture: Gesture, latestGesture: Gesture): void => {
  const label = labelMapping[INPUT];
  if (isZoomEnabled) {
    // if gesture is closed fist, we want to end zoom
    if (label === GestureType.CLOSED_FIST) {
      processVictorySignGesture(initialGesture, latestGesture);
    }
    else {
      processZoom(zoomStartPosition!, latestGesture);
    }
  } else {
    const handler = defaultMapping[label];
    if (handler) {
      handler(initialGesture, latestGesture);
    } else {
      console.warn(`No handler found for gesture: ${INPUT}`);
    }
  }
  
};

export { Gesture, GestureType, Handedness, defaultMapping, handleGestureToFunc, isZoomEnabled };

export const gestureToScreenPosition = (
  x: number,
  y: number,
  z?: number
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