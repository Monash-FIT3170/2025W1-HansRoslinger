import React from 'react';

interface HeaderProps {
  grayscale: boolean;
  onToggleGrayscale: () => void;
  showLineChart: boolean;
  onToggleChart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  grayscale,
  onToggleGrayscale,
  showLineChart,
  onToggleChart,
}) => (
  <>
    {/* Grayscale toggle */}
    <button
      onClick={onToggleGrayscale}
      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium"
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
