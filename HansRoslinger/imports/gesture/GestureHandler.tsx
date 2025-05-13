
import {Gesture, Handedness, defaultMapping} from "imports/gesture/gesture";

const GestureHandler = () => {
  const GESTURE_TIME_TO_ACTIVATE = 500      // in ms

  const activeGestures: Record<Handedness, Gesture|null> = {
    [Handedness.LEFT]: null,
    [Handedness.RIGHT]: null
  }

  // Process MediaPipe output
  const handleGesture = (gesture: Gesture) => {
    const now: number = Date.now();

    const currentGesture: Gesture|null = activeGestures[gesture.handedness];

    if (!currentGesture || currentGesture.gestureID!==gesture.gestureID) {
      // Store Gesture
      activeGestures[gesture.handedness] = gesture;
    } else {
      // Trigger Gesture
      const elapsed: number = now - currentGesture.timestamp.getTime();
      if (elapsed >= GESTURE_TIME_TO_ACTIVATE) {
        defaultMapping[gesture.gestureID](currentGesture, gesture);
      }
    }

  }

};

export default GestureHandler;