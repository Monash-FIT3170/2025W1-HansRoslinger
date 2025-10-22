export const Undo = (): void => {
  const gestureEvent = new CustomEvent("undo", {});
  console.log("Dispatching UNDO gesture event");
  window.dispatchEvent(gestureEvent);
};