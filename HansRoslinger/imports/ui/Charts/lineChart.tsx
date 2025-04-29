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

const LineChart: React.FC = () => {
  const data = generateLineChartData();

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
