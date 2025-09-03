import { useEffect, useRef, useState, MutableRefObject } from "react";
import Webcam from "react-webcam";
import { GestureRecognizer, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType, Handedness, Gesture, IDtoEnum } from "../gesture/gesture";
import { useGestureHandler } from "../gesture/GestureHandler";


export const gestureDetector = (
  videoRef: MutableRefObject<Webcam | null>,
  gestureDetectionStatus: boolean,
  settings: Record<GestureType, FunctionType>
) => {
  const NUM_HANDS_DETECTABLE = 2;
  const MIN_HAND_DETECTION_CONFIDENCE = 0.6;
  const GESTURE_RECOGNITION_TIMEOUT_INTERVAL = 10;
  const SETUP_MAX_RETRIES = 5;
  const SETUP_RETRY_DELAY = 1000;
  const VIDEO_HAS_ENOUGH_DATA = 4;

  const [currentGestures, setCurrentGestures] = useState<Gesture[]>([]);
  const [gestureRecognizer, setGestureRecognizer] =
    useState<GestureRecognizer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { HandleGesture } = useGestureHandler(settings);

  const cleanupInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Setup gesture recognizer
  useEffect(() => {
    let isMounted = true;

    const setup = async (retryCount = 0) => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const gestureRecognizerInternal =
          await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
            },
            runningMode: "VIDEO",
            numHands: NUM_HANDS_DETECTABLE,
            minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
          });

        if (isMounted) setGestureRecognizer(gestureRecognizerInternal);
      } catch (error) {
        console.error(`GestureRecognizer setup failed (attempt ${retryCount + 1}):`, error);
        if (retryCount < SETUP_MAX_RETRIES) {
          setTimeout(() => setup(retryCount + 1), SETUP_RETRY_DELAY);
        }
      }
    };
    setup();
    return cleanupInterval;
  }, []);

  // Run detection loop
  useEffect(() => {
    if (gestureDetectionStatus) {
      const detectGesture = async () => {
        if (!gestureRecognizer || !videoRef || !videoRef.current) {
          return;
        }

        const processFrame = async () => {
          // This if statement is to handle any timeout interval that begins whilst gesturedetectionstatus is true but is actioned when gesturedetectionstatus is false
          if (gestureDetectionStatus) {
            if (!videoRef || !videoRef.current || !videoRef.current.video)
              return;

            const video = videoRef.current.video;
            if (video.readyState === VIDEO_HAS_ENOUGH_DATA) {
              const detectedGestures =
                await gestureRecognizer.recognizeForVideo(
                  video,
                  performance.now(),
                );
              const gestures: Gesture[] = Array(
                detectedGestures.gestures.length,
              );

              for (
                let index = 0;
                index < detectedGestures.gestures.length;
                index++
              ) {
                const landmarks = detectedGestures.landmarks[index];
                const handedness = detectedGestures.handedness[index][0]
                  .categoryName as Handedness;
                let gestureID: GestureType = GestureType.UNIDENTIFIED;
                let confidence: number;

                if (isPointing(landmarks)) {
                  gestureID = GestureType.POINTING_UP;
                  confidence = 1.0;
                } else if (isTwoFingerPointing(landmarks)) {
                  if (handedness === Handedness.LEFT) {
                    gestureID = GestureType.TWO_FINGER_POINTING_LEFT;
                  } else {
                    gestureID = GestureType.TWO_FINGER_POINTING_RIGHT;
                  }
                  confidence = 1.0;
                } else {
                  const categoryName =
                    detectedGestures.gestures[index][0].categoryName;
                  // Convert the string name (e.g., "Thumb_Up") to the enum number (e.g., 6)
                  gestureID =
                    IDtoEnum[categoryName] ?? GestureType.UNIDENTIFIED;
                  confidence = detectedGestures.gestures[index][0].score;
                }

                // This is to assign the determined gesture
                gestures[index] = {
                  gestureID,
                  handedness,
                  timestamp: new Date(),
                  confidence,
                  landmarks,
                };
              }

              if (!(gestures.length === 0 && currentGestures.length === 0)) {
                setCurrentGestures(gestures);
              }
            }
          }
        };

        intervalRef.current = setInterval(
          processFrame,
          GESTURE_RECOGNITION_TIMEOUT_INTERVAL,
        );
      };
      detectGesture();
    } else {
      cleanupInterval();
    }
    return cleanupInterval;
  }, [gestureRecognizer, gestureDetectionStatus]);

  // Handle gestures
  useEffect(() => {
    for (let index = 0; index < currentGestures.length; index++) {
      if (currentGestures[index]) {
        // Confirm that the correct gesture ID number is being sent
        console.log(
          `[GestureDetector] Detected: ${GestureType[currentGestures[index].gestureID]} (${currentGestures[index].gestureID})`,
        );
        HandleGesture(currentGestures[index]);
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

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const isIndexExtended = dist(wrist, indexTip) > dist(wrist, indexPip);
  const areOthersCurled =
    dist(wrist, middleTip) < dist(wrist, middlePip) &&
    dist(wrist, ringTip) < dist(wrist, ringPip) &&
    dist(wrist, pinkyTip) < dist(wrist, pinkyPip) &&
    dist(wrist, thumbTip) < dist(wrist, thumbPip)
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

  const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
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
