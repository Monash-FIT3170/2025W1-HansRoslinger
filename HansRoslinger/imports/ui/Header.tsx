import React from "react";

interface HeaderProps {
  onToggleBackgroundRemoval: () => void;
  onToggleGrayscale: () => void;
  showLineChart: boolean;
  onToggleChart: () => void;
  backgroundRemoval: boolean;
  grayscale: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleBackgroundRemoval,
  onToggleGrayscale,
  showLineChart,
  onToggleChart,
  backgroundRemoval,
  grayscale,
}) => (
  <>
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
