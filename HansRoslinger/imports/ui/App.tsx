import React, { useState, useRef, useEffect, useCallback } from 'react';
import './main.css';
import { Button } from './Input';
import { WebcamComponent } from './Video/webcam';
import { D3BarChart } from './Charts/D3BarChart'; // Import the D3.js chart component

export const App = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false); // State to toggle webcam visibility
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 }); // Default dimensions
  const videoRef = useRef<HTMLDivElement>(null);

  const updateDimensions = useCallback(() => {
    if (videoRef.current) {
      const { offsetWidth: width, offsetHeight: height } = videoRef.current;
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    // Update dimensions on mount and when the window resizes
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const data = [
    { label: 'Jan', value: 50 },
    { label: 'Feb', value: 70 },
    { label: 'Mar', value: 40 },
    { label: 'Apr', value: 90 },
  ];

  return (
    <div className={`app-container ${grayscale ? 'grayscale' : ''}`}>
      <div className="button-container">
        <Button label="Toggle Grayscale" onClick={() => setGrayscale(!grayscale)} />
        <Button label="Toggle Webcam" onClick={() => setShowWebcam(!showWebcam)} />
      </div>
      <div className="chart-container" ref={videoRef}>
        {showWebcam && <WebcamComponent grayscale={grayscale} />}
        <D3BarChart data={data} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
};
