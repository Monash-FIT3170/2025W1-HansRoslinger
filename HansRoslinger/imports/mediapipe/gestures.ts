/**
 * -----------------------------------------------------------------------------
 * Gesture Detector is React + MediaPipe Tasks Vision (Web)
 * -----------------------------------------------------------------------------
 * Purpose
 * -------
 * This module wires a `react-webcam` <video> element into MediaPipe’s
 * `GestureRecognizer` and translates recognized hand poses into your app’s
 * domain-specific `Gesture` objects. It centralises:
 *   • Model setup & retry logic
 *   • A rAF-driven video inference loop (VIDEO mode)
 *   • One- and two-handed gesture interpretation (incl. custom heuristics)
 *   • Delivery of gestures to a pluggable handler (`GestureHandler`)
 *
 *
 **/
import { useEffect, useRef, useState, MutableRefObject } from "react";
// Type-only imports to avoid evaluating Mediapipe in server context
import type { GestureRecognizer, GestureRecognizerResult } from "@mediapipe/tasks-vision";

// Define RunningMode type locally since it's not exported by the module
type RunningMode = "IMAGE" | "VIDEO";
import { GestureType, FunctionType, Gesture } from "../gesture/gesture";
import { handleDisableExemptGestures, handleSingleHandedGestures, handleTwoHandedGestures, recogniseCustomGesture } from "./customGestures";
import { Handedness, MediapipeDefaultIDtoEnum } from "./types";
import GestureHandler from "./handler";

const NUM_HANDS_DETECTABLE = 2;
const MIN_HAND_DETECTION_CONFIDENCE = 0.6;
const SETUP_MAX_RETRIES = 5;
const SETUP_RETRY_DELAY = 1000;

export const setupGestureRecognizer = async (mode: RunningMode = "VIDEO", retryCount: number = 0): Promise<GestureRecognizer | null> => {
  // Prevent running on the server where window and WebAssembly Web APIs don't exist
  if (typeof window === "undefined") {
    return null;
  }
  try {
    console.log(`[Gesture] setupGestureRecognizer called. mode=${mode}, retry=${retryCount}`);
    // Dynamically import Mediapipe only on the client to avoid SSR import side-effects
    const { FilesetResolver, GestureRecognizer } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

    const gestureRecognizerInternal = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
        delegate: "GPU",
      },
      runningMode: mode,
      numHands: NUM_HANDS_DETECTABLE,
      minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
    });
    console.log("[Gesture] GestureRecognizer setup complete");
    return gestureRecognizerInternal;
  } catch (error) {
    console.error(`[Gesture] GestureRecognizer setup failed (attempt ${retryCount + 1}):`, error);
    if (retryCount < SETUP_MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, SETUP_RETRY_DELAY));
      return setupGestureRecognizer(mode, retryCount + 1);
    }
    return null;
  }
};

