import { Gesture, gestureToScreenPosition } from "./gesture";

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

    // Prefer 8 (index fingertip); if missing, try 9 to match your previous code
    const l = leftHand[8] ?? leftHand[9];
    const r = rightHand[8] ?? rightHand[9];

    if (!l || !r) return { left: null, right: null };
    return {
      left: { x: l.x, y: l.y },
      right: { x: r.x, y: r.y },
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
export const processZoomChart = (_initial: Gesture, latestGesture: Gesture): void => {
  const hands = getHandsXY(latestGesture);

  if (!hands.left || !hands.right) {
    // If we can't read both hands (e.g., closed fist terminates), just toggle zoom off safely
    window.dispatchEvent(new CustomEvent("chart:togglezoom"));
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

/**
 * Called every frame while zoom is active.
 * - Computes current separations and sends scaleX/scaleY ratios
 */
export const processZoom = (_zoomStartPosition: { x: number; y: number }, latestGesture: Gesture): void => {
  const hands = getHandsXY(latestGesture);
  if (!hands.left || !hands.right) return;

  const currentDx = Math.abs(hands.right.x - hands.left.x);
  const currentDy = Math.abs(hands.right.y - hands.left.y);

  // Compute scale as ratio vs. initial; clamp to reasonable bounds
  let scaleX = currentDx / initialDx;
  let scaleY = currentDy / initialDy;

  // Clamp both axes. Feel free to tweak:
  // - X: 0.5–1.8 (horizontal zoom in/out)
  // - Y: 0.5–1.5 (vertical zoom in/out)
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  scaleX = clamp(scaleX, 0.5, 1.8);
  scaleY = clamp(scaleY, 0.5, 1.5);

  // Dispatch for D3 components to apply visual + domain zoom
  window.dispatchEvent(
    new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
      detail: { scaleX, scaleY },
    }),
  );
};
