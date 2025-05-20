import { Gesture } from './gesture';

export const processSwitchChartType = (
  _1: Gesture,
  _2: Gesture,
): void => {

  const gestureEvent = new CustomEvent('chart:switch', {
  });

  window.dispatchEvent(gestureEvent);
};
