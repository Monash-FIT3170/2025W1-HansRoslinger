import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './BarChart.css';
import { DEFAULT_COLOUR, SELECT_COLOUR, WIDTH, HEIGHT } from './constants';

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


  useEffect(() => {
    if (!chartRef.current) return;
    d3.select(chartRef.current)
      .selectAll<SVGRectElement, Datum>('rect.bar')
      .attr('fill', d => (d.label === selectedLabel ? SELECT_COLOUR : DEFAULT_COLOUR));
  }, [selectedLabel]);

  
  useEffect(() => {
    if (!chartRef.current) return;

    
    d3.select(chartRef.current).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .style('background', 'transparent');

    /* scales */
    const x = d3
      .scaleBand<string>()
      .domain(viewData.map(d => d.label))
      .range([margin.left, WIDTH - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(viewData, d => d.value) ?? 0])
      .nice()
      .range([HEIGHT - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('transform', `translate(0,${HEIGHT - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`) // y‑axis
      .call(d3.axisLeft(y));


    svg
      .selectAll<SVGRectElement, Datum>('rect.bar')
      .data(viewData, (d: any) => (d as Datum).label) // key = label
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => HEIGHT - margin.bottom - y(d.value))
      .attr('fill', d => (d.label === selectedLabel ? SELECT_COLOUR : DEFAULT_COLOUR))
      .style('cursor', 'pointer')
      /* hover */
      .on('mouseover', function (event: MouseEvent) {
        d3.select(this).attr('fill', SELECT_COLOUR);
      })
      .on('mouseout', function (event: MouseEvent, d: Datum) {
        d3.select(this).attr('fill', d.label === selectedLabel ? SELECT_COLOUR : DEFAULT_COLOUR);
      })
      /* click */
      .on('click', (event: MouseEvent, d: Datum) => {
        /* toggle highlight */
        setSelectedLabel(prev => (prev === d.label ? null : d.label));

        /* zoom to ±2 around the clicked bar */
        const centre = data.findIndex(r => r.label === d.label);
        const start = Math.max(centre - 2, 0);
        const end = Math.min(centre + 3, data.length);
        setViewData(data.slice(start, end));
      });
  }, [viewData, selectedLabel, data]);

  return <div ref={chartRef} className="d3-chart-container" />;
};
