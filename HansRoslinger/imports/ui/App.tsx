import React, { useState } from 'react';
import './main.css';
import { Button } from './Input';
import 'material-design-lite/material.min.css';
import 'material-design-lite/material.min.js';
import { WebcamComponent } from './Video/webcam';
import { D3BarChart } from './Charts/D3BarChart';

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
      <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
        <header className="mdl-layout__header">
          <div className="mdl-layout__header-row">
            <div className="button-container">
              <Button
                label="Toggle Grayscale"
                onClick={() => setGrayscale(!grayscale)}
              />
            </div>
            {/* other header content… */}
          </div>
        </header>
      </div>

      <div className="video-container">
        {showWebcam && <WebcamComponent grayscale={grayscale} />}
        <D3BarChart data={data} />
      </div>
    </div>
  );
};
