import React from "react";
import { Bar } from "react-chartjs-2";
import { options, generateBarChartData } from "../../api/BarChart/barChart";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
);

interface BarChartProps {
  width?: number | string;
  height?: number | string;
}

const BarChart: React.FC<BarChartProps> = ({
  width = "100%",
  height = 120,
}) => {
  const data = generateBarChartData();

  return (
    <div style={{ width, height, margin: "0 auto" }}>
      <Bar data={data} options={{ ...options, maintainAspectRatio: false }} />
    </div>
  );
};

export default BarChart;
