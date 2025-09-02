import { Gesture, gestureToScreenPosition } from "./gesture";

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

  // Dispatch custom chart event with screen position
  const gestureEvent = new CustomEvent("chart:highlight", {
    detail: {
      x: screenPosition.screenX,
      y: screenPosition.screenY,
    },
  });

  window.dispatchEvent(gestureEvent);
};
