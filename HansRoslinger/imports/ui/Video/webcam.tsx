import React from 'react';
import Webcam from 'react-webcam';

interface WebcamProps {
  grayscale: boolean;
}

export const WebcamComponent: React.FC<WebcamProps> = ({ grayscale }) => {
  return (
    <div
      className={`webcam-container fixed inset-0 z-[-1] ${grayscale ? 'grayscale' : ''}`}
    >
      <Webcam className="w-full h-full object-cover" />
    </div>
  );
};