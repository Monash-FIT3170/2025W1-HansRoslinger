import {
  Gesture,
  Handedness,
  handleGestureToFunc,
  GestureType,
} from "./gesture";
import { useRef } from "react";

let isZoomEnabled = false;

window.addEventListener("chart:togglezoom", () => {
  isZoomEnabled = !isZoomEnabled;
});

export const GestureHandler = () => {
  const FIRST_ACTIVATION_DELAY_MS = 500; // initial activation
  const REPEAT_ACTIVATION_DELAY_MS = 1500; // subsequent activations

  type ActiveGestureState = {
    gesture: Gesture;
    lastFiredAt: number; // epoch ms
    firedOnce: boolean;
  };

  const activeGestures = useRef<Record<Handedness, ActiveGestureState | null>>({
    [Handedness.LEFT]: null,
    [Handedness.RIGHT]: null,
  });

  const HandleGesture = (gesture: Gesture) => {
    const now: number = Date.now();
    const state = activeGestures.current[gesture.handedness];

    if (!state || state.gesture.gestureID !== gesture.gestureID) {
      // New gesture started for this hand: reset state
      activeGestures.current[gesture.handedness] = {
        gesture,
        lastFiredAt: Date.now(),
        firedOnce: false,
      };
      // Instant hover: if this is POINTING_UP, run immediately and do not touch timers
      if (gesture.gestureID === GestureType.POINTING_UP) {
        handleGestureToFunc(gesture.gestureID, gesture, gesture);
        return;
      }
    } else {
      // Special-case: POINTING_UP (hover/select) should ignore cooldown entirely.
      if (gesture.gestureID === GestureType.POINTING_UP) {
        handleGestureToFunc(gesture.gestureID, state.gesture, gesture);
        // Do NOT update lastFiredAt/firedOnce so this doesn't affect cooldowns
        state.gesture = gesture; // keep latest landmarks
        return;
      }

      const requiredDelay = state.firedOnce
        ? REPEAT_ACTIVATION_DELAY_MS
        : FIRST_ACTIVATION_DELAY_MS;
      const elapsed = now - state.lastFiredAt;

      if (elapsed >= requiredDelay || isZoomEnabled) {
        handleGestureToFunc(gesture.gestureID, state.gesture, gesture);
        // Update state to reflect this activation
        state.lastFiredAt = now;
        state.firedOnce = true;
        // Keep the most recent gesture data for any handler needing latest landmarks
        state.gesture = gesture;
      }
    }
  };

  return { HandleGesture };
};

export default GestureHandler;
