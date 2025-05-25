import React, { useState, useEffect } from "react";
import { D3LineChart } from "./Charts/D3LineChart";
import { D3BarChart } from "./Charts/D3BarChart";
import { WebcamComponent } from "./Video/webcam";
import { Header } from "./Header";
import { ImageSegmentation } from "./Video/ImageSegmentation";
import { useCurrentDataset, ChartType } from "./Input/Data";
import { Title } from "./Charts/Title";

export const App: React.FC = () => {
  const [grayscale, setGrayscale] = useState(false);
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [showLineChart, setShowLineChart] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomStartPosition, setZoomStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const currentDataset = useCurrentDataset();

  // code which handles playing a dot at the start position of the zoom
  useEffect(() => {
    const handleToggleZoom = (event: Event) => {
      const customEvent = event as CustomEvent<{ x: number; y: number }>;
      setIsZoomEnabled((prev) => {
        const next = !prev;
        if (next && customEvent.detail) {
          setZoomStartPosition({
            x: customEvent.detail.x,
            y: customEvent.detail.y,
          });
        } else {
          setZoomStartPosition(null);
        }
        return next;
      });
    };

    window.addEventListener("chart:togglezoom", handleToggleZoom);
    return () =>
      window.removeEventListener("chart:togglezoom", handleToggleZoom);
  }, []);

  // code which switches the chart type when thumbs up is done
  useEffect(() => {
    const handleSwitchChart = () => {
      setShowLineChart((prev) => !prev);
    };

    window.addEventListener("chart:switch", handleSwitchChart);
    return () => window.removeEventListener("chart:switch", handleSwitchChart);
  }, []);

  useEffect(() => {
    setShowLineChart(currentDataset.preferredChartType === ChartType.LINE);
  }, [currentDataset]);

  const toolbarClasses = showHeader
    ? [
        "absolute top-4 right-4 bottom-4 w-16",
        "bg-gray-800 rounded-2xl shadow-lg",
        "flex flex-col items-center justify-end py-4 space-y-2",
        "z-50",
      ].join(" ")
    : [
        "absolute bottom-4 right-4 w-16 h-16",
        "bg-gray-900 rounded-xl shadow-lg",
        "flex items-center justify-center",
        "z-50",
      ].join(" ");

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fullscreen video */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${backgroundRemoval ? "invisible pointer-events-none" : ""}`}
      >
        <WebcamComponent grayscale={grayscale} />
      </div>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${!backgroundRemoval ? "invisible pointer-events-none" : ""}`}
      >
        <ImageSegmentation grayscale={grayscale} />
      </div>

      {isZoomEnabled && zoomStartPosition && (
        <div
          className="absolute w-4 h-4 bg-cyan-400 rounded-full pointer-events-none z-50"
          style={{
            left: `${zoomStartPosition.x}px`,
            top: `${zoomStartPosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* charts */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bg-transparent flex justify-center"
        style={{ bottom: "10%", width: "95%", height: "50%" }}
      >
        {showLineChart ? (
          <D3LineChart dataset={currentDataset} />
        ) : (
          <D3BarChart dataset={currentDataset} />
        )}
      </div>
      {/* creates a div directly below the div above that takes up the remaining bottom of the screen and shows the title */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bg-transparent flex justify-center"
        style={{ bottom: 0, width: "95%", height: "10%" }}
      >
        <Title dataset={currentDataset} />
      </div>

      {/* Dynamic toolbar: collapsed when hidden, expanded when showing */}
      <div className={toolbarClasses}>
        {showHeader && (
          <Header
            onToggleBackgroundRemoval={() => setBackgroundRemoval((b) => !b)}
            onToggleGrayscale={() => setGrayscale((g) => !g)}
            showLineChart={showLineChart}
            onToggleChart={() => setShowLineChart((c) => !c)}
            backgroundRemoval={backgroundRemoval}
            grayscale={grayscale}
          />
        )}
        <button
          className="w-10 h-10 rounded-lg bg-gray-600 hover:bg-gray-500 text-sm text-white"
          onClick={() => setShowHeader((h) => !h)}
        >
          {showHeader ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};
