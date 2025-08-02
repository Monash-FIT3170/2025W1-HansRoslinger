import { Mongo } from "meteor/mongo";

// DataPoint interface
export interface DataPoint {
  label: string;
  value: number;
}

// ChartType enum (import if you want to share with presentations)
export enum ChartType {
  BAR = "BAR",
  LINE = "LINE",
}

// Dataset interface
export interface Dataset {
  _id?: string;
  title: string;
  data: DataPoint[];
  preferredChartType: ChartType;
  presentationID: string
}

export const DatasetCollection = new Mongo.Collection<Dataset>("datasets");
DatasetCollection.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});


export async function createDataset(dataset: Dataset): Promise<string> {
  return await DatasetCollection.insertAsync(dataset);
}

export async function getDatasetById(id: string): Promise<Dataset | undefined> {
  return await DatasetCollection.findOneAsync({ _id: id });
}

export async function updateDataset(
  id: string,
  updates: Partial<Dataset>,
): Promise<number> {
  return await DatasetCollection.updateAsync({ _id: id }, { $set: updates });
}

export async function deleteDataset(id: string): Promise<number> {
  return await DatasetCollection.removeAsync({ _id: id });
}

export async function doesDatasetExist(title: string): Promise<boolean> {
  const dataset = await DatasetCollection.findOneAsync({ title });
  return !!dataset;
}

export async function getDatasetsByTitle(title: string): Promise<Dataset[]> {
  return DatasetCollection.find({ title }).fetch();
}

export async function getDatasetsByPresentationId(presentationID: string): Promise<Dataset[]> {
  return DatasetCollection.find({ presentationID }).fetch();
}