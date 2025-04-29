import React, { useState } from 'react';
import './main.css';
import { Button } from './Input';
import { WebcamComponent } from './Video/webcam';
import { D3BarChart } from './Charts/D3BarChart';
import GestureRecognizerComponent from "../mediapipe/gestures";

export const App = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true); // Webcam is always visible

  const data = [
    { label: 'Jan', value: 50 },
    { label: 'Feb', value: 70 },
    { label: 'Mar', value: 40 },
    { label: 'Apr', value: 90 },
    { label: 'May', value: 60 },
    { label: 'Jun', value: 80 },
    { label: 'Jul', value: 30 },
    { label: 'Aug', value: 100 },
    { label: 'Sep', value: 20 },
    { label: 'Oct', value: 50 },
    { label: 'Nov', value: 70 },
    { label: 'Dec', value: 30 },
  ];

  return (
  <div className="app-container">
      <div className="button-container">
        <Button label="Toggle Grayscale" onClick={() => setGrayscale(!grayscale)} />
      </div>
      {showWebcam && <WebcamComponent grayscale={grayscale} />}
      <D3BarChart data={data} />
      <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Gesture Recognition Demo</h1>
      <GestureRecognizerComponent />
      </div>
  </div>
    
);
};
