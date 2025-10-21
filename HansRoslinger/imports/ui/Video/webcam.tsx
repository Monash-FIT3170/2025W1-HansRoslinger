import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useGestureDetector, setupGestureRecognizer } from "/imports/mediapipe/gestures";
import { GestureRecognizer } from "@mediapipe/tasks-vision";
import { GestureType, FunctionType } from "/imports/gesture/gesture";
import { Handedness } from "/imports/mediapipe/types";

interface WebcamComponentProps {
  grayscale: boolean;
  gestureDetectionStatus: boolean;
  settings: Record<GestureType, FunctionType>;
  onGestureChange?: (gesture: GestureType | null) => void;
}

export const WebcamComponent: React.FC<WebcamComponentProps> = ({ grayscale, gestureDetectionStatus, settings, onGestureChange }) => {
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
  const { currentGestures } = useGestureDetector(recognizer, videoElRef, imageRef, gestureDetectionStatus, settings, "VIDEO");

  useEffect(() => {
    if (!onGestureChange) {
      return;
    }

    if (!gestureDetectionStatus) {
      onGestureChange(null);
      return;
    }

    if (!currentGestures.length) {
      onGestureChange(null);
      return;
    }

    // Check for double-handed pinch first (highest priority)
    const leftGesture = currentGestures.find((g) => g?.handedness === Handedness.LEFT);
    const rightGesture = currentGestures.find((g) => g?.handedness === Handedness.RIGHT);
    
    if (leftGesture && rightGesture && 
        leftGesture.gestureID === GestureType.PINCH && 
        rightGesture.gestureID === GestureType.PINCH) {
      onGestureChange(GestureType.DOUBLE_PINCH);
      return;
    }

    // Otherwise, prioritize by confidence
    const prioritized = currentGestures
      .filter((gesture) => gesture.gestureID !== GestureType.UNIDENTIFIED)
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

    const nextGesture = (prioritized[0] ?? currentGestures[0])?.gestureID ?? null;

    onGestureChange(nextGesture);
  }, [currentGestures, gestureDetectionStatus, onGestureChange]);

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
