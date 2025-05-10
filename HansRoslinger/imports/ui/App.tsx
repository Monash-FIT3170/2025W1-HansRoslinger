import React, { useState } from 'react';
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';
import { Header } from './Header';

export const App: React.FC = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  const [showHeader, setShowHeader] = useState(true);

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

  // switch between expanded & collapsed toolbar styles
  const toolbarClasses = showHeader
    ? [
        'absolute top-4 right-4 bottom-4 w-16',
        'bg-gray-900 rounded-2xl shadow-lg',
        'flex flex-col items-center justify-end py-4 space-y-2',
        'z-50',
      ].join(' ')
    : [
        'absolute bottom-4 right-4 w-16 h-16',
        'bg-gray-900 rounded-xl shadow-lg',
        'flex items-center justify-center',
        'z-50',
      ].join(' ');

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

      {/* Bottom-left transparent charts */}
      <div className="absolute bottom-4 left-4 w-112 h-64 bg-transparent pointer-events-none">
        {showLineChart ? (
          <D3LineChart data={data} width={448} height={256} />
        ) : (
          <D3BarChart data={data} width={448} height={256} />
        )}
      </div>

      {/* Dynamic toolbar: collapsed when hidden, expanded when showing */}
      <div className={toolbarClasses}>
        <button
          className="w-10 h-10 rounded-lg bg-gray-600 hover:bg-gray-500 text-sm text-white"
          onClick={() => setShowHeader((h) => !h)}
        >
          {showHeader ? 'Hide' : 'Show'}
        </button>

        {showHeader && (
          <Header
            grayscale={grayscale}
            onToggleGrayscale={() => setGrayscale((g) => !g)}
            showLineChart={showLineChart}
            onToggleChart={() => setShowLineChart((c) => !c)}
          />
        )}
      </div>
    </div>
  );
};