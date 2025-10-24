/**
 * Triggers a chart type switch event.
 *
 * This function dispatches a custom event "chart:switch" on the window.
 * The event can be listened to elsewhere in the app to update the chart type
 * whenever the corresponding gesture (e.g., TWO_FINGER_POINTING_LEFT) is detected.
 */
export const processSwitchChartType = (): void => {
  // Create a new custom event for switching the chart
  const gestureEvent = new CustomEvent("chart:switch", {});

  // Dispatch the event globally so any listeners (chart components) can respond
  window.dispatchEvent(gestureEvent);
};
