import { Gesture, gestureToScreenPosition } from "./gesture";

export const click = (_: Gesture, latestGesture: Gesture): void => {
  if (
    !latestGesture.singleGestureLandmarks ||
    latestGesture.singleGestureLandmarks.length < 9
  ) {
    console.warn(
      "[click] Not enough landmarks to click (need at least 9)",
      latestGesture.singleGestureLandmarks,
    );
    return;
  }
  const pointerLandmark = latestGesture.singleGestureLandmarks[8];
  const screenPosition = gestureToScreenPosition(
    pointerLandmark.x,
    pointerLandmark.y,
    pointerLandmark.z,
  );

  // ADD IDs of other clickable (pinchable) elements here
  const clickableElementIDs = ["gesture-detection-toggle"]

  for (const clickableElementID of clickableElementIDs) {
    const clickableElement = document.getElementById(clickableElementID)
    const rect = clickableElement?.getBoundingClientRect()

    if (clickableElement && rect && screenPosition.screenX >= rect.left &&
        screenPosition.screenX <= rect.right &&
        screenPosition.screenY >= rect.top &&
        screenPosition.screenY <= rect.bottom) {
        const clickEvent = new MouseEvent('click', {
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