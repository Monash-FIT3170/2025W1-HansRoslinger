export const filter = (): void => {
  const gestureEvent = new CustomEvent("chart:filter", {});

  window.dispatchEvent(gestureEvent);
};
