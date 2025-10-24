// api/PieChart/pieChart.ts

// Helper to generate 'count' random values between 10–109
const generateRandomValues = (count: number) => 
  Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 10);

/**
 * Generates data for a Pie chart by aggregating 20 random values
 * into 4 quarterly sales categories (Q1–Q4).
 */
export const generatePieChartData = () => {
  const allValues = generateRandomValues(20);

  // Sum every 5 values into one of four quarters
  const categoryLabels = ["Q1 Sales", "Q2 Sales", "Q3 Sales", "Q4 Sales"];
  const categoryValues = [0, 0, 0, 0];

  for (let i = 0; i < allValues.length; i++) {
    const categoryIndex = Math.floor(i / 5); // Map each group of 5 to a quarter
    categoryValues[categoryIndex] += allValues[i];
  }

  // Assign distinct colors for each pie slice
  const backgroundColors = [
    "rgba(255, 99, 132, 0.8)", 
    "rgba(54, 162, 235, 0.8)", 
    "rgba(255, 206, 86, 0.8)", 
    "rgba(75, 192, 192, 0.8)",
  ];

  return {
    labels: categoryLabels,
    datasets: [
      {
        label: "Aggregated Sales Total",
        data: categoryValues,
        backgroundColor: backgroundColors,
        hoverOffset: 15, // Slight 3D effect on hover
      },
    ],
  };
};

// Chart configuration options
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "right" as const,
      labels: { usePointStyle: true },
    },
    title: {
      display: true,
      text: "Quarterly Data Distribution",
      font: { size: 16 },
    },
    tooltip: {
      callbacks: {
        // Custom label showing both value and percentage
        label: function (context: any) {
          let label = context.label || "";
          if (context.parsed !== null) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = context.parsed;
            const percentage = ((currentValue / total) * 100).toFixed(1) + "%";
            label += `: ${currentValue.toFixed(0)} (${percentage})`;
          }
          return label;
        },
      },
    },
  },
};
