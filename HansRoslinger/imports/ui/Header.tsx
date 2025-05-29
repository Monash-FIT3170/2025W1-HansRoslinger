import React from 'react';

interface HeaderProps {
  onToggleBackgroundRemoval: () => void;
  onToggleGrayscale: () => void;
  showLineChart: boolean;
  onToggleChart: () => void;
  gestureDetectionStatus: boolean;
  onToggleGestureDetectionStatus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleBackgroundRemoval,
  onToggleGrayscale,
  showLineChart,
  onToggleChart,
  gestureDetectionStatus,
  onToggleGestureDetectionStatus,
}) => (
  <>
    <button
      onClick={onToggleGestureDetectionStatus}
      id="toggle-gesture-detection"
      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium text-white"
    >
      {gestureDetectionStatus ? "DGD" : "EGD"}
    </button>
    {/* Background removal enable */}
    <button
      id="background-removal-enable"
      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium text-white"
    >
      EBR
    </button>
    <button
      onClick={onToggleBackgroundRemoval}
      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium text-white"
    >
      BR
    </button>
    {/* Grayscale toggle */}
    <button
      onClick={onToggleGrayscale}
      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium text-white"
    >
      GS
    </button>

    {/* Chart toggle */}
    <button
      onClick={onToggleChart}
      className="w-10 h-10 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-sm font-medium"
    >
      {showLineChart ? 'Bar' : 'Line'}
    </button>
  </>
);
