import { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { Gesture, GestureType, Handedness, handleGestureToFunc } from "./gesture";
import { useRef } from "react";

let isZoomEnabled = false;

window.addEventListener("chart:togglezoom", () => {
  isZoomEnabled = !isZoomEnabled;
});

export const GestureHandler = () => {
  const GESTURE_TIME_TO_ACTIVATE = 500; // in ms

  const activeGestures = useRef<Record<Handedness, Gesture | null>>({
    [Handedness.LEFT]: null,
    [Handedness.RIGHT]: null,
  });

  const HandleGesture = (gesture: Gesture) => {
    const landmarks = gesture.landmarks

    gesture.gestureID = getGestureType(landmarks, gesture)

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

function getGestureType(landmarks, gesture): GestureType {
  console.log("Reading")
  if (landmarks[8].x < landmarks[6].x && 
    landmarks[6].x < landmarks[0].x &&
    landmarks[4].y > landmarks[2].y &&
    landmarks[12].y > landmarks[7].y &&
    landmarks[16].y > landmarks[7].y &&
    landmarks[20].y > landmarks[7].y
    
  ) return GestureType.POINTING_LEFT;

  if (landmarks[8].x > landmarks[6].x &&
    landmarks[6].x > landmarks[0].x &&
    landmarks[4].y > landmarks[2].y &&
    landmarks[12].y < landmarks[7].y &&
    landmarks[16].y < landmarks[7].y &&
    landmarks[20].y < landmarks[7].y
  ) return GestureType.POINTING_RIGHT;

  return gesture.gestureID
}