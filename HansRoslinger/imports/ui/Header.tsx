import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  backgroundRemoval: boolean;
  grayscale: boolean;
  showLineChart: boolean;
  onToggleBackgroundRemoval: () => void;
  onToggleGrayscale: () => void;
  onToggleChart: () => void;
  showAssets: boolean;
  setShowAssets: (cb: (s: boolean) => boolean) => void;
}

export const toolbarButtonWidth = 70;
export const toolbarButtonHeight = toolbarButtonWidth;

export const Header: React.FC<HeaderProps> = ({
  backgroundRemoval,
  grayscale,
  showLineChart,
  onToggleBackgroundRemoval,
  onToggleGrayscale,
  onToggleChart,
  showAssets,
  setShowAssets,
}) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Back to All Presentations */}
      <Button
        variant="contained"
        onClick={() => navigate("/allpresentations")}
        sx={{
          width: toolbarButtonWidth,
          height: toolbarButtonHeight,
          minWidth: 0,
          fontSize: "0.75rem",
          fontWeight: "medium",
          backgroundColor: "grey.700",
          color: "white",
          "&:hover": { backgroundColor: "grey.600" },
        }}
      >
        Back
      </Button>

      {/* Background Removal */}
      <Button
        variant="contained"
        onClick={onToggleBackgroundRemoval}
        id="background-removal-enable"
        sx={{
          width: toolbarButtonWidth,
          height: toolbarButtonHeight,
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
          width: toolbarButtonWidth,
          height: toolbarButtonHeight,
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
          width: toolbarButtonWidth,
          height: toolbarButtonHeight,
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
          width: toolbarButtonWidth,
          height: toolbarButtonHeight,
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
};
