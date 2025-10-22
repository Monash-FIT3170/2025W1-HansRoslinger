import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DEFAULT_COLOUR, SELECT_COLOUR, MARGIN, AXIS_COLOR, AXIS_FONT_SIZE, AXIS_TEXT_SHADOW, AXIS_LINE_SHADOW, LINE_STROKE_WIDTH, POINT_RADIUS } from "./constants";
import { Dataset } from "../../api/database/dataset/dataset";

interface D3LineChartProps {
  dataset: Dataset;
}

export const D3LineChart: React.FC<D3LineChartProps> = ({ dataset }) => {
  const data = dataset.data;
  const chartRef = useRef<HTMLDivElement>(null);
  const [filteredData, setFilteredData] = useState(data);
  const [highlightedDots, setHighlightedDots] = useState<Set<string>>(new Set());
  const [zoomScale, setZoomScale] = useState(1);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const hoverClearTimeout = useRef<number | null>(null);

  // Transient hover highlight while finger is near a dot
  const handleHover = (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = customEvent.detail;
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");
    const circles = svg.selectAll<SVGCircleElement, { label: string; value: number }>("circle");

    // Get the position of all dots
    const positions = [] as {
      cx: number;
      cy: number;
      d: { label: string; value: number };
      node: SVGCircleElement;
    }[];

    circles.each(function (d) {
      const bbox = this.getBoundingClientRect();
      positions.push({
        cx: bbox.left + bbox.width / 2,
        cy: bbox.top + bbox.height / 2,
        d,
        node: this,
      });
    });

    // it will only highlight one dot at a time, so this finds the closest dot to the gestures position
    let minDist = Infinity;
    let closest = null as (typeof positions)[0] | null;
    for (const pos of positions) {
      const dist = Math.hypot(pos.cx - x, pos.cy - y); //sqrt((pos.cs - x)^2 + (pos.cy - y)^2)
      if (dist < minDist) {
        minDist = dist;
        closest = pos;
      }
    }

    // for hover, just set hoverLabel if within radius, and clear soon after if not
    if (closest && minDist <= 40) {
      setHoverLabel(closest.d.label);
      if (hoverClearTimeout.current) window.clearTimeout(hoverClearTimeout.current);
      hoverClearTimeout.current = window.setTimeout(() => setHoverLabel(null), 120);
    } else {
      setHoverLabel(null);
    }
  };

  // Permanent highlight after dwell: add the closest dot within 40px
  const handleHighlight = (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = customEvent.detail;
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current).select("svg");
    const circles = svg.selectAll<SVGCircleElement, { label: string; value: number }>("circle");

    let minDist = Infinity;
    let target: { label: string; value: number } | null = null;
    circles.each(function (d) {
      const bbox = this.getBoundingClientRect();
      const cx = bbox.left + bbox.width / 2;
      const cy = bbox.top + bbox.height / 2;
      const dist = Math.hypot(cx - x, cy - y);
      if (dist < minDist) {
        minDist = dist;
        target = d;
      }
    });

    if (target && minDist <= 40) {
      setHighlightedDots((prev) => {
        const next = new Set(prev);
        if (next.has(target!.label)) {
          next.delete(target!.label);
        } else {
          next.add(target!.label);
        }
        return next;
      });
    }
  };

  // this handles clearing filters which are applied to the line chart
  const handleClear = () => {
    // it should always clear the filters applied first
    const isFiltered = filteredData.length !== data.length;

    if (isFiltered) {
      setFilteredData(data);
      setZoomScale(1);
      // otherwise it will clear the highlighted dots next
    } else if (highlightedDots.size > 0) {
      setHighlightedDots(new Set());
    }
  };

  const handleFilter = () => {
    if (highlightedDots.size > 0) {
      setFilteredData(data.filter((d) => highlightedDots.has(d.label)));
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
    const clampedScaleX = Math.max(0.5, Math.min(1.5, Math.min(scaleX, maxAllowedScale)));
    // the user can at most show 10% of the graph of 100% of the graph
    const clampedScaleY = Math.max(0.1, Math.min(1, scaleY));

    setZoomScale(clampedScaleX);

    // this logic is making sure that when you zoom in, it will focus around the centre of all the bars you have highlighted
    if (clampedScaleY < 1) {
      const total = data.length;
      let visible = Math.floor(total * clampedScaleY);
      let start = 0;

      const selected = Array.from(highlightedDots);
      if (selected.length > 0) {
        // get the index positions of all the highlighted bars
        const indices = selected
          .map((label) => data.findIndex((d) => d.label === label))
          .filter((i) => i !== -1)
          .sort((a, b) => a - b);

        const minIndex = indices[0];
        const maxIndex = indices[indices.length - 1];
        const avgIndex = Math.round(indices.reduce((a, b) => a + b, 0) / indices.length);

        visible = Math.max(visible, maxIndex - minIndex + 1);
        start = Math.max(0, Math.min(total - visible, avgIndex - Math.floor(visible / 2)));

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
  const renderChart = (customData = filteredData) => {
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
      .scalePoint()
      .domain(customData.map((d) => d.label))
      .range([width * 0.05, width * 0.95]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(customData, (d) => d.value) || 100])
      .nice()
      .range([height - MARGIN.bottom, MARGIN.top]);

    const originalCount = data.length;
    const currentCount = customData.length;
    const fontScale = originalCount > 0 ? originalCount / currentCount : 1;
    const axisFontSize = `${AXIS_FONT_SIZE}`;

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", AXIS_COLOR)
      .style("font-size", axisFontSize)
      .style("text-shadow", AXIS_TEXT_SHADOW);

    svg
      .append("g")
      .attr("transform", `translate(${width * 0.05}, 0)`)
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", AXIS_COLOR)
      .style("font-size", axisFontSize)
      .style("text-shadow", AXIS_TEXT_SHADOW);

    svg.selectAll("path, line").attr("stroke", AXIS_COLOR).style("filter", AXIS_LINE_SHADOW);

    const line = d3
      .line<{ label: string; value: number }>()
      .x((d) => xScale(d.label)!)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append("path").datum(customData).attr("fill", "none").attr("stroke", DEFAULT_COLOUR).attr("stroke-width", LINE_STROKE_WIDTH).attr("d", line);

    // Draw dots
    svg
      .selectAll(".dot")
      .data(customData)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.label)!)
      .attr("cy", (d) => yScale(d.value))
      .attr("r", POINT_RADIUS * fontScale)
      .attr("fill", (d) => (highlightedDots.has(d.label) ? SELECT_COLOUR : hoverLabel === d.label ? SELECT_COLOUR : DEFAULT_COLOUR))
      .on("mouseover", function () {
        d3.select(this).attr("fill", SELECT_COLOUR);
      })
      .on("mouseout", function (_evt, d) {
        d3.select(this).attr("fill", highlightedDots.has(d.label) ? SELECT_COLOUR : DEFAULT_COLOUR);
      });

    // Draw labels for selected dots
    svg
      .selectAll(".dot-label")
      .data(customData.filter((d) => highlightedDots.has(d.label)))
      .join("text")
      .attr("class", "dot-label")
      .attr("x", (d) => xScale(d.label)!)
      .attr("y", (d) => yScale(d.value) - POINT_RADIUS * fontScale - 8)
      .attr("text-anchor", "middle")
      .attr("fill", AXIS_COLOR)
      .style("font-size", `calc(16px * ${fontScale})`)
      .style("font-weight", "bold")
      .style("text-shadow", AXIS_TEXT_SHADOW)
      .text((d) => `${d.label} ${d.value}`);

    svg.attr("transform", `scale(${zoomScale})`);
  };

  useEffect(() => {
    renderChart();
    window.addEventListener("resize", () => renderChart());
    window.addEventListener("chart:hover", handleHover as EventListener);
    window.addEventListener("chart:highlight", handleHighlight as EventListener);
    window.addEventListener("chart:clear", handleClear as EventListener);
    window.addEventListener("chart:zoom", handleZoom as EventListener);
    window.addEventListener("chart:filter", handleFilter as EventListener);

    return () => {
      window.removeEventListener("resize", () => renderChart());
      window.removeEventListener("chart:hover", handleHover as EventListener);
      window.removeEventListener("chart:highlight", handleHighlight as EventListener);
      window.removeEventListener("chart:clear", handleClear as EventListener);
      window.removeEventListener("chart:zoom", handleZoom as EventListener);
      window.removeEventListener("chart:filter", handleFilter as EventListener);
    };
  }, [filteredData, data, highlightedDots, hoverLabel, zoomScale]);

  // The filters should be reset when the dataset changes
  useEffect(() => {
    setFilteredData(data);
    setHighlightedDots(new Set());
    setZoomScale(1);
  }, [dataset]);

  return <div ref={chartRef} className="w-full h-full" />;
};
