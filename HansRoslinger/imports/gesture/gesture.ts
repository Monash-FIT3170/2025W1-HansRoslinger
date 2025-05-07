enum GestureType {
  THUMB_UP,
  THUMB_DOWN,
  POINTING_UP,
  OPEN_PALM,
  VICTORY, // This is the peace sign
}

enum Handedness {
  LEFT,
  RIGHT
}

type Gesture = {
  gesture_ID: GestureType,
  timestamp: Date,
  handedness: Handedness,
  confidence: number;    // 0-1
  landmarks: { x: number; y: number; z?: number }[];
};

export {Gesture, GestureType, Handedness};