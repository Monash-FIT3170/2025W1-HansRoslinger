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
  LINE_STROKE_WIDTH,
  POINT_RADIUS,
} from './constants';

interface D3LineChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}

export const D3LineChart: React.FC<D3LineChartProps> = ({
  data,
  width,
  height,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const w = width ?? DEFAULT_WIDTH;
  const h = height ?? DEFAULT_HEIGHT;

  const renderChart = () => {
    if (!chartRef.current) return;

    // clear
    d3.select(chartRef.current).selectAll('*').remove();

    // responsive svg
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
      .scalePoint()
      .domain(data.map((d) => d.label))
      .range([MARGIN.left, w - MARGIN.right]);
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

    // axis lines shadow
    svg.selectAll('path, line')
      .attr('stroke', AXIS_COLOR)
      .style('filter', AXIS_LINE_SHADOW);

    // line
    const line = d3
      .line<{ label: string; value: number }>()
      .x((d) => xScale(d.label)!)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', DEFAULT_COLOUR)
      .attr('stroke-width', LINE_STROKE_WIDTH)
      .attr('d', line);

    // points
    svg
      .selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xScale(d.label)!)
      .attr('cy', (d) => yScale(d.value))
      .attr('r', POINT_RADIUS)
      .attr('fill', DEFAULT_COLOUR)
      .on('mouseover', function () {
        d3.select(this).attr('fill', SELECT_COLOUR);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', DEFAULT_COLOUR);
      });
  };

  useEffect(() => {
    renderChart();
    window.addEventListener('resize', renderChart);
    return () => window.removeEventListener('resize', renderChart);
  }, [data, width, height]);

  return <div ref={chartRef} className="w-full h-full" />;
};
