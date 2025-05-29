import React, { useState, useEffect } from 'react';
import { D3LineChart } from './Charts/D3LineChart';
import { D3BarChart } from './Charts/D3BarChart';
import { WebcamComponent } from './Video/webcam';
import { Header } from './Header';
import { ImageSegmentation } from './Video/ImageSegmentation/index';

export const App: React.FC = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [showWebcam, _] = useState(true);
  const [showLineChart, setShowLineChart] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [gestureDetectionStatus, setGestureDetectionStatus] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomStartPosition, setZoomStartPosition] = useState<{ x: number; y: number } | null>(null);

  const data = [
    // { label: 'Jan 1', value: 45 },
    // { label: 'Jan 2', value: 52 },
    // { label: 'Jan 3', value: 48 },
    // { label: 'Jan 4', value: 51 },

    // { label: 'Feb 1', value: 55 },
    // { label: 'Feb 2', value: 60 },
    // { label: 'Feb 3', value: 58 },
    // { label: 'Feb 4', value: 62 },

    { label: 'Mar 1', value: 65 },
    { label: 'Mar 2', value: 68 },
    { label: 'Mar 3', value: 70 },
    { label: 'Mar 4', value: 72 },

    { label: 'Apr 1', value: 90 },
    { label: 'Apr 2', value: 110 },
    { label: 'Apr 3', value: 105 },
    { label: 'Apr 4', value: 115 },

    { label: 'May 1', value: 80 },
    { label: 'May 2', value: 78 },
    { label: 'May 3', value: 82 },
    { label: 'May 4', value: 85 },

    { label: 'Jun 1', value: 75 },
    { label: 'Jun 2', value: 80 },
    { label: 'Jun 3', value: 78 },
    { label: 'Jun 4', value: 83 },

    { label: 'Jul 1', value: 70 },
    { label: 'Jul 2', value: 68 },
    { label: 'Jul 3', value: 72 },
    { label: 'Jul 4', value: 74 },

    { label: 'Aug 1', value: 100 },
    { label: 'Aug 2', value: 120 },
    { label: 'Aug 3', value: 115 },
    { label: 'Aug 4', value: 125 },

    { label: 'Sep 1', value: 85 },
    { label: 'Sep 2', value: 80 },
    { label: 'Sep 3', value: 78 },
    { label: 'Sep 4', value: 82 },

    { label: 'Oct 1', value: 70 },
    { label: 'Oct 2', value: 68 },
    { label: 'Oct 3', value: 72 },
    { label: 'Oct 4', value: 74 },

    // { label: 'Nov 1', value: 60 },
    // { label: 'Nov 2', value: 65 },
    // { label: 'Nov 3', value: 62 },
    // { label: 'Nov 4', value: 68 },

    // { label: 'Dec 1', value: 55 },
    // { label: 'Dec 2', value: 58 },
    // { label: 'Dec 3', value: 60 },
    // { label: 'Dec 4', value: 63 },
  ];

  useEffect(() => {
    const handleToggleZoom = (event: Event) => {
      const customEvent = event as CustomEvent<{ x: number; y: number }>;
      setIsZoomEnabled((prev) => {
        const next = !prev;
        if (next && customEvent.detail) {
          setZoomStartPosition({ x: customEvent.detail.x, y: customEvent.detail.y });
        } else {
          setZoomStartPosition(null);
        }
        return next;
      });
    };

    window.addEventListener('chart:togglezoom', handleToggleZoom);
    return () => window.removeEventListener('chart:togglezoom', handleToggleZoom);
  }, []);

  const toolbarClasses = showHeader
    ? [
        'absolute top-4 right-4 bottom-4 w-16',
        'bg-gray-800 rounded-2xl shadow-lg',
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {!backgroundRemoval ? (
            <WebcamComponent gestureDetectionStatus={gestureDetectionStatus} grayscale={grayscale} />
          ) : (
            <ImageSegmentation grayscale={grayscale} />
          )}
        </div>
            )}

        {isZoomEnabled && zoomStartPosition && (
          <div
            className="absolute w-4 h-4 bg-cyan-400 rounded-full pointer-events-none z-50"
            style={{
              left: `${zoomStartPosition.x}px`,
              top: `${zoomStartPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Bottom-left transparent charts */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bg-transparent flex justify-center"
          style={{ bottom: '10%', width: '95%', height: '50%' }}
        >
          {showLineChart ? (
            <D3LineChart data={data} />
          ) : (
            <D3BarChart data={data} />
          )}
        </div>

      {/* Dynamic toolbar: collapsed when hidden, expanded when showing */}
      <div className={toolbarClasses}>
        {showHeader && (
          <Header
            onToggleBackgroundRemoval={() => setBackgroundRemoval((b) => !b)}
            onToggleGrayscale={() => setGrayscale((g) => !g)}
            showLineChart={showLineChart}
            onToggleChart={() => setShowLineChart((c) => !c)}
            gestureDetectionStatus={gestureDetectionStatus}
            onToggleGestureDetectionStatus={() => setGestureDetectionStatus((c) => !c)} 
          />
        )}
        <button
          className="w-10 h-10 rounded-lg bg-gray-600 hover:bg-gray-500 text-sm text-white"
          onClick={() => setShowHeader((h) => !h)}
        >
          {showHeader ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
};
