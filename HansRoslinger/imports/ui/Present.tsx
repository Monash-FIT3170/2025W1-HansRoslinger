import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
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
import { AssetCollection } from "../api/database/assets/assets";
import { ImageCollection } from "../api/database/images/images";
import { getUserIDCookie } from "../cookies/cookies";
import { getPresentationById } from "../api/database/presentations/presentations";
import { useImageAssetZoom } from "./handlers/image/ImageAssetHandler";
import { useImagePreload } from "./handlers/image/useImagePreload";
import { Box, Button } from "@mui/material";
import { getUserById, getUserSettings } from "../api/database/users/users";
import { defaultMapping, FunctionType, GestureType } from "../gesture/gesture";
import {saveState, loadState} from "../api/stateHistory"

export var Present: React.FC = () => {
  useAuthGuard();
  
  // State of tooling features
  var [grayscale, setGrayscale] = useState(false);
  var [backgroundRemoval, setBackgroundRemoval] = useState(false);
  var [gestureDetectionStatus, setGestureDetectionStatus] = useState(true);
  var [showHeader, setShowHeader] = useState(true);
  var [showAssets, setShowAssets] = useState(false);
  
  // State for chart features
  var [showLineChart, setShowLineChart] = useState(false);
  const { imageScale, setImageScale, isZoomEnabled, setIsZoomEnabled, zoomStartPosition, setZoomStartPosition } = useImageAssetZoom();


  var [searchParams] = useSearchParams();
  var projectId = searchParams.get("presentationId") ?? "";
  var datasets = usePresentationDatasets(projectId);
  var { currentDataset } = useDatasetNavigation(datasets);

  
  // Asset mode state
  var userId = getUserIDCookie();
  var [selectedAssetId, setSelectedAssetId] = useState<string>("");
  var assets = useTracker(() => {
    Meteor.subscribe("assets");
    if (!userId)
      return [] as Array<{ _id: string; name: string; icon?: string }>;
    return AssetCollection.find({ userId }, { sort: { name: 1 } }).fetch();
  }, [userId]);
  var [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  var currentAssetId = assets[currentAssetIndex]?._id ?? selectedAssetId;
  var [currentImageIndex, setCurrentImageIndex] = useState(0);

  
  var assetImages = useTracker(() => {
    Meteor.subscribe("images");
    if (!currentAssetId)
      return [] as Array<{
        _id: string;
        url: string;
        fileName: string;
        assetId: string;
        order?: number;
      }>;
    return ImageCollection.find(
      { assetId: currentAssetId },
      { sort: { order: 1, fileName: 1 } },
    ).fetch();
  }, [currentAssetId]);
  var currentAssetImage = assetImages[currentImageIndex] ?? null;
  
  const stateRef = useRef({
  grayscale,
  backgroundRemoval,
  showHeader,
  showAssets,
  showLineChart,
  imageScale,
  isZoomEnabled,
  zoomStartPosition,
  selectedAssetId,
  currentAssetIndex,
  currentAssetId,
  currentImageIndex,
});

useEffect(() => {
  stateRef.current = {
    grayscale,
    backgroundRemoval,
    showHeader,
    showAssets,
    showLineChart,
    imageScale,
    isZoomEnabled,
    zoomStartPosition,
    selectedAssetId,
    currentAssetIndex,
    currentAssetId,
    currentImageIndex,
  };
}, [
  grayscale,
  backgroundRemoval,
  showHeader,
  showAssets,
  showLineChart,
  imageScale,
  isZoomEnabled,
  zoomStartPosition,
  selectedAssetId,
  currentAssetIndex,
  currentAssetId,
  currentImageIndex,
]);

const lastSaveTimeRef = useRef(0);

useEffect(() => {
  const SAVE_DELAY = 1000;

  const saveIfNeeded = () => {
    const now = Date.now();
    if (now - lastSaveTimeRef.current < SAVE_DELAY) return;

    saveState({imageScale: { ...imageScale },
  zoomStartPosition: zoomStartPosition ? { ...zoomStartPosition } : null,});
    lastSaveTimeRef.current = now;
  };

  saveIfNeeded();

}, [
  grayscale,
  backgroundRemoval,
  showHeader,
  showAssets,
  showLineChart,
  imageScale,
  isZoomEnabled,
  zoomStartPosition,
  selectedAssetId,
  currentAssetIndex,
  currentAssetId,
  currentImageIndex,
]);



// Undo handler
useEffect(() => {
  const onUndo = () => {
    const state = loadState();
    if (!state) return;

    // Restore basic toggles
    setGrayscale(state.grayscale ?? false);
    setBackgroundRemoval(state.backgroundRemoval ?? false);
    setShowHeader(state.showHeader ?? true);
    setShowAssets(state.showAssets ?? false);
    setShowLineChart(state.showLineChart ?? false);

    // Restore selected asset
    if (state.selectedAssetId) {
      const idx = assets.findIndex(a => a._id === state.selectedAssetId);
      if (idx >= 0) {
        setCurrentAssetIndex(idx);
        setSelectedAssetId(state.selectedAssetId);
      } else {
        // fallback if asset not found
        setCurrentAssetIndex(0);
        setSelectedAssetId("");
      }
    }

    // Restore image index safely
    setCurrentImageIndex(Math.min(state.currentImageIndex ?? 0, assetImages.length - 1));

    // Restore zoom
    if (state.imageScale && setImageScale) setImageScale({ ...state.imageScale });
    if (state.isZoomEnabled !== undefined && setIsZoomEnabled) setIsZoomEnabled(state.isZoomEnabled);
    if (state.zoomStartPosition && setZoomStartPosition) setZoomStartPosition({ ...state.zoomStartPosition });
  };

  window.addEventListener("undo", onUndo);
  return () => window.removeEventListener("undo", onUndo);
  }, [assets, assetImages.length, setImageScale, setIsZoomEnabled, setZoomStartPosition]);


  // Preload current, next, and previous images for smooth navigation
  useImagePreload(
    assetImages.length
      ? ([
          assetImages[currentImageIndex]?.url,
          assetImages[(currentImageIndex + 1) % assetImages.length]?.url,
          assetImages[
            (currentImageIndex - 1 + assetImages.length) % assetImages.length
          ]?.url,
        ].filter(Boolean) as string[])
      : [],
  );

  var grayscaleRef = useRef(grayscale);

  useEffect(() => {
    grayscaleRef.current = grayscale;
  }, [grayscale]);

  var determineGrayscale = () => grayscaleRef.current;

  // Zoom toggle handled in useImageAssetZoom

  // Handle chart switch or image switch (in SA mode)
  useEffect(() => {
    var handleSwitchChartOrImage = () => {
      if (showAssets) {
        if (assetImages.length > 1) {
          setCurrentImageIndex((prev) => (prev + 1) % assetImages.length);
        } else if (assets.length > 0) {
          // Fallback: move to next asset when no or single image
          setCurrentAssetIndex((prev) => (prev + 1) % assets.length);
          setCurrentImageIndex(0);
        }
        return;
      }
      setShowLineChart((prev) => !prev);
    };

    window.addEventListener("chart:switch", handleSwitchChartOrImage);
    return () =>
      window.removeEventListener("chart:switch", handleSwitchChartOrImage);
  }, [showAssets, assetImages.length, assets.length]);

  // Initialize chart type
  useEffect(() => {
    setShowLineChart(
      (currentDataset ?? defaultDataset).preferredChartType === ChartType.LINE,
    );
  }, [currentDataset]);

  // Load the selected presentation to pick initial asset
  useEffect(() => {
    let active = true;
    (async () => {
      if (!projectId) return;
      var pres = await getPresentationById(projectId);
      if (active) {
        var p = pres as typeof pres & { assetId?: string };
        var id = (p?.assetID ?? p?.assetId) || "";
        setSelectedAssetId(id || "");
        // If assets are loaded, position index to the selected asset
        if (id) {
          var idx = assets.findIndex((a: { _id: string }) => a._id === id);
          if (idx >= 0) setCurrentAssetIndex(idx);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [projectId, assets.length]);

  // When assets list changes and there's a selectedAssetId, sync index
  useEffect(() => {
    if (!selectedAssetId) return;
    var idx = assets.findIndex(
      (a: { _id: string }) => a._id === selectedAssetId,
    );
    if (idx >= 0) setCurrentAssetIndex(idx);
  }, [selectedAssetId, assets.length]);

  // Reset image index when asset changes or ensure it stays in range
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentAssetId]);
  useEffect(() => {
    if (currentImageIndex >= assetImages.length) setCurrentImageIndex(0);
  }, [assetImages.length, currentImageIndex]);

  // Gesture: in SA mode, SWITCH_DATA (chart:next-data) should go to previous image
  useEffect(() => {
    var onNextData = () => {
      if (!showAssets) return;
      if (assetImages.length <= 1) return; // nothing to go back to
      setCurrentImageIndex(
        (prev) => (prev - 1 + assetImages.length) % assetImages.length,
      );
    };
    window.addEventListener("chart:next-data", onNextData);
    return () => window.removeEventListener("chart:next-data", onNextData);
  }, [showAssets, assetImages.length]);

  // Zoom effect handled in hook; we simply render the scale when assets are visible

  // Handler for GS button, now passed to Header
  var toggleGrayscale = () => setGrayscale((b) => !b);

  var toolbarStyles = showHeader
    ? {
        position: "absolute" as const,
        height: 520,
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
        gap: 6,
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

  var loadSettings = async (): Promise<Record<GestureType, FunctionType>> => {
    var settings = defaultMapping;
    var userID = getUserIDCookie();
    if (userID) {
      var user = await getUserById(userID);
      if (user) {
        settings = await getUserSettings(user.email);
      }
    }

    return settings;
  };

  var [gestureSettings, setGestureSettings] =
    useState<Record<GestureType, FunctionType>>(defaultMapping);

  useEffect(() => {
    loadSettings().then(setGestureSettings);
  }, []);

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
          settings={gestureSettings}
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

      {showAssets && isZoomEnabled && zoomStartPosition && (
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

      {/* Charts (hidden when showing assets) */}
      {!showAssets && (
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
      )}

      {/* Title area */}
      {!showAssets && (
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
      )}

      {/* Assets image (no translucent overlay; image only) */}
      {showAssets && (
        <Box
          position="absolute"
          left="50%"
          bottom={0}
          sx={{ transform: "translateX(-50%)" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-end"
          width="100%"
          height="100%"
        >
          {currentAssetImage ? (
            <img
              key={currentAssetImage._id ?? currentAssetImage.url}
              src={currentAssetImage.url}
              alt={currentAssetImage.fileName || "asset"}
              style={{
                maxWidth: "95%",
                maxHeight: "95%",
                objectFit: "contain",
                transformOrigin: "bottom center",
                transform: `scale(${imageScale.scale})`,
                transition: "transform 80ms linear",
              }}
            />
          ) : (
            <span style={{ color: "#fff" }}>No image for this asset.</span>
          )}
        </Box>
      )}

      {/* Gesture Detection Toggle Button */}
      <Button
        variant="contained"
        onClick={() => {
          setGestureDetectionStatus(!gestureDetectionStatus);
        }}
        id="gesture-detection-toggle"
        sx={{
          position: "absolute",
          top: 40,
          right: 40,
          width: 120,
          height: 120,
          borderRadius: 10,
          opacity: 0.8,
          fontSize: "1rem",
          fontWeight: "bold",
          backgroundColor: !gestureDetectionStatus ? "cyan.400" : "grey.700",
          color: !gestureDetectionStatus ? "black" : "white",
          "&:hover": {
            backgroundColor: !gestureDetectionStatus ? "cyan.300" : "grey.600",
          },
        }}
      >
        {gestureDetectionStatus ? "Disable Gestures" : "Enable Gestures"}
      </Button>

      {/* Toolbar */}
      <Box sx={toolbarStyles}>
        {showHeader && (
          <Header
            onToggleBackgroundRemoval={() => setBackgroundRemoval((b) => !b)}
            onToggleGrayscale={toggleGrayscale}
            showLineChart={showLineChart}
            onToggleChart={() => setShowLineChart((c) => !c)}
            backgroundRemoval={backgroundRemoval}
            grayscale={grayscale}
            showAssets={showAssets}
            setShowAssets={setShowAssets}
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
