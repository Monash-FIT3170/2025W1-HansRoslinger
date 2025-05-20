import React, { useEffect, useRef, useState } from "react";
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
  const [selectedBars, setSelectedBars] = useState<Set<string>>(new Set());
  const [filteredData, setFilteredData] = useState(data);
  const [zoomScale, setZoomScale] = useState(1);

  const handleHighlight = (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = customEvent.detail;

    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");
    const bars = svg.selectAll<
      SVGRectElement,
      { label: string; value: number }
    >("rect.bar");

    bars.each(function (d) {
      const bbox = this.getBoundingClientRect();
      if (
        x >= bbox.left &&
        x <= bbox.right &&
        y >= bbox.top &&
        y <= bbox.bottom
      ) {
        setSelectedBars((prev) => {
          const next = new Set(prev);
          if (next.has(d.label)) {
            next.delete(d.label);
          } else {
            next.add(d.label);
          }
          return next;
        });
      }
    });
  };

  const handleClear = () => {
    const isFiltered = filteredData.length !== data.length;

    if (isFiltered) {
      setFilteredData(data);
      setZoomScale(1);
    } else if (selectedBars.size > 0) {
      setSelectedBars(new Set());
    }
  };

  const handleFilter = () => {
    if (selectedBars.size > 0) {
      setFilteredData(data.filter((d) => selectedBars.has(d.label)));
    }
  };

  const handleZoom = (event: Event) => {
    const customEvent = event as CustomEvent<{
      scaleX: number;
      scaleY: number;
    }>;
    const { scaleX, scaleY } = customEvent.detail;

    // make it so you can't make the allowed scale larger than the screen
    const chartWidth = chartRef.current?.getBoundingClientRect().width || 1;
    const windowWidth = window.innerWidth;
    const maxAllowedScale = (0.95 * windowWidth) / chartWidth;

    const clampedScaleX = Math.max(
      0.5,
      Math.min(1.5, Math.min(scaleX, maxAllowedScale)),
    );
    const clampedScaleY = Math.max(0.1, Math.min(1, scaleY));

    setZoomScale(clampedScaleX);

    if (clampedScaleY < 1) {
      const total = data.length;
      let visible = Math.floor(total * clampedScaleY);
      let start = 0;

      const selected = Array.from(selectedBars);
      if (selected.length > 0) {
        const indices = selected
          .map((label) => data.findIndex((d) => d.label === label))
          .filter((i) => i !== -1)
          .sort((a, b) => a - b);

        const minIndex = indices[0];
        const maxIndex = indices[indices.length - 1];

        visible = Math.max(visible, maxIndex - minIndex + 1);

        start = Math.max(
          0,
          Math.min(
            total - visible,
            Math.floor((minIndex + maxIndex) / 2) - Math.floor(visible / 2),
          ),
        );

        if (start > minIndex) start = minIndex;
        if (start + visible - 1 < maxIndex) start = maxIndex - visible + 1;
        start = Math.max(0, Math.min(total - visible, start));
      } else {
        start = Math.floor((total - visible) / 2);
      }

      setFilteredData(data.slice(start, start + visible));
    } else {
      setFilteredData(data);
    }
  };

  const renderChart = () => {
    if (!chartRef.current) return;

    const { width, height } = chartRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "none")
      .style("width", "100%")
      .style("height", "100%")
      .style("background-color", "transparent")
      .style("overflow", "visible"); // <-- Add this line

    const xScale = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.label))
      .range([MARGIN.left, width - MARGIN.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.value) || 100])
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
      .selectAll("text")
      .attr("fill", AXIS_COLOR)
      .style("font-size", AXIS_FONT_SIZE)
      .style("text-shadow", AXIS_TEXT_SHADOW);

    svg
      .selectAll("path, line")
      .attr("stroke", AXIS_COLOR)
      .style("filter", AXIS_LINE_SHADOW);

    svg
      .selectAll(".bar")
      .data(filteredData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) || 0)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - MARGIN.bottom - yScale(d.value))
      .attr("fill", (d) =>
        selectedBars.has(d.label) ? SELECT_COLOUR : DEFAULT_COLOUR,
      )
      .style("opacity", BAR_OPACITY);

    svg
      .selectAll(".label")
      .data(filteredData.filter((d) => selectedBars.has(d.label)))
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", AXIS_COLOR)
      .each(function (d) {
        // this is making the text on the selected bars be the size of the bar
        const text = `${d.label} - ${d.value}`;
        const barWidth = xScale.bandwidth();
        // minimum size so that it can be visible when fully zoomed out
        const fontSize = Math.max(20, ((barWidth * 0.8) / text.length) * 1.8);
        d3.select(this)
          .style("font-size", `${fontSize}px`)
          .style("text-shadow", AXIS_TEXT_SHADOW)
          .html(null)
          .append("tspan")
          .attr("font-weight", "bold")
          .text(d.label + " ")
          .append("tspan")
          .attr("font-weight", null)
          .text(d.value);
      });

    svg.attr("transform", `scale(${zoomScale})`);
  };

  useEffect(() => {
    renderChart();
    window.addEventListener("resize", renderChart);
    window.addEventListener(
      "chart:highlight",
      handleHighlight as EventListener,
    );
    window.addEventListener("chart:clear", handleClear as EventListener);
    window.addEventListener("chart:filter", handleFilter as EventListener);
    window.addEventListener("chart:zoom", handleZoom as EventListener);

    return () => {
      window.removeEventListener("resize", renderChart);
      window.removeEventListener("chart:clear", handleClear as EventListener);
      window.removeEventListener(
        "chart:highlight",
        handleHighlight as EventListener,
      );
      window.removeEventListener("chart:filter", handleFilter as EventListener);
      window.removeEventListener("chart:zoom", handleZoom as EventListener);
    };
  }, [data, filteredData, selectedBars, zoomScale]);

  return <div ref={chartRef} className="w-full h-full" />;
};
