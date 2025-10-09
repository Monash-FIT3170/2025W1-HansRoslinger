import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Gesture, GestureType } from "../gesture/gesture";
import { Handedness } from "./types";

export function recogniseCustomGesture(landmarks: NormalizedLandmark[], handedness: Handedness = Handedness.RIGHT): { gestureID: GestureType; confidence: number } | null {
  if (!landmarks || landmarks.length < 21) return null;

  if (isPinchSign(landmarks)) {
    return {
      gestureID: GestureType.PINCH,
      confidence: 1.0,
    };
  } else if (isTwoFingerPointing(landmarks)) {
    return {
      gestureID: handedness === Handedness.LEFT ? GestureType.TWO_FINGER_POINTING_LEFT : GestureType.TWO_FINGER_POINTING_RIGHT,
      confidence: 1.0,
    };
  } else if (isPointing(landmarks)) {
    return {
      gestureID: GestureType.POINTING_UP,
      confidence: 1.0,
    };
  }
  return null;
}

// These gestures are exempt from disabling when gesture detection is off
export function handleDisableExemptGestures(currentGestures: Gesture[], HandleGesture: (g: Gesture) => void): boolean {
  let handled = false;
  for (let index = 0; index < currentGestures.length; index++) {
    // Only check for pinching as user may click gesture detection toggle button to turn it back on
    if (currentGestures[index] && currentGestures[index].gestureID === GestureType.PINCH) {
      HandleGesture(currentGestures[index]);
      handled = true;
    }
  }
  return handled;
}

// Calls HandleGesture for each single-handed gesture; returns true if any were handled
export function handleSingleHandedGestures(currentGestures: Gesture[], HandleGesture: (g: Gesture) => void): boolean {
  let handled = false;
  for (let index = 0; index < currentGestures.length; index++) {
    if (currentGestures[index]) {
      HandleGesture(currentGestures[index]);
      handled = true;
    }
  }
  return handled;
}
// Returns true if a two-handed gesture is detected and handled, otherwise false
export function handleTwoHandedGestures(leftGesture: Gesture | undefined, rightGesture: Gesture | undefined, HandleGesture: (g: Gesture) => void): boolean {
  if (leftGesture && rightGesture && isDoublePinchSign(leftGesture, rightGesture)) {
    const twoHandedGesture: Gesture = {
      gestureID: GestureType.DOUBLE_PINCH,
      handedness: Handedness.BOTH,
      timestamp: new Date(),
      confidence: Math.min(leftGesture.confidence, rightGesture.confidence),
      singleGestureLandmarks: [],
      doubleGestureLandmarks: [leftGesture.singleGestureLandmarks, rightGesture.singleGestureLandmarks],
    };
    HandleGesture(twoHandedGesture);
    return true;
  }
  // Add more two-handed gesture checks here if needed
  return false;
}

export function isPointing(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const thumbTip = landmarks[4];
  const thumbPip = landmarks[6];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const isIndexExtended = dist(wrist, indexTip) > dist(wrist, indexPip);
  const areOthersCurled =
    dist(wrist, middleTip) < dist(wrist, middlePip) && dist(wrist, ringTip) < dist(wrist, ringPip) && dist(wrist, pinkyTip) < dist(wrist, pinkyPip) && dist(wrist, thumbTip) < dist(wrist, thumbPip);
  const isPointing = isIndexExtended && areOthersCurled;
  return isPointing;
}

export function isTwoFingerPointing(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const thumbTip = landmarks[4];
  const thumbPip = landmarks[6];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const isIndexExtended = dist(wrist, indexTip) > dist(wrist, indexPip);
  const isMiddleExtended = dist(wrist, middleTip) > dist(wrist, middlePip);
  const areOthersCurled = dist(wrist, ringTip) < dist(wrist, ringPip) && dist(wrist, pinkyTip) < dist(wrist, pinkyPip);
  const thumbExtended = dist(thumbTip, wrist) > dist(thumbPip, wrist);
  const isPointing = isIndexExtended && isMiddleExtended && areOthersCurled && thumbExtended;
  return isPointing;
}

export function isDoublePinchSign(leftGesture: Gesture, rightGesture: Gesture) {
  // Check if both gestures are PINCH
  const isLeftPinch = leftGesture.gestureID === GestureType.PINCH;
  const isRightPinch = rightGesture.gestureID === GestureType.PINCH;

  // console.log(`double pinch check: left ${isLeftPinch}, right ${isRightPinch}`);
  return isLeftPinch && isRightPinch;
}

export function isPinchSign(landmarks: NormalizedLandmark[]) {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  // For implementation of pinching
  // Distance between thumb and index tip
  const thumbIndexDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

  // Consider it "PINCH" if thumb + index are touching, and other fingers are up
  const isThumbIndexClose = thumbIndexDistance < 0.05; // Tune this if needed

  return isThumbIndexClose;
}
