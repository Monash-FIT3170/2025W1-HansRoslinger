import { Gesture, gestureToScreenPosition } from "./gesture";

export const processVictorySignGesture = (
  _1: Gesture,
  latestGesture: Gesture,
): void => {
  const screenPosition = gestureToScreenPosition(
    latestGesture.landmarks[9].x,
    latestGesture.landmarks[9].y,
  );

  const gestureEvent = new CustomEvent("chart:togglezoom", {
    detail: {
      x: screenPosition.screenX,
      y: screenPosition.screenY,
    },
  });

  window.dispatchEvent(gestureEvent);
};

export const processZoom = (
  zoomStartPosition: { x: number; y: number },
  gestures: Gesture,
): void => {
  const currentPosition = gestureToScreenPosition(
    gestures.landmarks[9].x,
    gestures.landmarks[9].y,
  );

  const dx = currentPosition.screenX - zoomStartPosition.x;
  const maxDistanceX = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalizedX = Math.min(Math.abs(dx) / maxDistanceX, 1);
  const deltaX = dx >= 0 ? normalizedX * 0.5 : -normalizedX * 0.5;

  const dy = currentPosition.screenY - zoomStartPosition.y;
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
