import { Gesture } from "./gesture";

export const filter = (_1: Gesture, _2: Gesture): void => {
  const gestureEvent = new CustomEvent("chart:filter", {});

  window.dispatchEvent(gestureEvent);
};
