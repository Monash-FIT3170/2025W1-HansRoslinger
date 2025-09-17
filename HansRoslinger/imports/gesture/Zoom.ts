import { Gesture, GestureType } from "./gesture";
import { gestureToScreenPosition } from "./util";

// We store the starting separations so we can compute ratios per frame
let initialDx = 0;
let initialDy = 0;

/**
 * Helper: get normalized hand coordinates for the two hands.
 * Uses landmark 8 (index finger tip) per hand for stability.
 * Falls back to landmark 9 if needed.
 */
function getHandsXY(latestGesture: Gesture): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  try {
    const leftHand = latestGesture.doubleGestureLandmarks[0];
    const rightHand = latestGesture.doubleGestureLandmarks[1];

    const l = leftHand[8];
    const r = rightHand[8];

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
 * Called when a zoom gesture is (re)started.
 * - Saves the initial horizontal/vertical separations (dx, dy)
 * - Emits chart:togglezoom centered at the midpoint between hands
 */
export const zoom = (_initial: Gesture, latestGesture: Gesture): void => {
  if (latestGesture.gestureID === GestureType.CLOSED_FIST) {
    console.log("ending zoom");
    window.dispatchEvent(
      new CustomEvent("chart:togglezoom", {
        detail: { x: 0, y: 0 },
      }),
    );
  }

  const hands = getHandsXY(latestGesture);

  if (!hands.left || !hands.right) {
    return;
  }

  // Save starting separations (normalized coordinates)
  initialDx = Math.abs(hands.right.x - hands.left.x);
  initialDy = Math.abs(hands.right.y - hands.left.y);

  // Avoid zero-division later: set minimal epsilon
  if (initialDx < 1e-4) initialDx = 1e-4;
  if (initialDy < 1e-4) initialDy = 1e-4;

  // Midpoint in screen pixels to focus the zoom around it
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

export const processZoom = (_zoomStartPosition: { x: number; y: number }, latestGesture: Gesture): void => {
  const hands = getHandsXY(latestGesture);
  if (!hands.left || !hands.right) return;

  const currentDx = Math.abs(hands.right.x - hands.left.x);
  const currentDy = Math.abs(hands.right.y - hands.left.y);

  const xDiff = currentDx - initialDx;
  const yDiff = currentDy - initialDy;

  const maxDistanceX = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedX = Math.min(Math.abs(xDiff) / maxDistanceX, 1);
  const deltaX = xDiff >= 0 ? normalizedX * 0.5 : -normalizedX * 0.5;

  const maxDistanceY = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedY = Math.min(Math.abs(yDiff) / maxDistanceY, 1);

  const scaleX = Math.min(Math.max(1 + deltaX, 0.5), 1.5);
  const scaleY = Math.min(1 - normalizedY * 0.9 + 0.1, 1);

  // console.log(`Zoom ratios: X: ${scaleX}, Y: ${scaleY}`);
  window.dispatchEvent(
    new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
      detail: { scaleX, scaleY },
    }),
  );
};
