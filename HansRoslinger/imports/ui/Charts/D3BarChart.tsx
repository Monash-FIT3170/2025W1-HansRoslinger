import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  WIDTH as DEFAULT_WIDTH,
  HEIGHT as DEFAULT_HEIGHT,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
  AXIS_LINE_SHADOW,
  BAR_OPACITY,
} from './constants';

interface D3BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}

export const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  width,
  height,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const w = width ?? DEFAULT_WIDTH;
  const h = height ?? DEFAULT_HEIGHT;

  const renderChart = () => {
    if (!chartRef.current) return;
    // clear previous
    d3.select(chartRef.current).selectAll('*').remove();

    // responsive SVG
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${w} ${h}`)
      .attr('preserveAspectRatio', 'none')
      .style('width', '100%')
      .style('height', '100%')
      .style('background-color', 'transparent');

    // scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([MARGIN.left, w - MARGIN.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .nice()
      .range([h - MARGIN.bottom, MARGIN.top]);

    // axes
    svg
      .append('g')
      .attr('transform', `translate(0, ${h - MARGIN.bottom})`)
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

    // bars
    svg
      .selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.label) || 0)
      .attr('y', (d) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => h - MARGIN.bottom - yScale(d.value))
      .attr('fill', DEFAULT_COLOUR)
      .style('opacity', BAR_OPACITY)
      .on('mouseover', function () {
        d3.select(this).attr('fill', SELECT_COLOUR).style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', DEFAULT_COLOUR).style('opacity', BAR_OPACITY);
      });
  };

  useEffect(() => {
    renderChart();
    window.addEventListener('resize', renderChart);
    return () => window.removeEventListener('resize', renderChart);
  }, [data, width, height]);

  return <div ref={chartRef} className="w-full h-full" />;
};
