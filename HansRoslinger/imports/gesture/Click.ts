import { Gesture } from "./gesture";
import { gestureToScreenPosition } from "./util";

/**
 * Simulates a mouse click based on a pinch gesture.
 * Uses the midpoint between index fingertip and thumb tip to determine click position.
 */
export const click = (_: Gesture, latestGesture: Gesture): void => {
  // Ensure there are enough landmarks to detect a pinch (need at least 9)
  if (!latestGesture.singleGestureLandmarks || latestGesture.singleGestureLandmarks.length < 9) {
    console.warn("[click] Not enough landmarks to click (need at least 9)", latestGesture.singleGestureLandmarks);
    return;
  }

  // Index fingertip and thumb tip landmarks
  const indexTipLandmark = latestGesture.singleGestureLandmarks[8];
  const thumbTipLandmark = latestGesture.singleGestureLandmarks[4];

  // Convert gesture coordinates to screen coordinates
  const screenPosition = gestureToScreenPosition(
    (indexTipLandmark.x + thumbTipLandmark.x) / 2,
    (indexTipLandmark.y + thumbTipLandmark.y) / 2,
    indexTipLandmark.z && thumbTipLandmark.z ? (indexTipLandmark.z + thumbTipLandmark.z) / 2 : undefined,
  );

  // List of clickable elements by ID
  const clickableElementIDs = ["gesture-detection-toggle"];

  // Check each clickable element to see if the gesture overlaps it
  for (const clickableElementID of clickableElementIDs) {
    const clickableElement = document.getElementById(clickableElementID);
    const rect = clickableElement?.getBoundingClientRect();

    // If the gesture midpoint is within the element's bounding box, dispatch a click
    if (clickableElement && rect &&
        screenPosition.screenX >= rect.left &&
        screenPosition.screenX <= rect.right &&
        screenPosition.screenY >= rect.top &&
        screenPosition.screenY <= rect.bottom) {

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: screenPosition.screenX,
        clientY: screenPosition.screenY,
      });

      clickableElement.dispatchEvent(clickEvent);
    }
  }
};
