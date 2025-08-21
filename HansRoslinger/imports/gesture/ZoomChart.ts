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
// ZoomChart.ts

export const processZoom = (
  _zoomStartPosition: { x: number; y: number },
  latestGesture: Gesture
): void => {
  const hands = getHandsXY(latestGesture);
  if (!hands.left || !hands.right) return;

  const currentDx = Math.abs(hands.right.x - hands.left.x);
  const currentDy = Math.abs(hands.right.y - hands.left.y);

  // Ratios vs the saved starting separations
  const ratioX = currentDx / initialDx;
  const ratioY = currentDy / initialDy;

  // Helper
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  // --- NEW: vertical-dominant detection
  // If vertical separation change dominates horizontal by >30%, treat as "global zoom" mode
  const VERTICAL_DOMINANCE_FACTOR = 1.3;
  const verticalDominant = ratioY > ratioX * VERTICAL_DOMINANCE_FACTOR;

  // Hand ordering (in MediaPipe, smaller y is higher on the screen)
  const isRightAboveLeft = hands.right.y < hands.left.y;

  if (verticalDominant) {
    // --- NEW: Global (uniform) zoom based on vertical expansion/contraction
    // Pulling apart increases ratioY (>1). Direction is decided by hand ordering:
    // - Right above & left below => interpret as "zoom OUT" -> invert factor
    // - Right below & left above => "zoom IN" -> use factor as-is
    let uniform = clamp(ratioY, 0.5, 2.0);
    if (isRightAboveLeft) {
      // Zoom OUT when right hand is above
      uniform = 1 / uniform;
    }

    window.dispatchEvent(
      new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
        detail: { scaleX: uniform, scaleY: uniform },
      })
    );
    return; // Do not also run the axis-specific path this frame
  }

  // --- Existing behavior (axis-specific zoom):
  // Scale X from vertical change; Scale Y from horizontal change
  let scaleX = ratioY; // "more/less bars" behavior 
  let scaleY = ratioX;

  // Original clamps (tweak if desired)
  scaleX = clamp(scaleX, 1, 1.8);
  scaleY = clamp(scaleY, 0.1, 1.5);

  window.dispatchEvent(
    new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
      detail: { scaleX, scaleY },
    })
  );
};

