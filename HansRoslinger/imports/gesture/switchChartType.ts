export const processSwitchChartType = (): void => {

  const gestureEvent = new CustomEvent('chart:switch', {
  });

  window.dispatchEvent(gestureEvent);
};
