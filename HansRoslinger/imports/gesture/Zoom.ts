import { Gesture, GestureType } from "./gesture";
import { gestureToScreenPosition } from "./util";

// Store the initial separation between hands to compute zoom ratios
let initialDx = 0;
let initialDy = 0;

/**
 * Helper: extract screen coordinates for both hands from MediaPipe landmarks.
 * Uses index finger tip (landmark 8) for stability. Falls back if missing.
 */
function getHandsXY(latestGesture: Gesture): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  try {
    const leftHand = latestGesture.doubleGestureLandmarks[0];
    const rightHand = latestGesture.doubleGestureLandmarks[1];

    const l = leftHand[8]; // index finger tip
    const r = rightHand[8]; // index finger tip

    // Convert normalized landmarks to screen coordinates
    const leftHandToScreen = gestureToScreenPosition(l.x, l.y);
    const rightHandToScreen = gestureToScreenPosition(r.x, r.y);

    if (!l || !r) return { left: null, right: null };
    return {
      left: { x: leftHandToScreen.screenX, y: leftHandToScreen.screenY },
      right: { x: rightHandToScreen.screenX, y: rightHandToScreen.screenY },
    };
  } catch {
    return { left: null, right: null };
  }
}

/**
 * Called when a zoom gesture is first detected.
 * - Saves initial horizontal/vertical separation between hands.
 * - Computes midpoint for zoom focus.
 * - Emits "chart:togglezoom" event centered at midpoint.
 */
export const zoom = (_initial: Gesture, latestGesture: Gesture): void => {
  if (latestGesture.gestureID === GestureType.CLOSED_FIST) {
    // Ending zoom mode on closed fist
    console.log("ending zoom");
    window.dispatchEvent(
      new CustomEvent("chart:togglezoom", {
        detail: { x: 0, y: 0 },
      }),
    );
  }

  const hands = getHandsXY(latestGesture);
  if (!hands.left || !hands.right) return;

  // Save starting separation between hands
  initialDx = Math.abs(hands.right.x - hands.left.x);
  initialDy = Math.abs(hands.right.y - hands.left.y);

  // Avoid divide-by-zero
  if (initialDx < 1e-4) initialDx = 1e-4;
  if (initialDy < 1e-4) initialDy = 1e-4;

  // Compute midpoint to center zoom around
  const leftScreen = gestureToScreenPosition(hands.left.x, hands.left.y);
  const rightScreen = gestureToScreenPosition(hands.right.x, hands.right.y);
  const midX = (leftScreen.screenX + rightScreen.screenX) / 2;
  const midY = (leftScreen.screenY + rightScreen.screenY) / 2;

  window.dispatchEvent(
    new CustomEvent("chart:togglezoom", {
      detail: { x: midX, y: midY },
    }),
  );
};

/**
 * Process zoom during an ongoing gesture.
 * - Computes the change in separation between hands from initial.
 * - Normalizes differences relative to screen size.
 * - Computes a scaling factor (scaleX, scaleY) within limits.
 * - Emits "chart:zoom" event with computed scale.
 */
export const processZoom = (_zoomStartPosition: { x: number; y: number }, latestGesture: Gesture): void => {
  const hands = getHandsXY(latestGesture);
  if (!hands.left || !hands.right) return;

  const currentDx = Math.abs(hands.right.x - hands.left.x);
  const currentDy = Math.abs(hands.right.y - hands.left.y);

  // Compute difference from initial separation
  const xDiff = currentDx - initialDx;
  const yDiff = currentDy - initialDy;

  // Normalize by a fraction of the screen size to get proportional zoom
  const maxDistanceX = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedX = Math.min(Math.abs(xDiff) / maxDistanceX, 1);
  const deltaX = xDiff >= 0 ? normalizedX * 1.5 : -normalizedX * 1.5;

  const maxDistanceY = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedY = Math.min(Math.abs(yDiff) / maxDistanceY, 1);

  // Clamp scale factors to reasonable range
  const scaleX = Math.min(Math.max(1 + deltaX, 0.5), 3.0); // horizontal zoom
  const scaleY = Math.min(1 - normalizedY * 0.9 + 0.1, 1); // vertical zoom (restrict shrink)

  // Emit zoom event
  window.dispatchEvent(
    new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
      detail: { scaleX, scaleY },
    }),
  );
};
