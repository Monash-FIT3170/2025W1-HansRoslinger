import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { SELECT_COLOUR, DARK_SELECT_COLOUR, MARGIN, AXIS_COLOR, AXIS_FONT_SIZE, BAR_OPACITY } from "./constants";
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
  const [highlightedSlices, setHighlightedSlices] = useState<Set<string>>(new Set());
  const [filteredData, setFilteredData] = useState(data);
  const [zoomScale, setZoomScale] = useState(1);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const hoverClearTimeout = useRef<number | null>(null);

  // Transient hover: highlight while finger is over a slice
  const handleHover = (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = customEvent.detail;

    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");
    const slices = svg.selectAll<SVGPathElement, d3.PieArcDatum<PieSliceData>>("path.arc");

    // Get the SVG's bounding rectangle to calculate center
    const svgNode = svg.node();
    if (!svgNode) return;
    const svgRect = (svgNode as SVGSVGElement).getBoundingClientRect();

    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;

    // Calculate radius from chart dimensions
    const { width, height } = chartRef.current.getBoundingClientRect();
    const outerRadius = Math.min(width, height) / 2 - MARGIN.top;
    const innerRadius = 0;

    let hovered: string | null = null;
    let minDistance = Infinity;

    // Check each slice - find which slice center is closest to the finger
    slices.each(function (d) {
      // Calculate the center point of this slice
      const angle = (d.startAngle + d.endAngle) / 2;
      const radius = (innerRadius + outerRadius) / 2;
      
      // Convert polar to cartesian coordinates
      const sliceCenterX = centerX + radius * Math.cos(angle - Math.PI / 2);
      const sliceCenterY = centerY + radius * Math.sin(angle - Math.PI / 2);

      // Calculate distance from finger to slice center
      const distance = Math.sqrt(
        Math.pow(x - sliceCenterX, 2) + Math.pow(y - sliceCenterY, 2)
      );

      // Use a threshold - if finger is within radius distance of slice center
      const threshold = radius * 0.7; // 70% of slice radius
      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        hovered = d.data.label;
      }
    });

    setHoverLabel(hovered);
    if (hoverClearTimeout.current) window.clearTimeout(hoverClearTimeout.current);
    hoverClearTimeout.current = window.setTimeout(() => setHoverLabel(null), 120);
  };

  // Permanent highlight: toggle selection of slices
  const handleHighlight = (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = customEvent.detail;

    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");
    const slices = svg.selectAll<SVGPathElement, d3.PieArcDatum<PieSliceData>>("path.arc");

    // Get the SVG's bounding rectangle to calculate center
    const svgNode = svg.node();
    if (!svgNode) return;
    const svgRect = (svgNode as SVGSVGElement).getBoundingClientRect();

    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;

    // Calculate radius from chart dimensions
    const { width, height } = chartRef.current.getBoundingClientRect();
    const outerRadius = Math.min(width, height) / 2 - MARGIN.top;
    const innerRadius = 0;

    let targetLabel: string | null = null;
    let minDistance = Infinity;

    // Check each slice - find which slice center is closest to the finger
    slices.each(function (d) {
      // Calculate the center point of this slice
      const angle = (d.startAngle + d.endAngle) / 2;
      const radius = (innerRadius + outerRadius) / 2;
      
      // Convert polar to cartesian coordinates
      const sliceCenterX = centerX + radius * Math.cos(angle - Math.PI / 2);
      const sliceCenterY = centerY + radius * Math.sin(angle - Math.PI / 2);

      // Calculate distance from finger to slice center
      const distance = Math.sqrt(
        Math.pow(x - sliceCenterX, 2) + Math.pow(y - sliceCenterY, 2)
      );

      // Use a threshold - if finger is within radius distance of slice center
      const threshold = radius * 0.7; // 70% of slice radius
      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        targetLabel = d.data.label;
      }
    });

    if (targetLabel) {
      setHighlightedSlices((prev) => {
        const next = new Set(prev);
        if (next.has(targetLabel!)) {
          next.delete(targetLabel!);
        } else {
          next.add(targetLabel!);
        }
        return next;
      });
    }
  };

  // Clear filters or highlighted slices
  const handleClear = () => {
    const isFiltered = filteredData.length !== data.length;

    if (isFiltered) {
      setFilteredData(data);
      setZoomScale(1);
    } else if (highlightedSlices.size > 0) {
      setHighlightedSlices(new Set());
    }
  };

  // Filter to show only highlighted slices
  const handleFilter = () => {
    if (highlightedSlices.size > 0) {
      setFilteredData(data.filter((d) => highlightedSlices.has(d.label)));
      setHighlightedSlices(new Set()); // Clear selection after filtering
    }
  };

  // Zoom functionality
  const handleZoom = (event: Event) => {
    const customEvent = event as CustomEvent<{
      scaleX: number;
      scaleY: number;
    }>;
    const { scaleX } = customEvent.detail;

    const chartWidth = chartRef.current?.getBoundingClientRect().width || 1;
    const windowWidth = window.innerWidth;
    const maxAllowedScale = (0.95 * windowWidth) / chartWidth;

    const clampedScale = Math.max(0.5, Math.min(1.5, Math.min(scaleX, maxAllowedScale)));
    setZoomScale(clampedScale);
  };

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
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

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
    if (filteredData.length === 0 || d3.sum(filteredData, (d) => d.value) === 0) {
      // Draw a placeholder grey circle (analogous to empty axes)
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", outerRadius * 0.95) // Use a slightly smaller radius than max
        .attr("fill", "#333333") // Dark grey color
        .attr("stroke", AXIS_COLOR)
        .style("stroke-width", "1px");

      // Add text indicator inside the circle
      g.append("text").attr("x", 0).attr("y", 0).attr("text-anchor", "middle").attr("fill", AXIS_COLOR).style("font-size", AXIS_FONT_SIZE).text("No Data Available");

      return;
    }
    // --- END EMPTY DATA LOGIC ---

    // 2. Color Scale
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(filteredData.map((d) => d.label))
      .range(d3.schemeCategory10);

    // 3. Define D3 Pie Layout
    const pie = d3
      .pie<PieSliceData>()
      .sort(null)
      .value((d) => d.value);

    const arcs = pie(filteredData);

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
        const isHighlighted = highlightedSlices.has(d.data.label);
        const isHovered = d.data.label === hoverLabel;
        
        // Selected (permanent) gets darker color, hover (temporary) gets lighter color
        if (isHighlighted) {
          return DARK_SELECT_COLOUR; // Darker for selected
        } else if (isHovered) {
          return SELECT_COLOUR; // Lighter for hover
        } else {
          return color(d.data.label); // Original color
        }
      })
      .attr("opacity", BAR_OPACITY) // Make it semi-transparent like bar chart
      .attr("stroke", "white")
      .style("stroke-width", "2px");

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
        const total = d3.sum(filteredData, (d) => d.value);
        const percentage = ((d.data.value / total) * 100).toFixed(1);

        if (d.endAngle - d.startAngle > 0.35) {
          return `${d.data.label} ${percentage}%`;
        }
        return "";
      });

    // Apply zoom scale
    svg.attr("transform", `scale(${zoomScale})`);
  };

  useEffect(() => {
    renderChart();
    window.addEventListener("resize", renderChart);
    window.addEventListener("chart:hover", handleHover as EventListener);
    window.addEventListener("chart:highlight", handleHighlight as EventListener);
    window.addEventListener("chart:clear", handleClear as EventListener);
    window.addEventListener("chart:filter", handleFilter as EventListener);
    window.addEventListener("chart:zoom", handleZoom as EventListener);

    return () => {
      window.removeEventListener("resize", renderChart);
      window.removeEventListener("chart:hover", handleHover as EventListener);
      window.removeEventListener("chart:highlight", handleHighlight as EventListener);
      window.removeEventListener("chart:clear", handleClear as EventListener);
      window.removeEventListener("chart:filter", handleFilter as EventListener);
      window.removeEventListener("chart:zoom", handleZoom as EventListener);
    };
  }, [filteredData, highlightedSlices, hoverLabel, zoomScale]);

  // Reset filters when dataset changes
  useEffect(() => {
    setFilteredData(data);
    setHighlightedSlices(new Set());
    setZoomScale(1);
  }, [dataset]);

  return <div ref={chartRef} className="w-full h-full" />;
};
