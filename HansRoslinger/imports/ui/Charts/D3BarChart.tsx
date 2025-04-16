import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './BarChart.css';

interface D3BarChartProps {
  data: { label: string; value: number }[];
  width: number;
  height: number;
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ data, width, height }) => {
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
        .attr('width', width)
        .attr('height', height);

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 100])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Add axes
      svg
        .append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
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
        .attr('height', (d) => height - margin.bottom - yScale(d.value))
        .attr('fill', (d, i) => ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][i % 4]); // Vivid colors
    }
  }, [data, width, height]);

  return <div ref={chartRef} className="d3-chart-container"></div>;
};