/**
 * Triggers a dataset switch event.
 *
 * This function dispatches a custom event "chart:next-data" on the window.
 * The event can be listened to elsewhere in the app to update the displayed dataset
 * whenever the corresponding gesture (e.g., TWO_FINGER_POINTING_RIGHT) is detected.
 */
export const processSwitchDataset = (): void => {
  // Create a new custom event for switching to the next dataset
  const gestureEvent = new CustomEvent("chart:next-data", {});

  // Dispatch the event globally so any listeners (chart components) can respond
  window.dispatchEvent(gestureEvent);
};
