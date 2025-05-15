import { Gesture, Handedness, handleGestureToFunc } from "./gesture";
import { useRef } from "react";

let isZoomEnabled = false;

window.addEventListener("chart:togglezoom", (_: Event) => {
  isZoomEnabled = !isZoomEnabled;
});

export const GestureHandler = () => {
  const GESTURE_TIME_TO_ACTIVATE = 500; // in ms

  const activeGestures = useRef<Record<Handedness, Gesture | null>>({
    [Handedness.LEFT]: null,
    [Handedness.RIGHT]: null,
  });

  const HandleGesture = (gesture: Gesture) => {
    const now: number = Date.now();
    const currentGesture = activeGestures.current[gesture.handedness];

    if (!currentGesture || currentGesture.gestureID !== gesture.gestureID) {
      activeGestures.current[gesture.handedness] = gesture;
    } else {
      const elapsed = now - currentGesture.timestamp.getTime();
      if (elapsed >= GESTURE_TIME_TO_ACTIVATE || isZoomEnabled) {
        handleGestureToFunc(gesture.gestureID, currentGesture, gesture);
        // we update the time so we don't have duplicate activations
        currentGesture.timestamp = new Date();

      }
    }
  };

  return { HandleGesture };
};

export default GestureHandler;
