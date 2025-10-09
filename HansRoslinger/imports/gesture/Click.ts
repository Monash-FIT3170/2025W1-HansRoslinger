import { Gesture } from "./gesture";
import { gestureToScreenPosition } from "./util";

export const click = (_: Gesture, latestGesture: Gesture): void => {
  if (!latestGesture.singleGestureLandmarks || latestGesture.singleGestureLandmarks.length < 9) {
    console.warn("[click] Not enough landmarks to click (need at least 9)", latestGesture.singleGestureLandmarks);
    return;
  }
  const indexTipLandmark = latestGesture.singleGestureLandmarks[8];
  const thumbTipLandmark = latestGesture.singleGestureLandmarks[4];
  const screenPosition = gestureToScreenPosition(
    (indexTipLandmark.x + thumbTipLandmark.x) / 2,
    (indexTipLandmark.y + thumbTipLandmark.y) / 2,
    indexTipLandmark.z && thumbTipLandmark.z ? (indexTipLandmark.z + thumbTipLandmark.z) / 2 : undefined,
  );

  // If pinch is wished to be used like a mouse click anywhere (not restricted to specified elements), use this line:
  // const target = document.elementFromPoint(screenPosition.screenX, screenPosition.screenY);

  // ADD IDs of other clickable (pinchable) elements here
  const clickableElementIDs = ["gesture-detection-toggle"];

  for (const clickableElementID of clickableElementIDs) {
    const clickableElement = document.getElementById(clickableElementID);
    const rect = clickableElement?.getBoundingClientRect();

    if (clickableElement && rect && screenPosition.screenX >= rect.left && screenPosition.screenX <= rect.right && screenPosition.screenY >= rect.top && screenPosition.screenY <= rect.bottom) {
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
