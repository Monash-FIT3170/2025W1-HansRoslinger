export const processClosedFistGesture = (): void => {
  const gestureEvent = new CustomEvent("chart:filter", {});

  window.dispatchEvent(gestureEvent);
};
