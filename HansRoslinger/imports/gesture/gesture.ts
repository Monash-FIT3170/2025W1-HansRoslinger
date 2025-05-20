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

const labelMapping: Record<GestureType, string> = {
  [GestureType.THUMB_UP]: "Thumb Up",
  [GestureType.THUMB_DOWN]: "Thumb Down",
  [GestureType.POINTING_UP]: "Point Up",
  [GestureType.CLOSED_FIST]: "Closed Fist",
  [GestureType.I_LOVE_YOU]: "I Love You",
  [GestureType.UNIDENTIFIED]: "Unidentified",
  [GestureType.OPEN_PALM]: "Open Palm",
  [GestureType.VICTORY]: "Victory",
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

// Default mapping, would replace console.log with function to be called.
const defaultMapping: Record<GestureType, (initialGesture: Gesture, latestGesture: Gesture) => void> = {
  [GestureType.THUMB_UP]: console.log,
  [GestureType.THUMB_DOWN]: console.log,
  [GestureType.POINTING_UP]: console.log,
  [GestureType.CLOSED_FIST]: console.log,
  [GestureType.I_LOVE_YOU]: console.log,
  [GestureType.UNIDENTIFIED]: console.log,
  [GestureType.OPEN_PALM]: console.log,
  [GestureType.VICTORY]: console.log,
};

defaultMapping[GestureType.THUMB_DOWN]

export {Gesture, GestureType, Handedness, defaultMapping, labelMapping};