enum GestureType {
  CLOSED_FIST = "Closed_Fist",
  I_LOVE_YOU = "ILoveYou",
  UNIDENTIFIED = "None",
  OPEN_PALM = "Open_Palm",
  POINTING_UP = "Pointing_Up",    // This is with the thumb, and index and pinky fingers outstretched
  THUMB_DOWN = "Thumb_Down",
  THUMB_UP = "Thumb_Up",
  VICTORY = "Victory",            // This is the peace sign
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