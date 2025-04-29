import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  DEFAULT_COLOUR,
  SELECT_COLOUR,
  MARGIN,
  AXIS_COLOR,
  AXIS_FONT_SIZE,
  AXIS_TEXT_SHADOW,
  AXIS_LINE_SHADOW,
} from './constants';

interface D3BarChartProps {
  data: { label: string; value: number }[];
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const renderChart = () => {
    if (chartRef.current) {
      // Clear any existing chart
      d3.select(chartRef.current).select('svg').remove();

      // Get container dimensions
      const containerWidth = chartRef.current.offsetWidth;
      const containerHeight = chartRef.current.offsetHeight || 400; // Default height if not set

      const width = containerWidth - MARGIN.left - MARGIN.right;
      const height = containerHeight - MARGIN.top - MARGIN.bottom;

      // Create SVG container
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .style('background-color', 'transparent');

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([MARGIN.left, width + MARGIN.left])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 100])
        .nice()
        .range([height + MARGIN.top, MARGIN.top]);

      // Add axes
      svg
        .append('g')
        .attr('transform', `translate(0, ${height + MARGIN.top})`)
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

      // Add bars
      svg
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.label) || 0)
        .attr('y', (d) => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height + MARGIN.top - yScale(d.value))
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

  return <div ref={chartRef} className="d3-chart-container w-full h-96"></div>;
};