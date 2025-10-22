import React from "react";

// Define the exact types for the chart state
type ChartTypeString = 'LINE' | 'BAR' | 'PIE';

interface HeaderProps {
  backgroundRemoval: boolean;
  grayscale: boolean;
  // 🚨 UPDATED PROP TYPE: Uses string to know the current view
  currentChartType: ChartTypeString;
  gestureDetectionStatus: boolean;
  onToggleBackgroundRemoval: () => void;
  onToggleGrayscale: () => void;
  onToggleChart: () => void;
  onToggleGestureDetectionStatus: () => void;
}

// Helper function to determine the label of the NEXT chart
const getNextChartLabel = (currentType: ChartTypeString): string => {
  switch (currentType) {
    case 'LINE':
      return 'Bar'; // If currently LINE, the next is Bar
    case 'BAR':
      return 'Pie'; // If currently BAR, the next is Pie
    case 'PIE':
    default:
      return 'Line'; // If currently PIE, the next is Line
  }
};

export const Header: React.FC<HeaderProps> = ({
  backgroundRemoval,
  grayscale,
  // 🚨 NEW PROP
  currentChartType, 
  gestureDetectionStatus,
  onToggleBackgroundRemoval,
  onToggleGrayscale,
  onToggleChart,
  onToggleGestureDetectionStatus,
}) => {
  
  const buttonLabel = getNextChartLabel(currentChartType);
  
  return (
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

      {/* Chart toggle: Displays the label of the NEXT chart */}
      <button
        onClick={onToggleChart}
        // Button style is active (cyan) when any chart is displayed
        className={`w-10 h-10 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-sm font-medium`}
      >
        {buttonLabel}
      </button>
    </>
  );
};