export function useGestureDetector(
  gestureRecognizer: GestureRecognizer | null,
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  imageRef: MutableRefObject<HTMLImageElement | null>,
  gestureDetectionStatus: boolean,
  settings: Record<GestureType, FunctionType>,
  mode: RunningMode = "VIDEO",
  handleGesture: boolean = true,
) {
  const VIDEO_HAS_ENOUGH_DATA = 4;
  const [currentGestures, setCurrentGestures] = useState<Gesture[]>([]);
  const gesturesRef = useRef<Gesture[]>([]);
  const { HandleGesture } = GestureHandler(settings);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    gesturesRef.current = currentGestures;
  }, [currentGestures]);
  // Helper function
  const cleanupLoop = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // Run detection loop
  useEffect(() => {
    console.log("[Gesture] useGestureDetector effect run", { hasRecognizer: !!gestureRecognizer, mode, gestureDetectionStatus, handleGesture });
    if (!gestureRecognizer) {
      console.log("[Gesture] Exiting effect early: recognizer not ready");
      return cleanupLoop;
    }
    const loop = async () => {
      let hasEnoughData = false;
      if (videoRef.current && videoRef.current.readyState === VIDEO_HAS_ENOUGH_DATA) {
        hasEnoughData = true;
      }
      if (imageRef.current) {
        const imageEl = imageRef.current;
        const imageReady = imageEl.complete && imageEl.naturalWidth > 0 && imageEl.naturalHeight > 0;
        if (!imageReady) {
          console.debug("[Gesture] Image not ready", {
            complete: imageEl.complete,
            naturalWidth: imageEl.naturalWidth,
            naturalHeight: imageEl.naturalHeight,
          });
        } else {
          if (imageEl.width === 0 || imageEl.height === 0) {
            imageEl.width = imageEl.naturalWidth;
            imageEl.height = imageEl.naturalHeight;
            console.debug("[Gesture] Applied natural dimensions to image element", {
              width: imageEl.width,
              height: imageEl.height,
            });
          }
          hasEnoughData = true;
        }
      }
      if (!hasEnoughData) {
        // Debug why we don't have enough data yet
        const readyState = videoRef.current?.readyState;
        console.debug("[Gesture] Not enough data yet; scheduling next frame", { readyState, hasImage: !!imageRef.current });
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }
      try {
        let detectedGestures: GestureRecognizerResult;
        if (mode === "IMAGE") {
          const imageEl = imageRef.current;
          if (!imageEl || !imageEl.complete || imageEl.naturalWidth <= 0 || imageEl.naturalHeight <= 0) {
            console.debug("[Gesture] Skipping IMAGE recognition; image element not ready", {
              hasImage: !!imageEl,
              complete: imageEl?.complete,
              naturalWidth: imageEl?.naturalWidth,
              naturalHeight: imageEl?.naturalHeight,
            });
            rafIdRef.current = requestAnimationFrame(loop);
            return;
          }
          // console.debug("[Gesture] Calling recognize (IMAGE mode)");
          detectedGestures = await gestureRecognizer.recognize(imageEl);
        } else {
          const ts = performance.now();
          // console.debug("[Gesture] Calling recognizeForVideo (VIDEO mode)", { ts });
          detectedGestures = await gestureRecognizer.recognizeForVideo(videoRef.current!, ts);
        }
        // console.debug("[Gesture] Recognizer result", {
        //   gesturesCount: detectedGestures.gestures?.length ?? 0,
        //   landmarksCount: detectedGestures.landmarks?.length ?? 0,
        //   handednessCount: detectedGestures.handedness?.length ?? 0,
        // });
        const gestures: Gesture[] = Array(detectedGestures.gestures.length);
        for (let index = 0; index < detectedGestures.gestures.length; index++) {
          const landmarks = detectedGestures.landmarks[index];
          const handedness = detectedGestures.handedness[index][0].categoryName as Handedness;
          const detected = detectedGestures.gestures[index][0];
          let gestureID: GestureType = MediapipeDefaultIDtoEnum[detected.categoryName] ?? GestureType.UNIDENTIFIED;
          let confidence: number = detected.score;
          if (gestureID === GestureType.UNIDENTIFIED) {
            ({ gestureID, confidence } = recogniseCustomGesture(landmarks, handedness) ?? { gestureID, confidence });
          }
          gestures[index] = {
            gestureID: gestureID,
            handedness,
            timestamp: new Date(),
            confidence,
            singleGestureLandmarks: landmarks,
            doubleGestureLandmarks: [],
          };
          if (detected.categoryName !== "None") {
            console.debug("[Gesture] Gesture detected", { index, rawCategory: detected.categoryName, mapped: gestureID, confidence, handedness });
          }
        }
        if (!(gestures.length === 0 && currentGestures.length === 0)) {
          setCurrentGestures(gestures);
        }
      } catch (e) {
        console.warn("[Gesture] recognize error", e);
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);
    return cleanupLoop;
  }, [gestureRecognizer, gestureDetectionStatus, mode]);

  if (handleGesture) {
    // Handle gestures
    useEffect(() => {
      const leftGesture = currentGestures.find((g) => g?.handedness === Handedness.LEFT);
      const rightGesture = currentGestures.find((g) => g?.handedness === Handedness.RIGHT);
      console.debug("[Gesture] Handling gestures", { count: currentGestures.length, leftGesture, rightGesture, gestureDetectionStatus });
      if (!gestureDetectionStatus) {
        handleDisableExemptGestures(currentGestures, HandleGesture);
        return;
      }
      if (handleTwoHandedGestures(leftGesture, rightGesture, HandleGesture)) {
        return;
      }
      if (handleSingleHandedGestures(currentGestures, HandleGesture)) {
        return;
      }
      console.log("[Gesture] No gestures handled");
    }, [currentGestures]);
  }

  return { currentGestures, gesturesRef };
}

export default useGestureDetector;

// Import types from @mediapipe/tasks-vision for GestureRecognizerResult
