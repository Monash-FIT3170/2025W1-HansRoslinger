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
import { Dataset } from "../../api/database/dataset/dataset";

interface D3BarChartProps {
  dataset: Dataset;
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ dataset }) => {
  const data = dataset.data;
  const chartRef = useRef<HTMLDivElement>(null);
  const [highlightedBars, setHighlightedBars] = useState<Set<string>>(
    new Set(),
  );
  const [filteredData, setFilteredData] = useState(data);
  const [zoomScale, setZoomScale] = useState(1);

  // this handles highlighting a particular bar when the gesture is hovering over it
  const handleHighlight = (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = customEvent.detail;

    // don't do anything if the chart is not currently shown to the user
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");
    const bars = svg.selectAll<
      SVGRectElement,
      { label: string; value: number }
    >("rect.bar");

    // this is the complicated logic that checks the position of the pointer finter and checks whether it is over any particular bar chart
    bars.each(function (d) {
      const bbox = this.getBoundingClientRect();
      if (
        x >= bbox.left &&
        x <= bbox.right &&
        y >= bbox.top &&
        y <= bbox.bottom
      ) {
        setHighlightedBars((prev) => {
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

  // this handles clearing filters which are applied to the bar chart
  const handleClear = () => {
    // it should always clear the filters applied first
    const isFiltered = filteredData.length !== data.length;

    if (isFiltered) {
      setFilteredData(data);
      setZoomScale(1);
      // otherwise it will clear the highlighted bars next
    } else if (highlightedBars.size > 0) {
      setHighlightedBars(new Set());
    }
  };

  const handleFilter = () => {
    if (highlightedBars.size > 0) {
      setFilteredData(data.filter((d) => highlightedBars.has(d.label)));
    }
  };

  const handleZoom = (event: Event) => {
    const customEvent = event as CustomEvent<{
      scaleX: number;
      scaleY: number;
    }>;
    const { scaleX, scaleY } = customEvent.detail;

    // this is making sure that the user can't zoom in so much that part of the graph is not visible (going out of the screen)
    const chartWidth = chartRef.current?.getBoundingClientRect().width || 1;
    const windowWidth = window.innerWidth;
    const maxAllowedScale = (0.95 * windowWidth) / chartWidth;

    // the user can ad most zoom in by 0.5x to 1.5x (or size of screen)
    const clampedScaleX = Math.max(
      0.5,
      Math.min(1.5, Math.min(scaleX, maxAllowedScale)),
    );
    // the user can at most show 10% of the graph of 100% of the graph
    const clampedScaleY = Math.max(0.1, Math.min(1, scaleY));

    setZoomScale(clampedScaleX);

    // this logic is making sure that when you zoom in, it will focus around the centre of all the bars you have highlighted
    if (clampedScaleY < 1) {
      const total = data.length;
      let visible = Math.floor(total * clampedScaleY);
      let start = 0;

      const selected = Array.from(highlightedBars);
      if (selected.length > 0) {
        // get the index positions of all the highlighted bars
        const indices = selected
          .map((label) => data.findIndex((d) => d.label === label))
          .filter((i) => i !== -1)
          .sort((a, b) => a - b);

        const minIndex = indices[0];
        const maxIndex = indices[indices.length - 1];

        // the max zoom should still ensure all of the highlighted bars are visible
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
      .style("overflow", "visible");

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
        highlightedBars.has(d.label) ? SELECT_COLOUR : DEFAULT_COLOUR,
      )
      .style("opacity", BAR_OPACITY);

    svg
      .selectAll(".label")
      .data(filteredData.filter((d) => highlightedBars.has(d.label)))
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", AXIS_COLOR)
      .each(function (d) {
        const text = `${d.label} - ${d.value}`;
        const barWidth = xScale.bandwidth();
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
  }, [data, filteredData, highlightedBars, zoomScale]);

  // The filters should be reset when the dataset changes
  useEffect(() => {
    setFilteredData(data);
    setHighlightedBars(new Set());
    setZoomScale(1);
  }, [dataset]);

  return <div ref={chartRef} className="w-full h-full" />;
};
