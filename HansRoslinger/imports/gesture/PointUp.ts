import { Gesture, gestureToScreenPosition } from './gesture';

export const processPointUpGesture = (
  _: Gesture,
  latestGesture: Gesture,
): void => {
  const pointerLandmark = latestGesture.landmarks[8];
  const screenPosition = gestureToScreenPosition(
    pointerLandmark.x,
    pointerLandmark.y,
    pointerLandmark.z,
  );

  console.log(
    `Pointing Up Gesture detected! Screen Position: ${screenPosition.screenX}, ${screenPosition.screenY}`,
  );

  // Dispatch custom chart event with screen position
  const gestureEvent = new CustomEvent('chart:highlight', {
    detail: {
      x: screenPosition.screenX,
      y: screenPosition.screenY,
    },
  });

  window.dispatchEvent(gestureEvent);
};
