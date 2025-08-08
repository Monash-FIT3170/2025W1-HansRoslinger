import { Gesture, gestureToScreenPosition } from "./gesture";

export const processZoomChart = (_1: Gesture, latestGesture: Gesture): void => {
  let leftHandScreenPosition, rightHandScreenPosition;
  try {
    leftHandScreenPosition = gestureToScreenPosition(
      latestGesture.doubleGestureLandmarks[0][9].x,
      latestGesture.doubleGestureLandmarks[0][9].y,
    );
    rightHandScreenPosition = gestureToScreenPosition(
      latestGesture.doubleGestureLandmarks[1][9].x,
      latestGesture.doubleGestureLandmarks[1][9].y,
    );
  // if this catch occurs it means that a closed fist has occured and we should end the zoom
  // we need this error catching because otherwise the left or right hand position when getting index 9 will crash
  } catch {
    leftHandScreenPosition = { screenX: 0, screenY: 0 };
    rightHandScreenPosition = { screenX: 0, screenY: 0 };
  }
  console.log(`starting left hand position: ${JSON.stringify(leftHandScreenPosition)}`);
  console.log(`starting right hand position: ${JSON.stringify(rightHandScreenPosition)}`);

  const gestureEvent = new CustomEvent("chart:togglezoom", {
    detail: {
      x: leftHandScreenPosition.screenX,
      y: leftHandScreenPosition.screenY,
    },
  });

  window.dispatchEvent(gestureEvent);
};

export const processZoom = (
  zoomStartPosition: { x: number; y: number },
  gestures: Gesture,
): void => {
  console.log(`gesture: ${JSON.stringify(gestures)}`);
  const leftHandScreenPosition = gestureToScreenPosition(
    gestures.doubleGestureLandmarks[0][9].x,
    gestures.doubleGestureLandmarks[0][9].y,
  );
  const rightHandScreenPosition = gestureToScreenPosition(
    gestures.doubleGestureLandmarks[1][9].x,
    gestures.doubleGestureLandmarks[1][9].y,
  );
  console.log(`left hand: ${JSON.stringify(leftHandScreenPosition)}`);
  console.log(`right hand: ${JSON.stringify(rightHandScreenPosition)}`);
  console.log(`zoom start: ${JSON.stringify(zoomStartPosition)}`);

  // we need to get the 
  const dx = leftHandScreenPosition.screenX - zoomStartPosition.x;
  const maxDistanceX = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedX = Math.min(Math.abs(dx) / maxDistanceX, 1);
  const deltaX = dx >= 0 ? normalizedX * 0.5 : -normalizedX * 0.5;

  const dy = leftHandScreenPosition.screenY - zoomStartPosition.y;
  const maxDistanceY = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedY = Math.min(Math.abs(Math.min(dy, 0)) / maxDistanceY, 1);

  const scaleX = Math.min(Math.max(1 + deltaX, 0.5), 1.5);
  const scaleY = 1 - normalizedY * 0.9;

  console.log("dx:", dx, "dy:", dy);
  console.log("Zoom scaleX:", scaleX, "scaleY:", scaleY);
  window.dispatchEvent(
    new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
      detail: { scaleX, scaleY },
    }),
  );
};
