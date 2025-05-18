import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
  AXIS_LINE_SHADOW,
  BAR_OPACITY,
} from "./constants";

interface D3BarChartProps {
  data: { label: string; value: number }[];
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const renderChart = () => {
    if (!chartRef.current) return;

    const { width: width, height: height } =
      chartRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    d3.select(chartRef.current).selectAll("*").remove();

    // responsive SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "none")
      .style("width", "100%")
      .style("height", "100%")
      .style("background-color", "transparent");

    // scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([width * 0.05, width * 0.95])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .nice()
      .range([height - MARGIN.bottom, MARGIN.top]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", AXIS_COLOR)
      .style("font-size", AXIS_FONT_SIZE)
      .style("text-shadow", AXIS_TEXT_SHADOW);

    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .attr("transform", `translate(${width * 0.05}, 0)`)
      .selectAll("text")
      .attr("fill", AXIS_COLOR)
      .style("font-size", AXIS_FONT_SIZE)
      .style("text-shadow", AXIS_TEXT_SHADOW);

    svg
      .selectAll("path, line")
      .attr("stroke", AXIS_COLOR)
      .style("filter", AXIS_LINE_SHADOW);

    // bars
    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) || 0)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - MARGIN.bottom - yScale(d.value))
      .attr("fill", DEFAULT_COLOUR)
      .style("opacity", BAR_OPACITY)
      .on("mouseover", function () {
        d3.select(this).attr("fill", SELECT_COLOUR).style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("fill", DEFAULT_COLOUR)
          .style("opacity", BAR_OPACITY);
      });
  };

  useEffect(() => {
    renderChart();
    window.addEventListener("resize", renderChart);
    return () => window.removeEventListener("resize", renderChart);
  }, [data]);

  return <div ref={chartRef} className="w-full h-full" />;
};
