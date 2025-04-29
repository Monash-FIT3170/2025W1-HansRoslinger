import React from 'react';
import { Bar } from 'react-chartjs-2';
import { options, generateBarChartData } from '../../api/BarChart/barChart';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const BarChart: React.FC = () => {
  const data = generateBarChartData();

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;