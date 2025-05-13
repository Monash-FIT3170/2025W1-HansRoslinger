import React from 'react';
import Webcam from 'react-webcam';

interface WebcamProps {
  grayscale: boolean;
}

export const WebcamComponent: React.FC<WebcamProps> = ({ grayscale }) => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex justify-center items-center fixed inset-0 z-[-1] ${grayscale ? 'grayscale' : ''}`}
    >
      <Webcam
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Flip vertically
      />
    </div>
  );
};