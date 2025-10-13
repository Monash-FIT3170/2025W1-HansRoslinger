import { useEffect, useRef, useState, MutableRefObject } from "react";
import Webcam from "react-webcam";
import {
  GestureRecognizer,
  FilesetResolver,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import {
  GestureType,
  FunctionType,
  Handedness,
  Gesture,
  IDtoEnum,
} from "../gesture/gesture";
import GestureHandler from "../gesture/GestureHandler";
import { getPointerScreenXY } from "../gesture/gesture";

const __lastXYByHand: Record<string, { x: number; y: number; t: number }> = {};

function __inferRoleAtPoint(x: number, y: number): "bar" | "axis" | "chart" | "none" {
  const el = document.elementFromPoint(x, y);
  if (!el) return "none";
  if (el.getAttribute("data-gesture-role") === "bar" || el.hasAttribute("data-gesture-hints")) return "bar";
  if (el.getAttribute("data-gesture-role") === "axis") return "axis";
  const root = document.getElementById("chart-root");
  if (root) {
    const r = root.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return "chart";
  }
  return "none";
}

export const gestureDetector = (
  videoRef: MutableRefObject<Webcam | null>,
  gestureDetectionStatus: boolean,
  settings: Record<GestureType, FunctionType>,
) => {
  const NUM_HANDS_DETECTABLE = 2;
  const MIN_HAND_DETECTION_CONFIDENCE = 0.6;
  const SETUP_MAX_RETRIES = 5;
  const SETUP_RETRY_DELAY = 1000;
  const VIDEO_HAS_ENOUGH_DATA = 4;

  const [currentGestures, setCurrentGestures] = useState<Gesture[]>([]);
  const [gestureRecognizer, setGestureRecognizer] =
    useState<GestureRecognizer | null>(null);

  const { HandleGesture } = GestureHandler(settings);

  const rafIdRef = useRef<number | null>(null);
  // Helper function
  const cleanupLoop = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };
  // Setup gesture recognizer
  useEffect(() => {
    const isMounted = true;

    const setup = async (retryCount = 0) => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const gestureRecognizerInternal =
          await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
              delegate: "GPU" as any,
            },
            runningMode: "VIDEO",
            numHands: NUM_HANDS_DETECTABLE,
            minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
          });

        if (isMounted) setGestureRecognizer(gestureRecognizerInternal);
      } catch (error) {
        console.error(
          `GestureRecognizer setup failed (attempt ${retryCount + 1}):`,
          error,
        );
        if (retryCount < SETUP_MAX_RETRIES) {
          setTimeout(() => setup(retryCount + 1), SETUP_RETRY_DELAY);
        }
      }
    };
    setup();
    return cleanupLoop;
  }, []);

  // Run detection loop
  useEffect(() => {
    // If detection is disabled, stop any running loop
    // if (truncate) {
    //   cleanupLoop();
    //   return () => {};
    // }

    // Wait for recognizer to be ready
    if (!gestureRecognizer) {
      return () => { };
    }

    const loop = async () => {
      if (!videoRef?.current?.video) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }
      const video = videoRef.current.video;
      if (video.readyState === VIDEO_HAS_ENOUGH_DATA) {
        try {
          const detectedGestures = await gestureRecognizer.recognizeForVideo(
            video,
            performance.now(),
          );
          const gestures: Gesture[] = Array(detectedGestures.gestures.length);

          for (
            let index = 0;
            index < detectedGestures.gestures.length;
            index++
          ) {
            const landmarks = detectedGestures.landmarks[index];
            const handedness = detectedGestures.handedness[index][0]
              .categoryName as Handedness;

            // Start with actual gesture
            const detected = detectedGestures.gestures[index][0];
            let gestureID: GestureType =
              IDtoEnum[detected.categoryName] ?? GestureType.UNIDENTIFIED;
            let confidence: number = detected.score;

            // Only check custom gestures if actual gesture is UNIDENTIFIED
            if (gestureID === GestureType.UNIDENTIFIED) {
              if (isPinchSign(landmarks)) {
                gestureID = GestureType.PINCH;
                confidence = 1.0;
              } else if (isTwoFingerPointing(landmarks)) {
                gestureID =
                  handedness === Handedness.LEFT
                    ? GestureType.TWO_FINGER_POINTING_LEFT
                    : GestureType.TWO_FINGER_POINTING_RIGHT;
                confidence = 1.0;
              } else if (isPointing(landmarks)) {
                gestureID = GestureType.POINTING_UP;
                confidence = 1.0;
              }
            }

            gestures[index] = {
              gestureID: gestureID,
              handedness,
              timestamp: new Date(),
              confidence,
              singleGestureLandmarks: landmarks,
              doubleGestureLandmarks: [],
            };
          }

          try {
            const hands = Array.isArray(gestures) ? gestures : [];
            const numHands = hands.length || 0;

            // Optional: compute two-hand distance in px once per frame
            let twoHandDist = 0;
            if (numHands >= 2) {
              const a = getPointerScreenXY(hands[0]);
              const b = getPointerScreenXY(hands[1]);
              if (a && b) {
                const dx = a.x - b.x, dy = a.y - b.y;
                twoHandDist = Math.sqrt(dx * dx + dy * dy);
              }
              (window as any).__twoHandDistance = twoHandDist; // overlay uses this if present
            }

            for (const g of hands) {
              const xy = getPointerScreenXY(g);
              if (!xy) continue;

              // 1) Keep overlay position following the hand
              window.dispatchEvent(new CustomEvent('gesture:pointer', { detail: { x: xy.x, y: xy.y } }));

              // 2) Estimate speed (px/ms) for dwell vs motion
              const id = `${g.handedness || 'H'}-${g.gestureID || 'G'}`;
              const now = performance.now();
              let speed = 0;
              const prev = __lastXYByHand[id];
              if (prev) {
                const dt = Math.max(1, now - prev.t);
                const dx = xy.x - prev.x;
                const dy = xy.y - prev.y;
                speed = Math.sqrt(dx * dx + dy * dy) / dt;
              }
              __lastXYByHand[id] = { x: xy.x, y: xy.y, t: now };

              // 3) Where is the hand? (bar/axis/chart/none)
              const role = __inferRoleAtPoint(xy.x, xy.y);

              // 4) Emit cheap features so the overlay can rank likely actions
              const detail = {
                x: xy.x,
                y: xy.y,
                numHands,
                pinch: Boolean((g as any).isPinching), // ok if always false
                speed,
                handsDistance: twoHandDist,
                overElementRole: role as "bar" | "axis" | "chart" | "none",
              };
              window.dispatchEvent(new CustomEvent('gesture:preintent', { detail }));
            }
          } catch { }


          if (!(gestures.length === 0 && currentGestures.length === 0)) {
            setCurrentGestures(gestures);
          }
        } catch (e) {
          console.warn("recognizeForVideo error", e);
        }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);
    return cleanupLoop;
  }, [gestureRecognizer, gestureDetectionStatus]);

  // Handle gestures
  useEffect(() => {
    // Logic for handling 2 handed gestures should be done before handling individual gestures
    // If a 2 handed gesture is found, we shouldn't handle each single gesture individually
    // 2 handed gestures should always come from a left and right hand, assuming it is a single person
    // performing the gesture
    const leftGesture = currentGestures.find(
      (g) => g?.handedness === Handedness.LEFT,
    );
    const rightGesture = currentGestures.find(
      (g) => g?.handedness === Handedness.RIGHT,
    );
    if (!gestureDetectionStatus) {
      // Only check for pinching as user may click gesture detection toggle button to turn it back on
      for (let index = 0; index < currentGestures.length; index++) {
        if (
          currentGestures[index] &&
          currentGestures[index].gestureID == GestureType.PINCH
        ) {
          // Confirm that the correct gesture ID number is being sent
          console.log(
            `[GestureDetector] Detected: ${GestureType[currentGestures[index].gestureID]} (${currentGestures[index].gestureID})`,
          );
          HandleGesture(currentGestures[index]);
        }
      }
    } else {
      let twoHandedGesture: Gesture | undefined;
      if (leftGesture && rightGesture) {
        if (isDoublePinchSign(leftGesture, rightGesture)) {
          twoHandedGesture = {
            gestureID: GestureType.DOUBLE_PINCH,
            handedness: Handedness.BOTH,
            timestamp: new Date(),
            confidence: Math.min(
              leftGesture.confidence,
              rightGesture.confidence,
            ),
            singleGestureLandmarks: [],
            doubleGestureLandmarks: [
              leftGesture.singleGestureLandmarks,
              rightGesture.singleGestureLandmarks,
            ],
          };
        }
        //here you can add an else if to add other two handed gestures
        if (twoHandedGesture) {
          HandleGesture(twoHandedGesture);
          return;
        }
      }

      // this code will only run if a two-handed gesture was not detected
      for (let index = 0; index < currentGestures.length; index++) {
        if (currentGestures[index]) {
          // Confirm that the correct gesture ID number is being sent
          console.log(
            `[GestureDetector] Detected: ${GestureType[currentGestures[index].gestureID]} (${currentGestures[index].gestureID})`,
          );
          HandleGesture(currentGestures[index]);
        }
      }
    }
  }, [currentGestures]);
};

