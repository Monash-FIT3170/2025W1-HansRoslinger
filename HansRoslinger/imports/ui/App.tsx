import React, { useEffect, useRef, useState  } from 'react';
import Chart from 'chart.js/auto';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1VsxYvl5Ee1wrwzis0pEyqLl7nzE64szQqrag4ZZAt6o/gviz/tq?tqx=out:csv';

async function fetchGoogleSheetData(url: string): Promise<{ labels: string[]; values: number[] }> {
  const res = await fetch(url);
  const csv = await res.text();
  const rows = csv
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '')));

  const labels = rows.slice(1).map(r => r[0]);
  const values = rows.slice(1).map(r => parseFloat(r[1]));

  return { labels, values };
}

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    async function loadChart() {
      if (!canvasRef.current) return;

      const { labels, values } = await fetchGoogleSheetData(SHEET_URL);

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Sheet Data',
              data: [...values],
            },
          ],
        },
        // options: {
        //   onClick: (e, elements) => {
        //     if (!elements.length || !chartRef.current) return;
        //     const index = elements[0].index;
        //     const newData = [...values];
        //     newData[index] = values[index] * 2;
        //     chartRef.current.data.datasets[0].data = newData;
        //     chartRef.current.update();
        //   },
        // },
          options: {
          onClick: (e, elements) => {
            if (!elements.length || !chartRef.current) return;
      
            const index = elements[0].index;
            const bgColors = values.map(() => 'rgba(75, 192, 192, 0.5)');
            bgColors[index] = 'rgba(255, 99, 132, 0.8)';
      
            chartRef.current.data.datasets[0].backgroundColor = bgColors;
            chartRef.current.update();
          },
        },
      });
    }

    loadChart();
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragStart.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => {
    dragStart.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div>
      <h1>Google Sheets Chart</h1>
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: 300,
          height: 200,
          cursor: 'move',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};