import React from "react";
import { Button, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Define the exact types for the chart state

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

/**
 * Header of the application
 *
 * @param backgroundRemoval
 * @param grayscale
 * @param showLineChart
 * @param onToggleBackgroundRemoval
 * @param onToggleGrayscale
 * @param onToggleChart
 * @param showAssets
 * @returns HTML
 */
export const Header: React.FC<HeaderProps> = ({ backgroundRemoval, grayscale, showLineChart, onToggleBackgroundRemoval, onToggleGrayscale, onToggleChart, showAssets, setShowAssets }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Back to All Presentations */}
      <Tooltip title="Go back to all presentations" arrow>
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
      </Tooltip>

      {/* Background Removal */}
      <Tooltip title="Toggle background removal" arrow>
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
      </Tooltip>

      {/* Grayscale */}
      <Tooltip title="Toggle grayscale mode" arrow>
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
      </Tooltip>

      {/* Show Assets (SA) */}
      <Tooltip title="Toggle assets view" arrow>
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
      </Tooltip>

      {/* Chart Toggle */}
      <Tooltip title={showLineChart ? "Switch to bar chart" : "Switch to line chart"} arrow>
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
      </Tooltip>
    </>
  );
};
