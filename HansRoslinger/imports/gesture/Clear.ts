// Dispatches a custom event to notify listeners that the chart should be cleared
export const clear = (): void => {
  const gestureEvent = new CustomEvent("chart:clear", {});

  // Trigger the event on the window object
  window.dispatchEvent(gestureEvent);
};
