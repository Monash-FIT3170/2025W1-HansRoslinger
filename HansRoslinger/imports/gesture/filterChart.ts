export const processFilterChart = (): void => {
  const gestureEvent = new CustomEvent("chart:filter", {});

  window.dispatchEvent(gestureEvent);
};
