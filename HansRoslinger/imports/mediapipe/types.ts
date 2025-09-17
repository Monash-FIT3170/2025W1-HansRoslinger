import { GestureType } from "../gesture/gesture";

// These are mediapipes default recognised gestures, we're mapping it to a common enum
export const MediapipeDefaultIDtoEnum: Record<string, GestureType> = {
  Thumb_Up: GestureType.THUMB_UP,
  Thumb_Down: GestureType.THUMB_DOWN,
  Pointing_Up: GestureType.POINTING_UP,
  Closed_Fist: GestureType.CLOSED_FIST,
  I_Love_You: GestureType.I_LOVE_YOU,
  Open_Palm: GestureType.OPEN_PALM,
  Victory: GestureType.VICTORY,
  Unidentified: GestureType.UNIDENTIFIED,
};

export enum Handedness {
  LEFT = "Left",
  RIGHT = "Right",
  BOTH = "Both",
}

export type Gesture = {
  gestureID: GestureType;
  timestamp: Date;
  handedness: Handedness;
  confidence: number; // 0-1
  singleGestureLandmarks: { x: number; y: number; z?: number }[];
  doubleGestureLandmarks: { x: number; y: number; z?: number }[][];
};