export default gestureDetector;

// Import types from @mediapipe/tasks-vision for GestureRecognizerResult

function isPointing(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const thumbTip = landmarks[4];
  const thumbPip = landmarks[6];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) =>
    Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const isIndexExtended = dist(wrist, indexTip) > dist(wrist, indexPip);
  const areOthersCurled =
    dist(wrist, middleTip) < dist(wrist, middlePip) &&
    dist(wrist, ringTip) < dist(wrist, ringPip) &&
    dist(wrist, pinkyTip) < dist(wrist, pinkyPip) &&
    dist(wrist, thumbTip) < dist(wrist, thumbPip);
  const isPointing = isIndexExtended && areOthersCurled;
  return isPointing;
}

function isTwoFingerPointing(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const thumbTip = landmarks[4];
  const thumbPip = landmarks[6];

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) =>
    Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const isIndexExtended = dist(wrist, indexTip) > dist(wrist, indexPip);
  const isMiddleExtended = dist(wrist, middleTip) > dist(wrist, middlePip);
  const areOthersCurled =
    dist(wrist, ringTip) < dist(wrist, ringPip) &&
    dist(wrist, pinkyTip) < dist(wrist, pinkyPip);
  const thumbExtended = dist(thumbTip, wrist) > dist(thumbPip, wrist);
  const isPointing =
    isIndexExtended && isMiddleExtended && areOthersCurled && thumbExtended;
  return isPointing;
}

function isDoublePinchSign(leftGesture: Gesture, rightGesture: Gesture) {
  // Check if both gestures are PINCH
  const isLeftPinch = leftGesture.gestureID === GestureType.PINCH;
  const isRightPinch = rightGesture.gestureID === GestureType.PINCH;

  // console.log(`double pinch check: left ${isLeftPinch}, right ${isRightPinch}`);
  return isLeftPinch && isRightPinch;
}

function isPinchSign(landmarks: NormalizedLandmark[]) {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  // For implementation of pinching
  // Distance between thumb and index tip
  const thumbIndexDistance = Math.hypot(
    thumbTip.x - indexTip.x,
    thumbTip.y - indexTip.y,
  );

  // Consider it "PINCH" if thumb + index are touching, and other fingers are up
  const isThumbIndexClose = thumbIndexDistance < 0.05; // Tune this if needed

  return isThumbIndexClose;
}
