// Charts/UI/PieChart.tsx

import React from "react";
// Change the imported component from Line to Pie
import { Pie } from "react-chartjs-2";
// Import pie chart data and options
import { generatePieChartData, options } from "../../api/PieChart/pieChart";
import {
  Chart as ChartJS,
  ArcElement, // <--- Crucial change: Pie chart requires ArcElement
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register required components for the Pie chart
ChartJS.register(
  ArcElement, // Registers the shape that draws pie slices
  Tooltip,
  Legend,
  Title,
);

interface PieChartProps {
  width?: number | string;
  height?: number | string;
}

const PieChart: React.FC<PieChartProps> = ({
  width = "300px", // Pie charts often look better square/smaller
  height = "300px",
}) => {
  const data = generatePieChartData();

  return (
    // Use an equal width/height for the container to ensure the pie is a circle
    <div style={{ width, height, margin: "0 auto" }}>
      <Pie data={data} options={{ ...options, maintainAspectRatio: false }} />
    </div>
  );
};

export default PieChart;
