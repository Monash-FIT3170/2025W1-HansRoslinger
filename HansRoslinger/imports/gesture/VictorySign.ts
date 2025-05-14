import { Gesture, gestureToScreenPosition } from './gesture';

export const processVictorySignGesture = (
  _1: Gesture,
  latestGesture: Gesture,
): void => {
  const screenPosition = gestureToScreenPosition(
    latestGesture.landmarks[9].x,
    latestGesture.landmarks[9].y
  );

  const gestureEvent = new CustomEvent('chart:togglezoom', {
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
    gestures.landmarks[0].x,
    gestures.landmarks[0].y
  );

  const dx = currentPosition.screenX - zoomStartPosition.x;
  const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  const normalized = Math.min(Math.abs(dx) / maxDistance, 1);
  const delta = dx >= 0 ? normalized * 0.5 : -normalized * 0.5;

  const scale = Math.min(Math.max(1 + delta, 0.5), 1.5);
  window.dispatchEvent(new CustomEvent<number>('chart:zoom', { detail: scale }));
};