
import {Gesture, Handedness, defaultMapping} from "imports/gesture/gesture";

const GestureHandler = () => {
  const activeGestures: Record<Handedness, Gesture|null> = {
    [Handedness.LEFT]: null,
    [Handedness.RIGHT]: null
  }

  // Process MediaPipe output
  const handleGesture = (gesture: Gesture) => {
    const now: number = Date.now();

    const currentGesture: Gesture|null = activeGestures[gesture.handedness];

    // Skip if low confidence
    if (gesture.confidence < 0.6) {
      activeGestures[gesture.handedness] = null;
      return;
    }

    if (!currentGesture || currentGesture.gestureID!==gesture.gestureID) {
      // Store Gesture
      activeGestures[gesture.handedness] = gesture;
    } else {
      // Trigger Gesture
      const elapsed: number = now - currentGesture.timestamp.getTime();
      if (elapsed >= 100) { // 500ms duration
        defaultMapping[gesture.gestureID](currentGesture, gesture);
      }
    }

  }

};

export default GestureHandler;