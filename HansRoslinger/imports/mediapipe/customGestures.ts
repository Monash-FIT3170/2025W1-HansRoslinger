import { NormalizedLandmark } from "@mediapipe/tasks-vision"; // Import type for hand landmarks
import { Gesture, GestureType } from "../gesture/gesture"; // Import Gesture types
import { isDrawModeEnabled } from "../gesture/Draw"; // Function to check if draw mode is active
import { Handedness } from "./types"; // Enum for LEFT, RIGHT hand

// Function to recognize custom gestures from hand landmarks
export function recogniseCustomGesture(landmarks: NormalizedLandmark[], handedness: Handedness = Handedness.RIGHT): { gestureID: GestureType; confidence: number } | null {
  // Return null if landmarks are missing or incomplete
  if (!landmarks || landmarks.length < 21) return null;

  // Check if draw mode is active
  const drawEnabled = isDrawModeEnabled();

  // Detect gestures in order of priority
  if (isDrawGesture(landmarks, drawEnabled)) {
    return {
      gestureID: GestureType.DRAW,
      confidence: 1.0, // Full confidence
    };
  } else if (isPinchSign(landmarks)) {
    return {
      gestureID: GestureType.PINCH,
      confidence: 1.0,
    };
  } else if (isTwoFingerPointing(landmarks)) {
    // Differentiate left/right hand for two-finger pointing
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
  // No gesture detected
  return null;
}

// Handle gestures that should work even when gesture detection is disabled
export function handleDisableExemptGestures(currentGestures: Gesture[], HandleGesture: (g: Gesture) => void): boolean {
  let handled = false;
  for (let index = 0; index < currentGestures.length; index++) {
    // Only check for PINCH gestures
    if (currentGestures[index] && currentGestures[index].gestureID === GestureType.PINCH) {
      HandleGesture(currentGestures[index]); // Call callback
      handled = true;
    }
  }
  return handled;
}

// Call HandleGesture for all single-handed gestures
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

// Detect and handle two-handed gestures, e.g., double pinch
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
  // Placeholder for additional two-handed gestures
  return false;
}

// Check if a single finger pointing gesture is present
export function isPointing(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexDip = landmarks[7];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const thumbTip = landmarks[4];
  const thumbPip = landmarks[6];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Distances to check if index is extended
  const wristToTip = dist(wrist, indexTip);
  const wristToPip = dist(wrist, indexPip);
  const pipToTip = dist(indexPip, indexTip);
  const pipToDip = dist(indexPip, indexDip);
  const isIndexExtended = wristToTip > wristToPip + 0.035 && pipToTip > pipToDip + 0.01;

  // Check if other fingers are curled
  const areOthersCurled =
    dist(wrist, middleTip) < dist(wrist, middlePip) && dist(wrist, ringTip) < dist(wrist, ringPip) && dist(wrist, pinkyTip) < dist(wrist, pinkyPip) && dist(wrist, thumbTip) < dist(wrist, thumbPip);

  const isPointing = isIndexExtended && areOthersCurled;
  return isPointing;
}

// Check if two-finger pointing gesture is present
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

  return isIndexExtended && isMiddleExtended && areOthersCurled && thumbExtended;
}

// Check if both hands are performing PINCH gesture
export function isDoublePinchSign(leftGesture: Gesture, rightGesture: Gesture) {
  const isLeftPinch = leftGesture.gestureID === GestureType.PINCH;
  const isRightPinch = rightGesture.gestureID === GestureType.PINCH;
  return isLeftPinch && isRightPinch;
}

// Detect if a draw gesture is present
export function isDrawGesture(landmarks: NormalizedLandmark[], isDrawModeActive: boolean = false): boolean {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const wrist = landmarks[0];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const thumbIndexDistance = dist(thumbTip, indexTip);
  const thumbMiddleDistance = dist(thumbTip, middleTip);
  const indexMiddleDistance = dist(indexTip, middleTip);
  const indexRingDistance = dist(indexTip, ringTip);

  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const areOthersCurled = dist(wrist, ringTip) < dist(wrist, ringPip) && dist(wrist, pinkyTip) < dist(wrist, pinkyPip);

  // Adjust thresholds based on draw mode
  const distanceMultiplier = isDrawModeActive ? 1.2 : 1;
  const loosenedRingGap = isDrawModeActive ? 0.05 : 0.06;

  // Check if fingers are close enough to be considered a draw gesture
  const fingersClose =
    thumbIndexDistance < 0.03 * distanceMultiplier && thumbMiddleDistance < 0.035 * distanceMultiplier && indexMiddleDistance < 0.025 * distanceMultiplier && indexRingDistance > loosenedRingGap;

  console.log(`Draw gesture check: fingersClose=${fingersClose}, areOthersCurled=${areOthersCurled}, drawMode=${isDrawModeActive}`);

  return fingersClose && areOthersCurled;
}

// Detect if a pinch gesture is present
export function isPinchSign(landmarks: NormalizedLandmark[]) {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const wrist = landmarks[0];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const thumbIndexDistance = dist(thumbTip, indexTip);
  const thumbMiddleDistance = dist(thumbTip, middleTip);
  const isMiddleRelaxed = dist(wrist, middleTip) < dist(wrist, middlePip);

  const isPinch = thumbIndexDistance < 0.03 && thumbMiddleDistance > 0.045 && isMiddleRelaxed;

  console.log(`Pinch gesture check: isPinch=${isPinch}`);

  return isPinch;
}
