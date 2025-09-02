import React from "react";
import { Button } from "@mui/material";

interface HeaderProps {
  backgroundRemoval: boolean;
  grayscale: boolean;
  showLineChart: boolean;
  gestureDetectionStatus: boolean;
  onToggleBackgroundRemoval: () => void;
  onToggleGrayscale: () => void;
  onToggleChart: () => void;
  onToggleGestureDetectionStatus: () => void;
  showAssets: boolean;
  setShowAssets: (cb: (s: boolean) => boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  backgroundRemoval,
  grayscale,
  showLineChart,
  gestureDetectionStatus,
  onToggleBackgroundRemoval,
  onToggleGrayscale,
  onToggleChart,
  onToggleGestureDetectionStatus,
  showAssets,
  setShowAssets,
}) => (
  <>
    {/* Gesture Detection */}
    <Button
      variant="contained"
      onClick={onToggleGestureDetectionStatus}
      id="toggle-gesture-detection"
      sx={{
        width: 40,
        height: 40,
        minWidth: 0,
        fontSize: "0.75rem",
        fontWeight: "medium",
        backgroundColor: gestureDetectionStatus ? "cyan.400" : "grey.700",
        color: gestureDetectionStatus ? "black" : "white",
        "&:hover": {
          backgroundColor: gestureDetectionStatus ? "cyan.300" : "grey.600",
        },
      }}
    >
      GD
    </Button>

    {/* Background Removal */}
    <Button
      variant="contained"
      onClick={onToggleBackgroundRemoval}
      id="background-removal-enable"
      sx={{
        width: 40,
        height: 40,
        minWidth: 0,
        fontSize: "0.75rem",
        fontWeight: "medium",
        backgroundColor: backgroundRemoval ? "cyan.400" : "grey.700",
        color: backgroundRemoval ? "black" : "white",
        "&:hover": {
          backgroundColor: backgroundRemoval ? "cyan.300" : "grey.600",
        },
      }}
    >
      BR
    </Button>

    {/* Grayscale */}
    <Button
      variant="contained"
      onClick={onToggleGrayscale}
      sx={{
        width: 40,
        height: 40,
        minWidth: 0,
        fontSize: "0.75rem",
        fontWeight: "medium",
        backgroundColor: grayscale ? "cyan.400" : "grey.700",
        color: grayscale ? "black" : "white",
        "&:hover": {
          backgroundColor: grayscale ? "cyan.300" : "grey.600",
        },
      }}
    >
      GS
    </Button>

    {/* Show Assets (SA) */}
    <Button
      variant="contained"
      size="small"
      sx={{
        width: 40,
        height: 40,
        minWidth: 0,
        fontSize: "0.75rem",
        fontWeight: "medium",
        backgroundColor: showAssets ? "cyan.400" : "grey.700",
        color: showAssets ? "black" : "white",
        "&:hover": {
          backgroundColor: showAssets ? "cyan.300" : "grey.600",
        },
      }}
      onClick={() => setShowAssets((s) => !s)}
    >
      SA
    </Button>

    {/* Chart Toggle */}
    <Button
      variant="contained"
      onClick={onToggleChart}
      sx={{
        width: 40,
        height: 40,
        minWidth: 0,
        fontSize: "0.75rem",
        fontWeight: "medium",
        backgroundColor: "cyan.400",
        color: "black",
        "&:hover": {
          backgroundColor: "cyan.300",
        },
      }}
    >
      {showLineChart ? "Bar" : "Line"}
    </Button>
  </>
);
