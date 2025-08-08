export const clear = (): void => {
  const gestureEvent = new CustomEvent("chart:clear", {});

  window.dispatchEvent(gestureEvent);
};
