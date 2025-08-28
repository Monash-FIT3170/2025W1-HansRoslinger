import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { D3LineChart } from "./Charts/D3LineChart";
import { D3BarChart } from "./Charts/D3BarChart";
import { WebcamComponent } from "./Video/webcam";
import { Header } from "./Header";
import { ImageSegmentation } from "./Video/ImageSegmentation";
import { useDatasetNavigation, usePresentationDatasets } from "./Input/Data";
import { Title } from "./Charts/Title";
import { useAuthGuard } from "../handlers/auth/authHook";
import { ChartType, defaultDataset } from "../api/database/dataset/dataset";

// MUI imports
import { Box, Button } from "@mui/material";

export const Present: React.FC = () => {
  useAuthGuard();

  // State of tooling features
  const [grayscale, setGrayscale] = useState(false);
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [gestureDetectionStatus, setGestureDetectionStatus] = useState(true);
  const [showHeader, setShowHeader] = useState(true);

  // State for chart features
  const [showLineChart, setShowLineChart] = useState(false);
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

  // Handle zoom toggle
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

  // Handle chart switch
  useEffect(() => {
    const handleSwitchChart = () => {
      setShowLineChart((prev) => !prev);
    };

    window.addEventListener("chart:switch", handleSwitchChart);
    return () => window.removeEventListener("chart:switch", handleSwitchChart);
  }, []);

  // Initialize chart type
  useEffect(() => {
    setShowLineChart(
      (currentDataset ?? defaultDataset).preferredChartType === ChartType.LINE,
    );
  }, [currentDataset]);

  const toggleGrayscale = () => {
    setGrayscale((b) => !b);
  };

  const toolbarStyles = showHeader
    ? {
        position: "absolute" as const,
        top: 16,
        right: 16,
        bottom: 16,
        width: 64,
        backgroundColor: "#1f2937",
        borderRadius: 16,
        boxShadow: 4,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingY: 2,
        gap: 8,
        zIndex: 50,
      }
    : {
        position: "absolute" as const,
        bottom: 16,
        right: 16,
        width: 64,
        height: 64,
        backgroundColor: "#111827",
        borderRadius: 12,
        boxShadow: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      };

  return (
    <Box position="relative" width="100vw" height="100vh" overflow="hidden">
      {/* Fullscreen video */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          visibility: backgroundRemoval ? "hidden" : "visible",
          pointerEvents: backgroundRemoval ? "none" : "auto",
        }}
      >
        <WebcamComponent
          gestureDetectionStatus={gestureDetectionStatus}
          grayscale={grayscale}
        />
      </Box>

      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          visibility: !backgroundRemoval ? "hidden" : "visible",
          pointerEvents: !backgroundRemoval ? "none" : "auto",
        }}
      >
        <ImageSegmentation grayscale={() => determineGrayscale()} />
      </Box>

      {isZoomEnabled && zoomStartPosition && (
        <Box
          position="absolute"
          width={16}
          height={16}
          bgcolor="cyan.400"
          borderRadius="50%"
          sx={{
            pointerEvents: "none",
            zIndex: 50,
            left: `${zoomStartPosition.x}px`,
            top: `${zoomStartPosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Charts */}
      <Box
        position="absolute"
        left="50%"
        sx={{ transform: "translateX(-50%)" }}
        bgcolor="transparent"
        display="flex"
        justifyContent="center"
        style={{ bottom: "10%", width: "95%", height: "50%" }}
      >
        {showLineChart ? (
          <D3LineChart dataset={currentDataset ?? defaultDataset} />
        ) : (
          <D3BarChart dataset={currentDataset ?? defaultDataset} />
        )}
      </Box>

      {/* Title area */}
      <Box
        position="absolute"
        left="50%"
        sx={{ transform: "translateX(-50%)" }}
        bgcolor="transparent"
        display="flex"
        justifyContent="center"
        style={{ bottom: 0, width: "95%", height: "10%" }}
      >
        <Title dataset={currentDataset ?? defaultDataset} />
      </Box>

      {/* Toolbar */}
      <Box sx={toolbarStyles}>
        {showHeader && (
          <Header
            onToggleBackgroundRemoval={() => setBackgroundRemoval((b) => !b)}
            onToggleGrayscale={toggleGrayscale}
            showLineChart={showLineChart}
            onToggleChart={() => setShowLineChart((c) => !c)}
            gestureDetectionStatus={gestureDetectionStatus}
            onToggleGestureDetectionStatus={() =>
              setGestureDetectionStatus((c) => !c)
            }
            backgroundRemoval={backgroundRemoval}
            grayscale={grayscale}
          />
        )}
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "#4b5563",
            "&:hover": { backgroundColor: "#6b7280" },
            textTransform: "none",
          }}
          onClick={() => setShowHeader((h) => !h)}
        >
          {showHeader ? "Hide" : "Show"}
        </Button>
      </Box>
    </Box>
  );
};
