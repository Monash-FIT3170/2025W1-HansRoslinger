import React, { useState } from 'react';
import { Button } from './Input';
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';
import { Header } from './Header';

import { WebcamComponent } from './Video/webcam';

export const App = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);

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

  const [showLineChart, setShowLineChart] = useState(true);

  return (
    <div className="app-container flex flex-col items-center min-h-screen bg-transparent">
      {showWebcam && <WebcamComponent grayscale={grayscale} />}

      <div className="w-full bg-white py-2 px-4 fixed top-0 flex justify-center shadow-md">
        <Button
          label="Toggle Grayscale"
          onClick={() => setGrayscale(!grayscale)}
          className="mx-auto"
        />
        <Button
          label={`Switch to ${showLineChart ? 'BarChart' : 'LineChart'}`}
          onClick={() => setShowLineChart(!showLineChart)}
          className="mx-auto ml-4"
        />
      </div>
      
      <div className="absolute bottom-0 w-full flex justify-center mb-4">
        {showLineChart ? <D3LineChart data={data} /> : <D3BarChart data={data} />}
      </div>
    </div>
  );
};