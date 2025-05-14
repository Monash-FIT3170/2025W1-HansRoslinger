import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  WIDTH,
  HEIGHT,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
  AXIS_LINE_SHADOW,
  BAR_OPACITY,
} from './constants';

interface Datum {
  label: string;
  value: number;
}

interface D3BarChartProps {
  data: Datum[];
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [viewData, setViewData] = useState<Datum[]>(data);

  useEffect(() => {
    setViewData(data);
    setSelectedLabel(null);
  }, [data]);

  const renderChart = () => {
    if (!chartRef.current) return;

    const { width, height } = chartRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    d3.select(chartRef.current).selectAll('*').remove();

    // Responsive SVG
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none')
      .style('width', '100%')
      .style('height', '100%')
      .style('background-color', 'transparent');

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(viewData.map((d) => d.label))
      .range([width * 0.05, width * 0.95])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(viewData, (d) => d.value) || 100])
      .nice()
      .range([height - MARGIN.bottom, MARGIN.top]);

    // Axes
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
      .attr('transform', `translate(${width * 0.05}, 0)`)
      .selectAll('text')
      .attr('fill', AXIS_COLOR)
      .style('font-size', AXIS_FONT_SIZE)
      .style('text-shadow', AXIS_TEXT_SHADOW);

    svg.selectAll('path, line')
      .attr('stroke', AXIS_COLOR)
      .style('filter', AXIS_LINE_SHADOW);

    // bars
    svg
      .selectAll('.bar')
      .data(viewData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.label)!)
      .attr('y', (d) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - MARGIN.bottom - yScale(d.value))
      .attr('fill', (d) => (d.label === selectedLabel ? SELECT_COLOUR : DEFAULT_COLOUR))
      .style('cursor', 'pointer')
      /* Hover */
      .on('mouseover', function () {
        d3.select(this).attr('fill', SELECT_COLOUR);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', d.label === selectedLabel ? SELECT_COLOUR : DEFAULT_COLOUR);
      })
      /* Click */
      .on('click', (event, d) => {
        // Toggle highlight
        setSelectedLabel((prev) => (prev === d.label ? null : d.label));

        // Zoom to ±2 around the clicked bar
        const centre = data.findIndex((r) => r.label === d.label);
        const start = Math.max(centre - 2, 0);
        const end = Math.min(centre + 3, data.length);
        setViewData(data.slice(start, end));
      });
  };

  useEffect(() => {
    renderChart();
    window.addEventListener('resize', renderChart);
    return () => window.removeEventListener('resize', renderChart);
  }, [viewData, selectedLabel]);

  return <div ref={chartRef} className="w-full h-full" />;
};
