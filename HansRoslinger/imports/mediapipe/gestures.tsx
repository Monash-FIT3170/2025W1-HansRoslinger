import React, { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

const GestureRecognizerComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gestureResult, setGestureResult] = useState("");
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const gestureRecognizer = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
          },
          runningMode: "VIDEO",
          numHands: 1,
        }
      );

      gestureRecognizerRef.current = gestureRecognizer;

      // Start webcam
      if (videoRef.current) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current!.srcObject = stream;
            videoRef.current!.play();
          })
          .catch((err) => {
            console.error("Error accessing the webcam:", err);
          });
      }
    };

    setup();

    return () => {
      // Cleanup: Stop the video stream when the component unmounts
      if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const detectGesture = async () => {
      if (!gestureRecognizerRef.current || !videoRef.current) return;

      const recognizer = gestureRecognizerRef.current;

      const processFrame = async () => {
        const video = videoRef.current!;
        if (video.readyState === 4) {
          const result = await recognizer.recognizeForVideo(video, performance.now());

          if (
            result.gestures.length > 0 &&
            result.gestures[0].categories.length > 0
          ) {
            const gesture = result.gestures[0].categories[0].categoryName;
            setGestureResult(gesture);
          }
        }
      };

      // Check gestures periodically every 500ms
      intervalRef.current = setInterval(processFrame, 500);
    };

    detectGesture();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <video ref={videoRef} className="w-64 h-auto rounded-md shadow-lg" />
      <input
        type="text"
        value={gestureResult}
        readOnly
        className="p-2 border rounded shadow"
        placeholder="Detected gesture will appear here"
      />
    </div>
  );
};

export default GestureRecognizerComponent;
