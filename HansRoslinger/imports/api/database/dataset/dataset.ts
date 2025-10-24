import { Mongo } from "meteor/mongo";

// DataPoint interface
export interface DataPoint {
  // Label for the data point (e.g., category name)
  label: string;

  // Numerical value associated with the label
  value: number;
}

// ChartType enum (import if you want to share with presentations)
export enum ChartType {
  // Bar chart type
  BAR = "BAR",

  // Line chart type
  LINE = "LINE",

  // Pie chart type
  PIE = "PIE", // 🚨 Added PIE chart type
}

// Dataset interface
export interface Dataset {
  // Optional unique identifier for the dataset (MongoDB _id)
  _id?: string;

  // Title or name of the dataset
  title: string;

  // Array of data points (label-value pairs)
  data: DataPoint[];

  // Preferred chart type for visualizing this dataset
  preferredChartType: ChartType;

  // ID of the presentation that this dataset belongs to
  presentationID: string;
}

// Default dataset template
export const defaultDataset: Dataset = {
  // Default _id (empty string to indicate not yet saved)
  _id: "",

  // Default empty title
  title: "",

  // Default empty data array
  data: [],

  // Default chart type set to BAR
  preferredChartType: ChartType.BAR,

  // Default empty presentation ID
  presentationID: "",
};

// Create a MongoDB collection for storing Dataset documents
export const DatasetCollection = new Mongo.Collection<Dataset>("datasets");

// Define client-side database permissions
DatasetCollection.allow({
  // Allow anyone to insert new documents (⚠️ not secure for production)
  insert: () => true,

  // Allow anyone to update existing documents
  update: () => true,

  // Allow anyone to remove documents
  remove: () => true,
});

// Insert a new dataset document asynchronously
export async function createDataset(dataset: Dataset): Promise<string> {
  // Insert and return the generated document ID
  return await DatasetCollection.insertAsync(dataset);
}

// Retrieve a single dataset by its unique ID
export async function getDatasetById(id: string): Promise<Dataset | undefined> {
  // Fetch one dataset document matching the provided ID
  return await DatasetCollection.findOneAsync({ _id: id });
}

// Update a dataset with partial fields
export async function updateDataset(id: string, updates: Partial<Dataset>): Promise<number> {
  // Apply updates using MongoDB’s $set operator
  return await DatasetCollection.updateAsync({ _id: id }, { $set: updates });
}

// Delete a dataset by its ID
export async function deleteDataset(id: string): Promise<number> {
  // Remove the dataset document with the given ID
  return await DatasetCollection.removeAsync({ _id: id });
}

// Check if a dataset exists with the given title
export async function doesDatasetExist(title: string): Promise<boolean> {
  // Find a dataset document matching the title
  const dataset = await DatasetCollection.findOneAsync({ title });

  // Return true if found, false otherwise
  return !!dataset;
}

// Retrieve all datasets that share a given title
export async function getDatasetsByTitle(title: string): Promise<Dataset[]> {
  // Find and return all matching documents as an array
  return DatasetCollection.find({ title }).fetch();
}

// Retrieve all datasets linked to a specific presentation
export async function getDatasetsByPresentationId(presentationID: string): Promise<Dataset[]> {
  // Find and return all dataset documents with the matching presentation ID
  return DatasetCollection.find({ presentationID }).fetch();
}
