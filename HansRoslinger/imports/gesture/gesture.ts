import { select } from "./Select";
import { clear } from "./Clear";
import { filter } from "./Filter";
import { zoom, processZoom } from "./Zoom";
import { processSwitchChartType } from "./switchChartType";
import { processSwitchDataset } from "./switchDataset";
import { click } from "./Click";

enum GestureType {
  CLOSED_FIST,
  I_LOVE_YOU,
  UNIDENTIFIED,
  OPEN_PALM,
  POINTING_UP, // This is with the thumb, and index and pinky fingers outstretched (now also identifies any pointing)
  THUMB_DOWN,
  THUMB_UP,
  VICTORY, // This is the peace sign
  PINCH, // Team 3 double hand gesture
  DOUBLE_PINCH,
  TWO_FINGER_POINTING_LEFT,
  TWO_FINGER_POINTING_RIGHT,
}

enum FunctionType {
  UNUSED,
  SELECT,
  FILTER,
  CLEAR,
  ZOOM,
  SWITCH_CHART,
  SWITCH_DATA,
  CLICK,
}

export const IDtoEnum: Record<string, GestureType> = {
  Thumb_Up: GestureType.THUMB_UP,
  Thumb_Down: GestureType.THUMB_DOWN,
  Pointing_Up: GestureType.POINTING_UP,
  Closed_Fist: GestureType.CLOSED_FIST,
  I_Love_You: GestureType.I_LOVE_YOU,
  Unidentified: GestureType.UNIDENTIFIED,
  Open_Palm: GestureType.OPEN_PALM,
  Victory: GestureType.VICTORY,
  Pinch: GestureType.PINCH,
  Double_Pinch: GestureType.DOUBLE_PINCH,
  Two_Finger_Pointing_Left: GestureType.TWO_FINGER_POINTING_LEFT,
  Two_Finger_Pointing_Right: GestureType.TWO_FINGER_POINTING_RIGHT,
};

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
};

enum Handedness {
  LEFT = "Left",
  RIGHT = "Right",
  BOTH = "Both",
}

type Gesture = {
  gestureID: GestureType;
  timestamp: Date;
  handedness: Handedness;
  confidence: number; // 0-1
  singleGestureLandmarks: { x: number; y: number; z?: number }[];
  doubleGestureLandmarks: { x: number; y: number; z?: number }[][];
};

// Define a boolean to track the zoom state
let isZoomEnabled = false;
let zoomStartPosition: { x: number; y: number } | null = null;

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
}

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
};

const handleGestureToFunc = (
  INPUT: GestureType,
  initialGesture: Gesture,
  latestGesture: Gesture,
): void => {
  const label = INPUT;
  if (isZoomEnabled) {
    // if gesture is closed fist, we want to end zoom
    if (label === GestureType.CLOSED_FIST) {
      zoom(initialGesture, latestGesture);
    } else if (latestGesture.gestureID === GestureType.DOUBLE_PINCH) {
      processZoom(zoomStartPosition!, latestGesture);
    }
  } else {
    const functionType = defaultMapping[label];
    const handler = EnumToFunc[functionType];

    // console.log(`label: ${label}`);
    // console.log(`functionType: ${functionType}`);
    if (handler && functionType !== FunctionType.UNUSED) {
      // This log helps confirm the correct handler is being called
      console.log(
        `[GestureHandler] Calling function '${FunctionType[functionType]}' for gesture '${GestureType[label]}'`,
      );
      handler(initialGesture, latestGesture);
    } else if (functionType === FunctionType.UNUSED) {
      // This log confirms a gesture is being correctly ignored
      console.log(
        `[GestureHandler] Ignoring intentionally unused gesture: ${GestureType[label]}`,
      );
    } else {
      // This warning will now only appear for truly unhandled gestures
      console.warn(
        `[GestureHandler] No handler configured for gesture: ${GestureType[label]} (${INPUT})`,
      );
    }
  }
};

export {
  Gesture,
  GestureType,
  FunctionType,
  Handedness,
  handleGestureToFunc,
  isZoomEnabled,
};

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
