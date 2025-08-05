import { Gesture } from './gesture';

export const processOpenPalmGesture = (
  _1: Gesture,
  _2: Gesture,
): void => {

  const gestureEvent = new CustomEvent('chart:clear', {
  });

  window.dispatchEvent(gestureEvent);
};
