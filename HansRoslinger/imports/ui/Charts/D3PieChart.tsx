import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
} from "./constants";
import { Dataset } from "../../api/database/dataset/dataset";

interface PieSliceData {
  label: string;
  value: number;
}

interface D3PieChartProps {
  dataset: Dataset;
}

export const D3PieChart: React.FC<D3PieChartProps> = ({ dataset }) => {
  const data: PieSliceData[] = dataset.data;
  const chartRef = useRef<HTMLDivElement>(null);
  const [highlightedSlice, setHighlightedSlice] = useState<string | null>(null);

  // ... (handleHighlight, handleClear, etc. - these parts remain the same)

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
    const innerRadius = 0;
    
    // Center the chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // 🚨 REMOVE THIS BLOCK to remove the top title
    // 8. Add Title (This was the block creating the top title)
    // const titleText = (dataset.title || "Data Distribution (Pie Chart)");
    // svg.append("text")
    //     .attr("x", width / 2)
    //     .attr("y", MARGIN.top / 2)
    //     .attr("text-anchor", "middle")
    //     .attr("fill", AXIS_COLOR)
    //     .style("font-size", "1.4em")
    //     .style("font-weight", "bold")
    //     .text(titleText);


    // --- Logic for EMPTY DATA ---
    if (data.length === 0 || d3.sum(data, d => d.value) === 0) {
        // Draw a placeholder grey circle (analogous to empty axes)
        g.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", outerRadius * 0.95) // Use a slightly smaller radius than max
            .attr("fill", "#333333") // Dark grey color
            .attr("stroke", AXIS_COLOR)
            .style("stroke-width", "1px");
            
        // Add text indicator inside the circle
        g.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("fill", AXIS_COLOR)
            .style("font-size", AXIS_FONT_SIZE)
            .text("No Data Available");

        return; 
    }
    // --- END EMPTY DATA LOGIC ---


    // 2. Color Scale
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(data.map((d) => d.label))
      .range(d3.schemeCategory10);

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
      .outerRadius(outerRadius * 0.95); 

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

        if (d.endAngle - d.startAngle > 0.35) {
          return `${d.data.label} ${percentage}%`;
        }
        return "";
      });
  };

  // ... (Effect Hooks remain the same)
  
  useEffect(() => {
    renderChart();
    window.addEventListener("resize", renderChart);
    
    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, [data, highlightedSlice, dataset]); 

  return <div ref={chartRef} className="w-full h-full" />;
};