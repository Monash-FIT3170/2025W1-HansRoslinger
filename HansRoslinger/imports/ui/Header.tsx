import React from "react";

interface HeaderProps {
  backgroundRemoval: boolean;
  grayscale: boolean;
  showLineChart: boolean;
  gestureDetectionStatus: boolean;
  onToggleBackgroundRemoval: () => void;
  onToggleGrayscale: () => void;
  onToggleChart: () => void;
  onToggleGestureDetectionStatus: () => void;
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
}) => (
  <>
    <button
      onClick={onToggleGestureDetectionStatus}
      id="toggle-gesture-detection"
      className={`w-10 h-10 rounded-lg text-sm font-medium ${
        gestureDetectionStatus
          ? "bg-cyan-400 hover:bg-cyan-300 text-black"
          : "bg-gray-700 hover:bg-gray-600 text-white"
      }`}
    >
      GD
    </button>
    {/* Background removal enable */}
    <button
      onClick={onToggleBackgroundRemoval}
      id="background-removal-enable"
      className={`w-10 h-10 rounded-lg text-sm font-medium ${
        backgroundRemoval
          ? "bg-cyan-400 hover:bg-cyan-300 text-black"
          : "bg-gray-700 hover:bg-gray-600 text-white"
      }`}
    >
      BR
    </button>
    {/* Grayscale toggle */}
    <button
      onClick={onToggleGrayscale}
      className={`w-10 h-10 rounded-lg text-sm font-medium ${
        grayscale
          ? "bg-cyan-400 hover:bg-cyan-300 text-black"
          : "bg-gray-700 hover:bg-gray-600 text-white"
      }`}
    >
      GS
    </button>

    {/* Chart toggle */}
    <button
      onClick={onToggleChart}
      className="w-10 h-10 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-sm font-medium"
    >
      {showLineChart ? "Bar" : "Line"}
    </button>
  </>
);
