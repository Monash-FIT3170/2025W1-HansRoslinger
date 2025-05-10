import React, { useState } from 'react';
import { Header } from './Header';
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';

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
    <div className="relative w-screen h-screen">
      {/* Full‐screen video */}
      {showWebcam && (
        <div className="absolute inset-0">
          {/* Make sure your WebcamComponent accepts className or style props */}
          <WebcamComponent
            grayscale={grayscale}
          />
        </div>
      )}

      {/* Bottom‐left transparent chart panel */}
      <div className="absolute bottom-4 left-4 w-80 h-40 bg-transparent">
        {showLineChart ? (
          <D3LineChart data={data} width={600} height={150} />
        ) : (
          <D3BarChart data={data} width={600} height={150} />
        )}
      </div>

      {/* Right‐hand toolbar (unstyled colors) */}
      <div className="absolute top-0 right-0 bottom-0 w-16 flex flex-col items-center py-4 space-y-4">
        <Header
          grayscale={grayscale}
          onToggleGrayscale={() => setGrayscale((g) => !g)}
          showLineChart={showLineChart}
          onToggleChart={() => setShowLineChart((c) => !c)}
        />
        <button
          onClick={() => setShowWebcam((w) => !w)}
          className="p-2 rounded"
        >
          Toggle Cam
        </button>
        <button
          onClick={() => setShowLineChart((c) => !c)}
          className="p-2 rounded"
        >
          Toggle Chart
        </button>
      </div>
    </div>
  );
};
