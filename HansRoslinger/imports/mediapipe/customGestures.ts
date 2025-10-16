import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Gesture, GestureType } from "../gesture/gesture";
import { isDrawModeEnabled } from "../gesture/Draw";
import { Handedness } from "./types";

export function recogniseCustomGesture(landmarks: NormalizedLandmark[], handedness: Handedness = Handedness.RIGHT): { gestureID: GestureType; confidence: number } | null {
  if (!landmarks || landmarks.length < 21) return null;

  const drawEnabled = isDrawModeEnabled();

  if (isDrawGesture(landmarks, drawEnabled)) {
    return {
      gestureID: GestureType.DRAW,
      confidence: 1.0,
    };
  } else if (isPinchSign(landmarks)) {
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
  const wristToTip = dist(wrist, indexTip);
  const wristToPip = dist(wrist, indexPip);
  const pipToTip = dist(indexPip, indexTip);
  const pipToDip = dist(indexPip, indexDip);
  const isIndexExtended = wristToTip > wristToPip + 0.035 && pipToTip > pipToDip + 0.01;
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

  const distanceMultiplier = isDrawModeActive ? 1.2 : 1;
  const loosenedRingGap = isDrawModeActive ? 0.05 : 0.06;

  const fingersClose =
    thumbIndexDistance < 0.03 * distanceMultiplier && thumbMiddleDistance < 0.035 * distanceMultiplier && indexMiddleDistance < 0.025 * distanceMultiplier && indexRingDistance > loosenedRingGap;

  console.log(`thumb-index distance: ${thumbIndexDistance.toFixed(4)}`);
  console.log(`thumb-middle distance: ${thumbMiddleDistance.toFixed(4)}`);
  console.log(`index-middle distance: ${indexMiddleDistance.toFixed(4)}`);
  console.log(`index-ring distance: ${indexRingDistance.toFixed(4)}`);
  console.log(`Draw gesture check: fingersClose=${fingersClose}, areOthersCurled=${areOthersCurled}, drawMode=${isDrawModeActive}`);

  return fingersClose && areOthersCurled;
}

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

  console.log(`thumb-index distance: ${thumbIndexDistance.toFixed(4)}`);
  console.log(`thumb-middle distance: ${thumbMiddleDistance.toFixed(4)}`);
  console.log(`isMiddleRelaxed: ${isMiddleRelaxed}`);
  console.log(`Pinch gesture check: isPinch=${isPinch}`);

  return isPinch;
}
