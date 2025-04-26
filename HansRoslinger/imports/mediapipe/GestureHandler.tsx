import React, { useRef } from 'react';

type MediaPipeGesture = {
  name: string;          // "Thumb_Up", "Open_Palm", etc.
  confidence: number;    // 0-1
  landmarks: { x: number; y: number; z?: number }[];
};

// Define your gesture functions
const gestureActions = {
  Thumb_Up: () => console.log("Thumbs up triggered!"),
  Open_Palm: () => console.log("Open palm triggered!"),
  Pointing_Up: () => console.log("Pointing up triggered!"),
};

const GestureHandler = () => {
  const activeGestures = useRef<Map<string, { startTime: number }>>(new Map());

  // Process MediaPipe output
  const processGestures = (gestures: MediaPipeGesture[]) => {
    const now = Date.now();

    gestures.forEach((gesture) => {
      const { name, confidence } = gesture;

      // Skip if low confidence
      if (confidence < 0.6) {
        activeGestures.current.delete(name);
        return;
      }

      // Duration check
      if (!activeGestures.current.has(name)) {
        activeGestures.current.set(name, { startTime: now }); // Start timer
      } else {
        const elapsed = now - activeGestures.current.get(name)!.startTime;
        if (elapsed >= 500) { // 500ms duration
          triggerGestureAction(name); // Call the corresponding function
          activeGestures.current.delete(name); // Reset
        }
      }
    });
  };

  // Call the appropriate function for each gesture
  const triggerGestureAction = (gestureName: string) => {
    const action = gestureActions[gestureName as keyof typeof gestureActions];
    if (action) action(); // Execute if defined
  };

  return null; // Or forwardRef if needed
};

export default GestureHandler;