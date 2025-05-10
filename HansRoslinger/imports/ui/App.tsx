import React, { useState } from 'react';
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';
import { Header } from './Header';

export const App = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);

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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fullscreen video */}
      {showWebcam && (
        <div className="absolute inset-0">
          <WebcamComponent
            grayscale={grayscale}
          />
        </div>
      )}
      <div className="absolute bottom-4 left-4 w-96 h-56 bg-transparent pointer-events-none">
        {showLineChart ? (
          <D3LineChart data={data} width={384} height={224} />
        ) : (
          <D3BarChart  data={data} width={384} height={224} />
        )}
      </div>


      {/* Rounded, inset right-hand toolbar */}
      <div className="absolute top-4 right-5 bottom-4 w-16 bg-gray-900 rounded-2xl shadow-lg flex flex-col items-center justify-end py-4 space-y-4 z-50">
        <Header
          grayscale={grayscale}
          onToggleGrayscale={() => setGrayscale(g => !g)}
          showLineChart={showLineChart}
          onToggleChart={() => setShowLineChart(c => !c)}
        />
      </div>

    </div>
  );
};
