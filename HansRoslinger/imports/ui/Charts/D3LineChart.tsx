import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './LineChart.css';
import { DEFAULT_COLOUR, WIDTH, HEIGHT, SELECT_COLOUR } from './constants';

interface D3LineChartProps {
  data: { label: string; value: number }[];
}

export const D3LineChart: React.FC<D3LineChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      d3.select(chartRef.current).select('svg').remove();

      const margin = { top: 20, right: 20, bottom: 50, left: 50 };

      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('background-color', 'transparent');

      const xScale = d3
        .scalePoint()
        .domain(data.map((d) => d.label))
        .range([margin.left, WIDTH - margin.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) || 100])
        .nice()
        .range([HEIGHT - margin.bottom, margin.top]);

      // Axes
      svg
        .append('g')
        .attr('transform', `translate(0, ${HEIGHT - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

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
        .attr('stroke-width', 2)
        .attr('d', line);

      // Points
      svg
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.label)!)
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 4)
        .attr('fill', DEFAULT_COLOUR)
        .on('mouseover', function () {
          d3.select(this).attr('fill', SELECT_COLOUR);
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', DEFAULT_COLOUR);
        });
    }
  }, [data]);

  return <div ref={chartRef} className="d3-chart-container"></div>;
};
