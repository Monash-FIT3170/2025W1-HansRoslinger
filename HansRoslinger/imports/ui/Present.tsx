import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { D3LineChart } from "./Charts/D3LineChart";
import { D3BarChart } from "./Charts/D3BarChart";
// IMPORT THE NEW PIE CHART COMPONENT
import { D3PieChart } from "./Charts/D3PieChart"; 
import { WebcamComponent } from "./Video/webcam";
import { Header } from "./Header";
import { ImageSegmentation } from "./Video/ImageSegmentation";
import { useDatasetNavigation, usePresentationDatasets } from "./Input/Data";
import { Title } from "./Charts/Title";
import { useAuthGuard } from "../handlers/auth/authHook";
import { ChartType, defaultDataset } from "../api/database/dataset/dataset";

// Define chart views (add PIE)
enum CurrentChartView {
  LINE = 'LINE',
  BAR = 'BAR',
  PIE = 'PIE',
}

export const Present: React.FC = () => {
  useAuthGuard();

  // State of tooling features
  const [grayscale, setGrayscale] = useState(false);
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [gestureDetectionStatus, setGestureDetectionStatus] = useState(true);
  const [showHeader, setShowHeader] = useState(true);

  // State for chart features - Uses enum for multi-state chart selection
  const [currentChartView, setCurrentChartView] = useState<CurrentChartView>(CurrentChartView.BAR); 
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomStartPosition, setZoomStartPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("presentationId") ?? "";
  const datasets = usePresentationDatasets(projectId);
  const { currentDataset } = useDatasetNavigation(datasets);

  const grayscaleRef = useRef(grayscale);

  useEffect(() => {
    grayscaleRef.current = grayscale;
  }, [grayscale]);

  const determineGrayscale = () => grayscaleRef.current;
  
  // Helper to determine the next chart view (cycle: LINE -> BAR -> PIE -> LINE)
  const getNextChartView = useCallback((current: CurrentChartView) => {
    switch (current) {
      case CurrentChartView.LINE:
        return CurrentChartView.BAR;
      case CurrentChartView.BAR:
        return CurrentChartView.PIE;
      case CurrentChartView.PIE:
      default:
        return CurrentChartView.LINE;
    }
  }, []);

  // code which handles playing a dot at the start position of the zoom (No change)
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
          setZoomStartPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    window.addEventListener("chart:togglezoom", handleToggleZoom);
    return () =>
      window.removeEventListener("chart:togglezoom", handleToggleZoom);
  }, []);

  // code which switches the chart type when thumbs up is done (Modified)
  useEffect(() => {
    const handleSwitchChart = () => {
      // Cycle to the next chart view
      setCurrentChartView(prev => getNextChartView(prev));
    };

    window.addEventListener("chart:switch", handleSwitchChart);
    return () => window.removeEventListener("chart:switch", handleSwitchChart);
  }, [getNextChartView]); 

  // Set initial chart type based on dataset preference (Modified)
  useEffect(() => {
    const preferredType = (currentDataset ?? defaultDataset).preferredChartType;
    let initialView = CurrentChartView.BAR; // Default to BAR or LINE

    if (preferredType === ChartType.LINE) {
      initialView = CurrentChartView.LINE;
    } else if (preferredType === ChartType.BAR) {
      initialView = CurrentChartView.BAR;
    }
    
    setCurrentChartView(initialView);
  }, [currentDataset]);

  const toggleGrayscale = () => {
    setGrayscale((b) => !b);
  };

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

  // --- RENDER FUNCTION ---
  
  // Function to render the correct chart component
  const renderChart = () => {
    const dataset = currentDataset ?? defaultDataset;

    switch (currentChartView) {
      case CurrentChartView.LINE:
        return <D3LineChart dataset={dataset} />;
      case CurrentChartView.BAR:
        return <D3BarChart dataset={dataset} />;
      case CurrentChartView.PIE:
        return <D3PieChart dataset={dataset} />; 
      default:
        return <D3BarChart dataset={dataset} />; // Fallback
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fullscreen video and segmentation logic (no change) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${backgroundRemoval ? "invisible pointer-events-none" : ""}`}
      >
        <WebcamComponent
          gestureDetectionStatus={gestureDetectionStatus}
          grayscale={grayscale}
        />
      </div>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${!backgroundRemoval ? "invisible pointer-events-none" : ""}`}
      >
        <ImageSegmentation grayscale={() => determineGrayscale()} />
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

      {/* charts - RENDER THE SWITCHED CHART */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bg-transparent flex justify-center"
        style={{ bottom: "10%", width: "95%", height: "50%" }}
      >
        {renderChart()}
      </div>
      
      {/* Title (no change) */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bg-transparent flex justify-center"
        style={{ bottom: 0, width: "95%", height: "10%" }}
      >
        <Title dataset={currentDataset ?? defaultDataset} />
      </div>

      {/* Dynamic toolbar */}
      <div className={toolbarClasses}>
        {showHeader && (
          <Header
            onToggleBackgroundRemoval={() => setBackgroundRemoval((b) => !b)}
            onToggleGrayscale={toggleGrayscale}
            
            currentChartType={currentChartView as 'LINE' | 'BAR' | 'PIE'}
            
            onToggleChart={() => setCurrentChartView(getNextChartView)} 
            gestureDetectionStatus={gestureDetectionStatus}
            onToggleGestureDetectionStatus={() =>
              setGestureDetectionStatus((c) => !c)
            }
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