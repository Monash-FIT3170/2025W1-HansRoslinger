import React, { useRef } from "react"; // Import React
import Webcam from "react-webcam";
import { gestureDetector } from "/imports/mediapipe/gestures";
import { GestureType, FunctionType } from "/imports/gesture/gesture";

interface WebcamProps {
  grayscale: boolean;
  gestureDetectionStatus: boolean;
  settings: Record<GestureType, FunctionType>
}

export const WebcamComponent: React.FC<WebcamProps> = ({
  grayscale,
  gestureDetectionStatus,
  settings
}) => {
  const webcamRef = useRef<Webcam | null>(null);

  gestureDetector(webcamRef, gestureDetectionStatus, settings);

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex justify-center items-center fixed inset-0 z-[-1] ${grayscale ? "grayscale" : ""}`}
    >
      <Webcam
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }} // Flip vertically
        ref={webcamRef}
      />
    </div>
  );
};
