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
  const indexTipLandmark = latestGesture.singleGestureLandmarks[8];
  const thumbTipLandmark = latestGesture.singleGestureLandmarks[4];
  const screenPosition = gestureToScreenPosition(
    (indexTipLandmark.x + thumbTipLandmark.x) / 2,
    (indexTipLandmark.y + thumbTipLandmark.y) / 2,
    indexTipLandmark.z && thumbTipLandmark.z ? (indexTipLandmark.z + thumbTipLandmark.z) / 2 : undefined,
  );

  const target = document.elementFromPoint(screenPosition.screenX, screenPosition.screenY);
  const rect = target?.getBoundingClientRect();

  if (
    target &&
    rect &&
    screenPosition.screenX >= rect.left &&
    screenPosition.screenX <= rect.right &&
    screenPosition.screenY >= rect.top &&
    screenPosition.screenY <= rect.bottom
  ) {
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: screenPosition.screenX,
      clientY: screenPosition.screenY,
    });

    target.dispatchEvent(clickEvent);
  }
};
