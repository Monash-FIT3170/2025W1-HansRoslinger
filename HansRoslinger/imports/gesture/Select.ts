import { Gesture, gestureToScreenPosition } from "./gesture";

// Dwell configuration for permanent selection
const HOVER_SELECT_DELAY_MS = 500; // time hovering before permanent highlight
const HOVER_STABILITY_PX = 20; // how steady the finger must be to accumulate dwell

let hoverStartAt = 0;
let lastHoverPos: { x: number; y: number } | null = null;
let sentPermanentForThisHover = false;

function isStable(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) <= HOVER_STABILITY_PX;
}

export const select = (_: Gesture, latestGesture: Gesture): void => {
  if (!latestGesture.singleGestureLandmarks || latestGesture.singleGestureLandmarks.length < 9) {
    console.warn("[select] Not enough landmarks to select (need at least 9)", latestGesture.singleGestureLandmarks);
    return;
  }
  const pointerLandmark = latestGesture.singleGestureLandmarks[8];
  const screenPosition = gestureToScreenPosition(
    pointerLandmark.x,
    pointerLandmark.y,
    pointerLandmark.z,
  );

  // console.log(`Pointing Up Gesture detected! Screen Position: ${screenPosition.screenX}, ${screenPosition.screenY}`,);

  const pos = { x: screenPosition.screenX, y: screenPosition.screenY };

  // Always emit a transient hover event for "piano key" highlight
  window.dispatchEvent(
    new CustomEvent("chart:hover", { detail: pos })
  );

  // Dwell logic for permanent highlight
  const now = Date.now();
  if (!lastHoverPos || !isStable(pos, lastHoverPos)) {
    // Finger moved to a new area: reset dwell timer and allow a new permanent highlight
    lastHoverPos = pos;
    hoverStartAt = now;
    sentPermanentForThisHover = false;
    return;
  }

  // Finger is stable; check if dwell time exceeded and not yet sent
  if (!sentPermanentForThisHover && now - hoverStartAt >= HOVER_SELECT_DELAY_MS) {
    window.dispatchEvent(
      new CustomEvent("chart:highlight", { detail: pos })
    );
    sentPermanentForThisHover = true;
  }
};
