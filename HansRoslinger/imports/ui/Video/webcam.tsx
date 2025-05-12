import React, { useRef } from 'react'; // Import React
import Webcam from 'react-webcam';
import './Webcam.css';
import GestureDetector from '/imports/mediapipe/gestures';

interface WebcamProps {
  grayscale: boolean;
}

export const WebcamComponent: React.FC<WebcamProps> = ({ grayscale }) => {
  const webcamRef = useRef<Webcam | null>(null);

  GestureDetector(webcamRef);

  return (
    <div className={`webcam-container ${grayscale ? 'grayscale' : ''}`}>
      <Webcam ref={webcamRef} className="webcam-view"/>
    </div>
  );
};