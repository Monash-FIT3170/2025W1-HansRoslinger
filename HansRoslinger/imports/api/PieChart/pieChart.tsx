// api/PieChart/pieChart.ts
export type Slice = { label: string; value: number };

const makeColors = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const hue = (i * 137.508) % 360; // golden-angle spacing
    return `hsl(${hue} 80% 55% / 0.85)`;
  });

export const generatePieChartData = (slices?: Slice[]) => {
  const demo =
    slices && slices.length
      ? slices
      : [
          { label: "Apples", value: 40 },
          { label: "Bananas", value: 25 },
          { label: "Cherries", value: 20 },
          { label: "Dates", value: 15 },
        ];

  const clean = demo
    .map(s => ({ label: String(s.label || "").trim(), value: Number(s.value) }))
    .filter(s => s.label && Number.isFinite(s.value) && s.value > 0);

  const labels = clean.map(d => d.label);
  const values = clean.map(d => d.value);
  const backgroundColor = makeColors(values.length);

  return {
    labels,
    datasets: [
      {
        label: "User Data",
        data: values,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };
};

export const pieOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: {
      display: true,
      text: "User Pie Chart",
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const value = Number(ctx.parsed);
          const ds = ctx.dataset?.data as number[] | undefined;
          const total =
            ds?.reduce((s: number, v: number) => s + (Number(v) || 0), 0) || 0;
          const pct = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
          return `${ctx.label}: ${value} (${pct}%)`;
        },
      },
    },
  },
};
