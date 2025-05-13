import React from 'react';
import { Line } from 'react-chartjs-2';
import { generateLineChartData, options } from '../../api/LineChart/lineChart';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

// Register required components for line chart
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

interface LineChartProps {
  width?: number | string;
  height?: number | string;
}

const LineChart: React.FC<LineChartProps> = ({ width = '600px', height = '90px' }) => {
  const data = generateLineChartData();

  return (
    <div style={{ width, height, margin: '0 auto' }}>
      <Line data={data} options={{ ...options, maintainAspectRatio: false }} />
    </div>
  );
};

export default LineChart;
