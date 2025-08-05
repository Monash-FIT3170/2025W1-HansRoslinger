import { useState, useEffect } from "react";
import { Dataset, getDatasetsByPresentationId } from "/imports/api/database/dataset/dataset";

// Async function to fetch all datasets for a presentation
export async function fetchDatasetsForPresentation(presentationId: string): Promise<Dataset[]> {
  return getDatasetsByPresentationId(presentationId);
}

export function useDatasetNavigation(datasets: Dataset[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentDataset = datasets.length > 0 ? datasets[currentIndex] : undefined;

  useEffect(() => {
    setCurrentIndex(0); // Reset to first dataset if datasets change
  }, [datasets]);

  useEffect(() => {
    const handleNextData = () => {
      setCurrentIndex((prev) => {
        if (datasets.length === 0) return 0;
        return (prev + 1) % datasets.length;
      });
    };
    window.addEventListener("chart:next-data", handleNextData);
    return () => window.removeEventListener("chart:next-data", handleNextData);
  }, [datasets]);

  return { currentDataset, currentIndex, setCurrentIndex };
}
