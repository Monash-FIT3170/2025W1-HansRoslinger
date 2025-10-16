import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useGestureDetector, setupGestureRecognizer } from "/imports/mediapipe/gestures";
import { GestureRecognizer } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType } from "/imports/gesture/gesture";

interface WebcamComponentProps {
  grayscale: boolean;
  gestureDetectionStatus: boolean;
  settings: Record<GestureType, FunctionType>;
}

export const WebcamComponent: React.FC<WebcamComponentProps> = ({ grayscale, gestureDetectionStatus, settings }) => {
  const webcamRef = useRef<Webcam | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  // Store recognizer in state so component re-renders when it's ready
  const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const loggedVideoReadyRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      if (recognizerRef.current) {
        return;
      }
      const created = await setupGestureRecognizer("VIDEO");
      if (cancelled) return;
      if (created) {
        recognizerRef.current = created;
        setRecognizer(created);
      } else {
        console.warn("WebcamComponent: failed to create recognizer");
      }
    };
    setup();
    return () => {
      cancelled = true;
      if (recognizerRef.current) {
        recognizerRef.current.close?.();
        recognizerRef.current = null;
      }
    };
  }, []);

  // Keep a stable ref object for the HTMLVideoElement
  videoElRef.current = webcamRef.current?.video ?? null;
  if (videoElRef.current && !loggedVideoReadyRef.current) {
    loggedVideoReadyRef.current = true;
  }

  // Call the gesture detector hook unconditionally to preserve hook order
  useGestureDetector(recognizer, videoElRef, imageRef, gestureDetectionStatus, settings, "VIDEO");

  return (
    <div className={`absolute top-0 left-0 w-full h-full flex justify-center items-center fixed inset-0 z-[-1] ${grayscale ? "grayscale" : ""}`}>
      <Webcam
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }} // Flip vertically
        ref={webcamRef}
        videoConstraints={{
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, max: 120 },
          facingMode: "user",
        }}
      />
    </div>
  );
};
