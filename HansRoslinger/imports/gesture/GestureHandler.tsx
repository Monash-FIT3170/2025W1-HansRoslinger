import {
  FunctionType,
  Gesture,
  GestureType,
  Handedness,
  handleGestureToFunc,
} from "./gesture";
import { useRef } from "react";
import { getPointerScreenXY } from "./gesture"; // adjust path if needed

let isZoomEnabled = false;

window.addEventListener("chart:togglezoom", () => {
  isZoomEnabled = !isZoomEnabled;
});

export const GestureHandler = (mapping: Record<GestureType, FunctionType>) => {
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
    [Handedness.BOTH]: null,
  });

  const HandleGesture = (gesture: Gesture) => {
    const map = mapping;
    const now: number = Date.now();
    // Keep state consistent: clear conflicting slots when switching
    if (gesture.handedness === Handedness.BOTH) {
      activeGestures.current[Handedness.LEFT] = null;
      activeGestures.current[Handedness.RIGHT] = null;
    } else {
      activeGestures.current[Handedness.BOTH] = null;
    }
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
        const xy = getPointerScreenXY(gesture);
        if (xy) {
          window.dispatchEvent(new CustomEvent('gesture:pointer', { detail: { x: xy.x, y: xy.y } }));
        }
        handleGestureToFunc(gesture.gestureID, gesture, gesture, map);
        return;
      }
    } else {
      // Special-case: POINTING_UP (hover/select) should ignore cooldown entirely.
      if (gesture.gestureID === GestureType.POINTING_UP) {
        handleGestureToFunc(gesture.gestureID, state.gesture, gesture, map);
        // Do NOT update lastFiredAt/firedOnce so this doesn't affect cooldowns
        state.gesture = gesture; // keep latest landmarks
        return;
      }

      const requiredDelay = state.firedOnce
        ? REPEAT_ACTIVATION_DELAY_MS
        : FIRST_ACTIVATION_DELAY_MS;
      const elapsed = now - state.lastFiredAt;

      if (elapsed >= requiredDelay || isZoomEnabled) {
        handleGestureToFunc(gesture.gestureID, state.gesture, gesture, map);
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
