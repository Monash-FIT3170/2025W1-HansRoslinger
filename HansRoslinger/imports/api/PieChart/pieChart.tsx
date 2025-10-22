// api/PieChart/pieChart.ts

// The original 20 values generated for the line chart
const generateRandomValues = (count: number) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 10);

/**
 * Generates aggregated data suitable for a Pie chart.
 * Groups 20 random values into 4 categories.
 */
export const generatePieChartData = () => {
  const allValues = generateRandomValues(20);

  // Aggregation Logic: Sum the values into 4 groups of 5
  const categoryLabels = ["Q1 Sales", "Q2 Sales", "Q3 Sales", "Q4 Sales"];
  const categoryValues = [0, 0, 0, 0];

  for (let i = 0; i < allValues.length; i++) {
    const categoryIndex = Math.floor(i / 5);
    categoryValues[categoryIndex] += allValues[i];
  }

  // Define a distinct color array for each slice
  const backgroundColors = [
    "rgba(255, 99, 132, 0.8)", // Red
    "rgba(54, 162, 235, 0.8)", // Blue
    "rgba(255, 206, 86, 0.8)", // Yellow
    "rgba(75, 192, 192, 0.8)", // Green
  ];

  return {
    labels: categoryLabels,
    datasets: [
      {
        label: "Aggregated Sales Total",
        data: categoryValues,
        backgroundColor: backgroundColors, // Array of colors for slices
        hoverOffset: 15, // Adds a slight pop-out effect on hover
      },
    ],
  };
};

export const options = {
  responsive: true,
  plugins: {
    legend: {
      // Placing the legend to the right is common for pie charts
      position: "right" as const, 
      labels: {
        // Use the colors from the dataset as the legend boxes
        usePointStyle: true, 
      }
    },
    title: {
      display: true,
      text: "Quarterly Data Distribution", // Updated title
      font: {
        size: 16
      }
    },
    // Optional: Add tooltips to show the percentage for each slice
    tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed !== null) {
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const currentValue = context.parsed;
                    const percentage = ((currentValue/total) * 100).toFixed(1) + '%';
                    label += `${currentValue.toFixed(0)} (${percentage})`;
                }
                return label;
            }
        }
    }
  },
};