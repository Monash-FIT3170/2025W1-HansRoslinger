export const processOpenPalmGesture = (): void => {
  const gestureEvent = new CustomEvent("chart:clear", {});

  window.dispatchEvent(gestureEvent);
};
