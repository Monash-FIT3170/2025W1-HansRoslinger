import { useEffect, useRef, useState, MutableRefObject } from "react";
import Webcam from "react-webcam";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType, Handedness, Gesture } from "../gesture/gesture";
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

    return () => {
      isMounted = false;
      cleanupInterval();
    };
  }, []);

  // Run detection loop
  useEffect(() => {
    if (gestureDetectionStatus && gestureRecognizer && videoRef.current) {
      const video = videoRef.current.video;

      const processFrame = async () => {
        if (!video || video.readyState !== VIDEO_HAS_ENOUGH_DATA) return;

        const detectedGestures = await gestureRecognizer.recognizeForVideo(
          video,
          performance.now()
        );

        const gestures: Gesture[] = detectedGestures.gestures.map((g, index) => ({
          gestureID: g[0].categoryName as GestureType,
          handedness: detectedGestures.handedness[index][0].categoryName as Handedness,
          timestamp: new Date(),
          confidence: g[0].score,
          landmarks: detectedGestures.landmarks[index],
        }));

        setCurrentGestures(gestures);
      };

      intervalRef.current = setInterval(processFrame, GESTURE_RECOGNITION_TIMEOUT_INTERVAL);
    } else {
      cleanupInterval();
    }

    return cleanupInterval;
  }, [gestureRecognizer, gestureDetectionStatus]);

  // Handle gestures
  useEffect(() => {
    currentGestures.forEach((gesture) => HandleGesture(gesture));
  }, [currentGestures, HandleGesture]);
};
