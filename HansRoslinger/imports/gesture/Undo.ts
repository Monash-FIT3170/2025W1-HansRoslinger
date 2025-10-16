export const Undo = (): void => {
  const gestureEvent = new CustomEvent("undo", {});

  window.dispatchEvent(gestureEvent);
};