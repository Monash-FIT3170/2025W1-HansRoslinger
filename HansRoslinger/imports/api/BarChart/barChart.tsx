// Function to generate random bar chart data
export const generateBarChartData = () => {
  // Create an array of 20 labels: ["Item 1", "Item 2", ..., "Item 20"]
  const labels = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

  // Generate an array of 20 random values between 10 and 109
  const values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 10);

  // Return a dataset structure compatible with Chart.js
  return {
    labels, // x-axis labels
    datasets: [
      {
        label: "Test Data", // Legend label for the dataset
        data: values, // y-axis values for each bar
        backgroundColor: "rgba(75, 192, 192, 0.7)", // Bar color with opacity
      },
    ],
  };
};

// Chart configuration options for Chart.js
export const options = {
  responsive: true, // Makes the chart resize dynamically
  plugins: {
    legend: {
      position: "top" as const, // Positions the legend at the top of the chart
    },
    title: {
      display: true, // Enables the chart title
      text: "Large Bar Chart Test", // Text to display as the title
    },
  },
};
