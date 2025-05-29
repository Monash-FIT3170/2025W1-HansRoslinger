export const processClearChart = (): void => {
  const gestureEvent = new CustomEvent("chart:clear", {});

  window.dispatchEvent(gestureEvent);
};
