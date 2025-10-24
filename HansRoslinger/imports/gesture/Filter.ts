/**
 * Dispatches a custom event to trigger filtering in the chart.
 *
 * Logic:
 * - Creates a CustomEvent named "chart:filter"
 * - Dispatches it on the window object so any listener in the app can respond
 * - This keeps the gesture handling decoupled from the actual chart logic
 */
export const filter = (): void => {
  const gestureEvent = new CustomEvent("chart:filter", {});
  window.dispatchEvent(gestureEvent);
};
