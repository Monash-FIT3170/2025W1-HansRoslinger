import React, { useRef } from "react"; // Import React
import Webcam from "react-webcam";
import GestureDetector from "/imports/mediapipe/gestures";

interface WebcamProps {
  grayscale: boolean;
  gestureDetectionStatus: boolean;
}

export const WebcamComponent: React.FC<WebcamProps> = ({
  grayscale,
  gestureDetectionStatus,
}) => {
  const webcamRef = useRef<Webcam | null>(null);

  GestureDetector(webcamRef, gestureDetectionStatus);

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
