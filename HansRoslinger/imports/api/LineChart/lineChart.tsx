export const generateLineChartData = () => {
  const labels = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
  const values = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 10);

  return {
    labels,
    datasets: [
      {
        label: "Test Data",
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
    ],
  };
};

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Large Line Chart Test",
    },
  },
};
