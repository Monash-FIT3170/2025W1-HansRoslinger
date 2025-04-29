import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import * as d3 from 'd3';
import './BarChart.css';
import { DEFAULT_COLOUR, SELECT_COLOUR, WIDTH, HEIGHT } from './constants'; // Import constants

interface D3BarChartProps {
  data: { label: string; value: number }[];
}

export interface D3BarChartHandle {
  resetXDomain: () => void;
}

interface D3BarChartProps {
  data : { label: string; value: number }[];
}

export const D3BarChart: React.FC<D3BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const updateXDomainRef = useRef<(centerIndex: number) => void>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
      // Clear any existing chart
      // d3.select(chartRef.current).select('svg').remove();

      const margin = { top: 20, right: 20, bottom: 50, left: 50 };

      // Create SVG container
      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .style('background-color', 'transparent');

        
      const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .nice()
      .range([HEIGHT - margin.bottom, margin.top]);
        
      svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));
      
      const drawChart = (subset: {label: string; value: number } []) => {
        
        const xScale = d3
          .scaleBand()
          .domain(subset.map(d => d.label))
          .range([margin.left, WIDTH - margin.right])
          .padding(0.1);
          
          svg.selectAll('.x-axis').remove() // remove previous axis
          svg.selectAll('.bar').remove();
          svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0, ${HEIGHT - margin.bottom})`)
          .call(d3.axisBottom(xScale));
        
          const bars = svg.selectAll<SVGRectElement, typeof subset[0]>('.bar')
          .data(subset, d =>d.label);

          bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(bars as any)
            .attr('x', d => xScale(d.label) || 0)
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => HEIGHT - margin.bottom - yScale(d.value))
            .attr('fill', DEFAULT_COLOUR)
            .attr('fill', (_, i) =>
              i === selectedIndex ? SELECT_COLOUR : DEFAULT_COLOUR
            )
            .on('mouseover', function () {
              d3.select(this).attr('fill', SELECT_COLOUR);
            })
            .on('mouseout', function () {
              d3.select(this).attr('fill', DEFAULT_COLOUR);
            })
            .on('click', function(event, d) {
              const index = data.findIndex(item => item.label === d.label);
              if (index !== -1 && updateXDomainRef.current) {
                updateXDomainRef.current(index);
              }
              const idx = d3.selectAll<SVGRectElement, unknown>('.bar')
                          .nodes()
                          .indexOf(this);

              setSelectedIndex(idx === selectedIndex ? null : idx);
            });

          bars.exit().remove();
        };
        const updateXDomain = (centerIndex: number) => {
          const start = Math.max(centerIndex - 2, 0);
          const end = Math.min(centerIndex + 3, data.length);
          const sliced = data.slice(start, end);
          drawChart(sliced)
        }
        
        updateXDomainRef.current = updateXDomain
        
        drawChart(data);

      return () => {
        d3.select(chartRef.current).select('svg').remove();
      };
      }, [data, selectedIndex]);
  


  return <div ref={chartRef} className="d3-chart-container"></div>;
};