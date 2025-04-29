import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './BarChart.css';
import { DEFAULT_COLOUR, SELECT_COLOUR, WIDTH, HEIGHT } from './constants'; // Import constants

interface D3BarChartProps {
  data: { label: string; value: number }[];
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Clear any existing chart
      d3.select(chartRef.current).select('svg').remove();

      const margin = { top: 20, right: 20, bottom: 50, left: 50 };

      // Create SVG container
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('background-color', 'transparent');

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([margin.left, WIDTH - margin.right])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 100])
        .nice()
        .range([HEIGHT - margin.bottom, margin.top]);

      // This moves the axes to the bottom left of the chart
      svg
        .append('g')
        .attr('transform', `translate(0, ${HEIGHT - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

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
        .attr('height', (d) => HEIGHT - margin.bottom - yScale(d.value))
        .attr('fill', DEFAULT_COLOUR) // Use default color
        .on('mouseover', function () {
          d3.select(this).attr('fill', SELECT_COLOUR); // this is just for showing colours at the moment, will have to be changed for gesture input
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', DEFAULT_COLOUR);
        });
    }
  }, [data]);

  return <div ref={chartRef} className="d3-chart-container"></div>;
};