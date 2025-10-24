import { Gesture } from "./gesture";
import { gestureToScreenPosition } from "./util";

/**
 * Dwell configuration for permanent selection:
 *  - HOVER_SELECT_DELAY_MS: How long the finger must hover steadily to trigger permanent selection
 *  - HOVER_STABILITY_PX: Maximum allowed movement in pixels to consider finger "stable"
 */
const HOVER_SELECT_DELAY_MS = 500; // 500ms dwell time
const HOVER_STABILITY_PX = 20; // 20px tolerance for stability

// State for tracking dwell selection
let hoverStartAt = 0; // Timestamp when finger first became stable
let lastHoverPos: { x: number; y: number } | null = null; // Last recorded finger position
let sentPermanentForThisHover = false; // Prevent multiple permanent highlights per stable hover

/**
 * Checks whether two positions are close enough to be considered "stable"
 * @param a First position
 * @param b Second position
 */
function isStable(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) <= HOVER_STABILITY_PX;
}

/**
 * Handles the "POINTING_UP" gesture for selection
 * 
 * This implements a dwell-based selection system:
 *  1. Continuously emits transient "hover" events for UI feedback (like piano key highlight)
 *  2. Tracks whether the finger is stable enough
 *  3. If the finger remains stable for HOVER_SELECT_DELAY_MS, emit a permanent "highlight"
 */
export const select = (_: Gesture, latestGesture: Gesture): void => {
  // Ensure enough landmarks are available (at least 9 required for index finger tip)
  if (!latestGesture.singleGestureLandmarks || latestGesture.singleGestureLandmarks.length < 9) {
    console.warn(
      "[select] Not enough landmarks to select (need at least 9)",
      latestGesture.singleGestureLandmarks
    );
    return;
  }

  // Use index fingertip (landmark 8) as pointer
  const pointerLandmark = latestGesture.singleGestureLandmarks[8];
  const screenPosition = gestureToScreenPosition(pointerLandmark.x, pointerLandmark.y, pointerLandmark.z);

  const pos = { x: screenPosition.screenX, y: screenPosition.screenY };

  // Always emit a transient hover event for immediate UI feedback
  window.dispatchEvent(new CustomEvent("chart:hover", { detail: pos }));

  const now = Date.now();

  // If finger moved beyond stability threshold, reset dwell timer
  if (!lastHoverPos || !isStable(pos, lastHoverPos)) {
    lastHoverPos = pos;
    hoverStartAt = now;
    sentPermanentForThisHover = false; // Allow new permanent highlight
    return;
  }

  // Finger is stable; check if dwell time exceeded and permanent highlight not yet sent
  if (!sentPermanentForThisHover && now - hoverStartAt >= HOVER_SELECT_DELAY_MS) {
    window.dispatchEvent(new CustomEvent("chart:highlight", { detail: pos }));
    sentPermanentForThisHover = true; // Prevent repeated permanent events for same hover
  }
};
