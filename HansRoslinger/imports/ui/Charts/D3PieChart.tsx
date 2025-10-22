import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
  // AXIS_LINE_SHADOW, // Not needed for pie
  // LINE_STROKE_WIDTH, // Not needed for pie
  // POINT_RADIUS, // Not needed for pie, but kept as a constant
} from "./constants";
import { Dataset } from "../../api/database/dataset/dataset";

// Define the data structure D3 will operate on
interface PieSliceData {
  label: string;
  value: number;
}

interface D3PieChartProps {
  dataset: Dataset;
}

export const D3PieChart: React.FC<D3PieChartProps> = ({ dataset }) => {
  // Use the original data structure from the line chart
  const data: PieSliceData[] = dataset.data;
  const chartRef = useRef<HTMLDivElement>(null);
  
  // NOTE: These states are maintained for structural consistency, 
  // but their complex logic (filter/zoom) is not used for the pie chart.
  const [filteredData, setFilteredData] = useState(data); 
  const [highlightedDots, setHighlightedDots] = useState<Set<string>>(new Set());
  const [zoomScale, setZoomScale] = useState(1);
  
  // State for visual highlight on a pie slice (for mouse events)
  const [highlightedSlice, setHighlightedSlice] = useState<string | null>(null);

  // --- INTERACTION HANDLERS (DISABLED/SIMPLIFIED FOR PIE CHART) ---

  // Highlighting in a pie chart is usually handled by simple mouse events on the arcs themselves.
  // The complex gesture/coordinate calculation from the line chart is skipped.
  const handleHighlight = (event: Event) => {
    console.warn("chart:highlight event ignored. Pie charts do not use point-based highlighting.");
  };

  // Clearing highlights is the only part that makes sense for a pie chart.
  const handleClear = () => {
    setHighlightedSlice(null); // Clear the active mouse highlight
    setHighlightedDots(new Set()); // Clear the gesture highlight state
  };

  const handleFilter = () => {
    console.warn("chart:filter event ignored. Pie charts typically show the entire dataset.");
  };

  const handleZoom = (event: Event) => {
    console.warn("chart:zoom event ignored. Pie charts do not scale proportionally like linear charts.");
  };

  // --- D3 RENDERING LOGIC ---

  const renderChart = () => {
    if (!chartRef.current) return;

    const { width, height } = chartRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    d3.select(chartRef.current).selectAll("*").remove();

    // 1. Setup SVG Container
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "none")
      .style("width", "100%")
      .style("height", "100%")
      .style("background-color", "transparent")
      .style("overflow", "visible");

    // Calculate chart dimensions
    const outerRadius = Math.min(width, height) / 2 - MARGIN.top;
    const innerRadius = 0; // Standard pie chart. Use > 0 for Doughnut.
    
    // Center the chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
      
    // 2. Color Scale
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(data.map((d) => d.label))
      .range(d3.schemeCategory10); // Standard D3 color scheme

    // 3. Define D3 Pie Layout
    const pie = d3
      .pie<PieSliceData>()
      .sort(null)
      .value((d) => d.value);

    const arcs = pie(data);

    // 4. Define Arc Generators
    const arc = d3
      .arc<d3.PieArcDatum<PieSliceData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius * 0.95); // Slightly smaller for clear border separation

    const labelArc = d3
        .arc<d3.PieArcDatum<PieSliceData>>()
        .innerRadius(outerRadius * 0.7) 
        .outerRadius(outerRadius * 0.7);

    // 5. Draw the Slices (Paths)
    g.selectAll(".arc")
      .data(arcs)
      .join("path")
      .attr("class", "arc")
      .attr("d", arc)
      .attr("fill", (d) => {
        // Use SELECT_COLOUR for hover, otherwise use the color scale
        const isHighlighted = d.data.label === highlightedSlice;
        return isHighlighted ? SELECT_COLOUR : color(d.data.label);
      })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .on("mouseover", (event, d) => {
        setHighlightedSlice(d.data.label);
      })
      .on("mouseout", () => {
        setHighlightedSlice(null);
      });

    // 6. Add Labels (Percentage and Label)
    g.selectAll(".arc-label")
      .data(arcs)
      .join("text")
      .attr("class", "arc-label")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white") 
      .style("font-size", AXIS_FONT_SIZE)
      .style("font-weight", "bold")
      .style("text-shadow", "0 0 3px black")
      .text((d) => {
        const total = d3.sum(data, (d) => d.value);
        const percentage = ((d.data.value / total) * 100).toFixed(1);

        if (d.endAngle - d.startAngle > 0.35) { // Filter small slices
          return `${d.data.label} ${percentage}%`;
        }
        return "";
      });
      
    // 7. Add Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", MARGIN.top / 2)
        .attr("text-anchor", "middle")
        .attr("fill", AXIS_COLOR)
        .style("font-size", "1.4em")
        .style("font-weight", "bold")
        .text("Data Distribution (Pie Chart)");
  };

  // --- EFFECT HOOKS (Identical to Line Chart for consistency) ---
  
  useEffect(() => {
    // We only call renderChart() since the complex logic is disabled/simplified
    renderChart();
    
    // Register event listeners
    window.addEventListener("resize", renderChart);
    window.addEventListener(
      "chart:highlight",
      handleHighlight as EventListener,
    );
    window.addEventListener("chart:clear", handleClear as EventListener);
    window.addEventListener("chart:zoom", handleZoom as EventListener);
    window.addEventListener("chart:filter", handleFilter as EventListener);

    return () => {
      // Cleanup event listeners
      window.removeEventListener("resize", renderChart);
      window.removeEventListener(
        "chart:highlight",
        handleHighlight as EventListener,
      );
      window.removeEventListener("chart:clear", handleClear as EventListener);
      window.removeEventListener("chart:zoom", handleZoom as EventListener);
      window.removeEventListener("chart:filter", handleFilter as EventListener);
    };
  }, [data, highlightedSlice]); // Dependency cleanup: simplified to only depend on data/highlight

  // The filters/state should be reset when the dataset changes (Identical to Line Chart)
  useEffect(() => {
    setFilteredData(data);
    setHighlightedDots(new Set());
    setZoomScale(1);
  }, [dataset]);

  return <div ref={chartRef} className="w-full h-full" />;
};