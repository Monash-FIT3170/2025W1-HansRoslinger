import { Mongo } from "meteor/mongo";

// Define the TypeScript interface representing the structure of an Asset document
export interface Asset {
  // Optional MongoDB document ID (automatically generated)
  _id?: string;

  // Name of the asset
  name: string;

  // Path or identifier for the asset's icon
  icon: string;

  // The ID of the user who owns this asset
  userId: string;
}

// Create a new MongoDB collection for storing Asset documents
export const AssetCollection = new Mongo.Collection<Asset>("assets");

// Define permissions for client-side database operations
AssetCollection.allow({
  // Allow anyone to insert new documents (⚠️ typically restricted in production)
  insert: () => true,

  // Allow anyone to update existing documents
  update: () => true,

  // Allow anyone to delete documents
  remove: () => true,
});

// Asynchronous function to insert a new asset into the collection
// Uses Omit<Asset, "_id"> to ensure the caller does not provide the _id field
export async function insertAsset(asset: Omit<Asset, "_id">) {
  // Insert the asset document asynchronously and return its generated ID
  return await AssetCollection.insertAsync(asset);
}

// Asynchronous function to fetch all assets belonging to a specific user
export async function getAssetsByUser(userId: string) {
  // Find all asset documents with a matching userId and return them as an array
  return await AssetCollection.find({ userId }).fetch();
}
