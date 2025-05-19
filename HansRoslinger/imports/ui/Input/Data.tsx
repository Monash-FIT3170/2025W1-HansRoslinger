import { useState, useEffect } from "react";

// this is probably not the best implementation as it means there are double definitions for the charts we have available
export enum ChartType {
  BAR = "BAR",
  LINE = "LINE",
}

interface DataPoint {
  label: string;
  value: number;
}

// a dataset contains a title, the points, and the preferred chart type when you select it
export interface Dataset {
  title: string;
  data: DataPoint[];
  preferredChartType: ChartType;
}

export function useCurrentDataset() {
  const [_, setCurrentIndex] = useState(0);
  const [currentDataset, setCurrentDataset] = useState(datasets[0]);

  useEffect(() => {
    const handleNextData = () => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % datasets.length;
        setCurrentDataset(datasets[next]);
        return next;
      });
    };

    window.addEventListener('chart:next-data', handleNextData);
    return () => window.removeEventListener('chart:next-data', handleNextData);
  }, []);

  return currentDataset;
}

// Here is where you should define all the datasets you want to show
export const datasets: Dataset[] = [
  {
    title: "Number of sales over March 1st to October 31st 2024",
    preferredChartType: ChartType.BAR,
    data: [
      { label: 'Mar 1', value: 65 },
      { label: 'Mar 2', value: 68 },
      { label: 'Mar 3', value: 70 },
      { label: 'Mar 4', value: 72 },

      { label: 'Apr 1', value: 90 },
      { label: 'Apr 2', value: 110 },
      { label: 'Apr 3', value: 105 },
      { label: 'Apr 4', value: 115 },

      { label: 'May 1', value: 80 },
      { label: 'May 2', value: 78 },
      { label: 'May 3', value: 82 },
      { label: 'May 4', value: 85 },

      { label: 'Jun 1', value: 75 },
      { label: 'Jun 2', value: 80 },
      { label: 'Jun 3', value: 78 },
      { label: 'Jun 4', value: 83 },

      { label: 'Jul 1', value: 70 },
      { label: 'Jul 2', value: 68 },
      { label: 'Jul 3', value: 72 },
      { label: 'Jul 4', value: 74 },

      { label: 'Aug 1', value: 100 },
      { label: 'Aug 2', value: 120 },
      { label: 'Aug 3', value: 115 },
      { label: 'Aug 4', value: 125 },

      { label: 'Sep 1', value: 85 },
      { label: 'Sep 2', value: 80 },
      { label: 'Sep 3', value: 78 },
      { label: 'Sep 4', value: 82 },

      { label: 'Oct 1', value: 70 },
      { label: 'Oct 2', value: 68 },
      { label: 'Oct 3', value: 72 },
      { label: 'Oct 4', value: 74 },
    ]
  },
  {
    title: "Website visitors per week in 2024",
    preferredChartType: ChartType.LINE,
    data: [
      { label: 'Week 1', value: 320 },
      { label: 'Week 2', value: 410 },
      { label: 'Week 3', value: 390 },
      { label: 'Week 4', value: 450 },

      { label: 'Week 5', value: 470 },
      { label: 'Week 6', value: 430 },
      { label: 'Week 7', value: 480 },
      { label: 'Week 8', value: 500 },

      { label: 'Week 9', value: 520 },
      { label: 'Week 10', value: 510 },
      { label: 'Week 11', value: 530 },
      { label: 'Week 12', value: 540 },

      { label: 'Week 13', value: 560 },
      { label: 'Week 14', value: 580 },
      { label: 'Week 15', value: 600 },
      { label: 'Week 16', value: 590 },
    ]
  }
];