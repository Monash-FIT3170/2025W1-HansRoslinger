import React, { useEffect, useRef } from 'react';
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
  LINE_STROKE_WIDTH,
  POINT_RADIUS,
} from './constants';

interface D3LineChartProps {
  data: { label: string; value: number }[];
}

export const D3LineChart: React.FC<D3LineChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const renderChart = () => {
    if (chartRef.current) {
      // Clear any existing chart
      d3.select(chartRef.current).select('svg').remove();

      // Create SVG container
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('background-color', 'transparent');

      const xScale = d3
        .scalePoint()
        .domain(data.map((d) => d.label))
        .range([MARGIN.left, WIDTH - MARGIN.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 100])
        .nice()
        .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

      // Add axes
      svg
        .append('g')
        .attr('transform', `translate(0, ${HEIGHT - MARGIN.bottom})`)
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

      // Add thicker shadow to axis lines
      svg.selectAll('path, line')
        .attr('stroke', AXIS_COLOR)
        .style('filter', AXIS_LINE_SHADOW);

      // Line path
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

      // Points
      svg
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
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
    }
  };

  useEffect(() => {
    // Initial render
    renderChart();

    // Re-render on window resize
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  return (
    <div className="flex justify-center items-center w-full h-auto">
      <div ref={chartRef} className="d3-chart-container"></div>
    </div>
  );
};