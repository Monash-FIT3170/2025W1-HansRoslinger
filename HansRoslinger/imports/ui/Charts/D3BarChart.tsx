import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
  AXIS_LINE_SHADOW,
  BAR_OPACITY,
} from './constants';

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

    const svg = d3.select(chartRef.current).select('svg');
    const bars = svg.selectAll<SVGRectElement, { label: string; value: number }>('rect.bar');

    bars.each(function (d) {
      const bbox = this.getBoundingClientRect();
      if (x >= bbox.left && x <= bbox.right && y >= bbox.top && y <= bbox.bottom) {
        setSelectedBars((prev) => {
          const next = new Set(prev);
          next.has(d.label) ? next.delete(d.label) : next.add(d.label);
          return next;
        });
      }
    });
  };

  const handleClear = () => {
    setSelectedBars(new Set());
    setFilteredData(data);
    setZoomScale(1); // Reset zoom scale to 1
  };

  const handleFilter = () => {
    if (selectedBars.size > 0) {
      setFilteredData(data.filter(d => selectedBars.has(d.label)));
    }
  };

const handleZoom = (event: Event) => {
  const customEvent = event as CustomEvent<{ scaleX: number; scaleY: number }>;
  const { scaleX, scaleY } = customEvent.detail;
  const clampedScaleX = Math.max(0.5, Math.min(1.5, scaleX));
  const clampedScaleY = Math.max(0.1, Math.min(1, scaleY));

  setZoomScale(clampedScaleX);

  if (clampedScaleY < 1) {
    const total = data.length;
    const visible = Math.floor(total * clampedScaleY);
    let start = 0;

    const selected = Array.from(selectedBars);
    if (selected.length > 0) {
      const indices = selected
        .map(label => data.findIndex(d => d.label === label))
        .filter(i => i !== -1);
      const avgIndex = Math.floor(indices.reduce((a, b) => a + b, 0) / indices.length);
      start = Math.max(0, Math.min(total - visible, avgIndex - Math.floor(visible / 2)));
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

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none')
      .style('width', '100%')
      .style('height', '100%')
      .style('background-color', 'transparent');

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
      .append('g')
      .attr('transform', `translate(0, ${height - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', AXIS_COLOR)
      .style('font-size', AXIS_FONT_SIZE)
      .style('text-shadow', AXIS_TEXT_SHADOW);

    svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('fill', AXIS_COLOR)
      .style('font-size', AXIS_FONT_SIZE)
      .style('text-shadow', AXIS_TEXT_SHADOW);

    svg.selectAll('path, line')
      .attr('stroke', AXIS_COLOR)
      .style('filter', AXIS_LINE_SHADOW);

    svg
      .selectAll('.bar')
      .data(filteredData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.label) || 0)
      .attr('y', (d) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - MARGIN.bottom - yScale(d.value))
      .attr('fill', (d) => (selectedBars.has(d.label) ? SELECT_COLOUR : DEFAULT_COLOUR))
      .style('opacity', BAR_OPACITY)
      .on('mouseover', function () {
        d3.select(this).attr('fill', SELECT_COLOUR).style('opacity', 1);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr('fill', selectedBars.has(d.label) ? SELECT_COLOUR : DEFAULT_COLOUR)
          .style('opacity', BAR_OPACITY);
      });

    svg.attr('transform', `scale(${zoomScale})`); // Apply the zoom scale
  };

  useEffect(() => {
    renderChart();
    window.addEventListener('resize', renderChart);
    window.addEventListener('chart:highlight', handleHighlight as EventListener);
    window.addEventListener('chart:clear', handleClear as EventListener);
    window.addEventListener('chart:filter', handleFilter as EventListener);
    window.addEventListener('chart:zoom', handleZoom as EventListener);

    return () => {
      window.removeEventListener('resize', renderChart);
      window.removeEventListener('chart:clear', handleClear as EventListener);
      window.removeEventListener('chart:highlight', handleHighlight as EventListener);
      window.removeEventListener('chart:filter', handleFilter as EventListener);
      window.removeEventListener('chart:zoom', handleZoom as EventListener);
    };
  }, [data, filteredData, selectedBars, zoomScale]);

  return <div ref={chartRef} className="w-full h-full" />;
};
