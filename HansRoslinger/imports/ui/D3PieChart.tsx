// D3PieChart.tsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DEFAULT_COLOUR, SELECT_COLOUR, MARGIN, AXIS_COLOR, AXIS_FONT_SIZE, AXIS_TEXT_SHADOW, AXIS_LINE_SHADOW } from "./constants";
import { Dataset } from "../../api/database/dataset/dataset";

interface D3PieChartProps {
  dataset: Dataset; // expects dataset.data: { label: string; value: number }[]
  asDonut?: boolean; // optional: renders with inner radius if true
  donutRatio?: number; // 0..0.9 fraction of outer radius
}

export const D3PieChart: React.FC<D3PieChartProps> = ({ dataset, asDonut = true, donutRatio = 0.6 }) => {
  const data = dataset.data;
  const chartRef = useRef<HTMLDivElement>(null);

  const [filteredData, setFilteredData] = useState(data);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [zoomScale, setZoomScale] = useState(1);

  // --- Event handlers (mirror your line chart) ---
  const handleHighlight = (event: Event) => {
    const custom = event as CustomEvent<{ x: number; y: number }>;
    const { x, y } = custom.detail;
    if (!chartRef.current) return;

    // use bbox centers of arc paths as "centroids" in screen space
    const svg = d3.select(chartRef.current).select("svg");
    const arcPaths = svg.selectAll<SVGPathElement, any>("path.slice");

    const positions: {
      cx: number;
      cy: number;
      d: { label: string; value: number };
      node: SVGPathElement;
    }[] = [];

    arcPaths.each(function (d: any) {
      const bbox = this.getBoundingClientRect();
      positions.push({
        cx: bbox.left + bbox.width / 2,
        cy: bbox.top + bbox.height / 2,
        d: d.data,
        node: this,
      });
    });

    let minDist = Infinity;
    let closest: (typeof positions)[0] | null = null;
    for (const pos of positions) {
      const dist = Math.hypot(pos.cx - x, pos.cy - y);
      if (dist < minDist) {
        minDist = dist;
        closest = pos;
      }
    }

    if (closest && minDist <= 40) {
      setHighlighted((prev) => {
        const next = new Set(prev);
        if (next.has(closest!.d.label)) next.delete(closest!.d.label);
        else next.add(closest!.d.label);
        return next;
      });
    }
  };

  const handleClear = () => {
    const isFiltered = filteredData.length !== data.length;
    if (isFiltered) {
      setFilteredData(data);
      setZoomScale(1);
    } else if (highlighted.size > 0) {
      setHighlighted(new Set());
    }
  };

  const handleFilter = () => {
    if (highlighted.size > 0) {
      setFilteredData(data.filter((d) => highlighted.has(d.label)));
    }
  };

  const handleZoom = (event: Event) => {
    const custom = event as CustomEvent<{ scaleX: number; scaleY: number }>;
    const { scaleX, scaleY } = custom.detail;

    const chartWidth = chartRef.current?.getBoundingClientRect().width || 1;
    const windowWidth = window.innerWidth;
    const maxAllowedScale = (0.95 * windowWidth) / chartWidth;

    const clampedScaleX = Math.max(0.5, Math.min(1.5, Math.min(scaleX, maxAllowedScale)));
    const clampedScaleY = Math.max(0.1, Math.min(1, scaleY));

    setZoomScale(clampedScaleX);

    // For clampedScaleY < 1, show a subset of slices.
    if (clampedScaleY < 1) {
      const total = data.length;
      let visible = Math.max(1, Math.floor(total * clampedScaleY));
      let start = 0;

      const selected = Array.from(highlighted);
      if (selected.length > 0) {
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

    // Title style parity with axis constants (optional)
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", MARGIN.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", AXIS_COLOR)
      .style("font-size", `${AXIS_FONT_SIZE}`)
      .style("font-weight", "bold")
      .style("text-shadow", AXIS_TEXT_SHADOW)
      .text(dataset.name ?? "Pie Chart");

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(10, Math.min(width - MARGIN.left - MARGIN.right, height - MARGIN.top - MARGIN.bottom) / 2);

    const innerR = asDonut ? Math.max(0, Math.min(radius * donutRatio, radius * 0.9)) : 0;

    // Scales & layout
    const values = customData.map((d) => Math.max(0, Number(d.value) || 0));
    const total = d3.sum(values);
    const pieGen = d3
      .pie<{ label: string; value: number }>()
      .sort(null)
      .value((d) => Math.max(0, Number(d.value) || 0));

    const arcs = pieGen(customData);

    const arcGen = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>().innerRadius(innerR).outerRadius(radius);

    // Colour mapping (derive palette; highlighted uses SELECT_COLOUR)
    const color = (i: number) => d3.interpolateRainbow((i / Math.max(customData.length, 1)) % 1);

    // Group for chart, apply zoom scale like the line chart
    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy}) scale(${zoomScale})`);

    // Axis-line shadow parity: apply to slices via filter style
    g.style("filter", AXIS_LINE_SHADOW);

    // Draw slices
    g.selectAll("path.slice")
      .data(arcs)
      .join("path")
      .attr("class", "slice")
      .attr("d", arcGen as any)
      .attr("fill", (d, i) => (highlighted.has(d.data.label) ? SELECT_COLOUR : color(i)))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", SELECT_COLOUR);
      })
      .on("mouseout", function (event, d: any) {
        const i = (arcs as any as any[]).indexOf(d);
        d3.select(this).attr("fill", highlighted.has(d.data.label) ? SELECT_COLOUR : color(i));
      });

    // Labels (only for highlighted slices to reduce clutter)
    const labelArc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(innerR > 0 ? innerR + (radius - innerR) * 0.5 : radius * 0.67)
      .outerRadius(radius * 0.98);

    g.selectAll("text.slice-label")
      .data(arcs.filter((a) => highlighted.has(a.data.label)))
      .join("text")
      .attr("class", "slice-label")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", AXIS_COLOR)
      .style("font-size", `${AXIS_FONT_SIZE}`)
      .style("font-weight", "bold")
      .style("text-shadow", AXIS_TEXT_SHADOW)
      .text((d) => {
        const v = Number(d.data.value) || 0;
        const pct = total > 0 ? ((v / total) * 100).toFixed(2) : "0.00";
        return `${d.data.label} ${v} (${pct}%)`;
      });
  };

  useEffect(() => {
    renderChart();
    const onResize = () => renderChart();
    window.addEventListener("resize", onResize);
    window.addEventListener("chart:highlight", handleHighlight as EventListener);
    window.addEventListener("chart:clear", handleClear as EventListener);
    window.addEventListener("chart:zoom", handleZoom as EventListener);
    window.addEventListener("chart:filter", handleFilter as EventListener);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("chart:highlight", handleHighlight as EventListener);
      window.removeEventListener("chart:clear", handleClear as EventListener);
      window.removeEventListener("chart:zoom", handleZoom as EventListener);
      window.removeEventListener("chart:filter", handleFilter as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, data, highlighted, zoomScale, asDonut, donutRatio]);

  // Reset filters when dataset changes
  useEffect(() => {
    setFilteredData(data);
    setHighlighted(new Set());
    setZoomScale(1);
  }, [dataset]);

  return <div ref={chartRef} className="w-full h-full" />;
};
