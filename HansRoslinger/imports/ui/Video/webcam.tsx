import React from 'react'; // Import React
import Webcam from 'react-webcam';
import './Webcam.css';

interface WebcamProps {
  grayscale: boolean;
}

export const WebcamComponent: React.FC<WebcamProps> = ({ grayscale }) => {
  return (
    <div className={`webcam-container ${grayscale ? 'grayscale' : ''}`}>
      <Webcam className="webcam-view" />
    </div>
  );
};