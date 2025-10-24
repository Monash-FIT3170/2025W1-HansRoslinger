import { Mongo } from "meteor/mongo";

// Define the structure of an image document
export interface ImageDoc {
  // Optional MongoDB document ID (auto-generated)
  _id?: string;

  // Name of the image file
  fileName: string;

  // URL where the image is stored or accessible
  url: string;

  // ID of the asset that this image belongs to
  assetId: string;

  // Optional ordering number for sorting images within an asset
  order?: number;
}

// Create a MongoDB collection for storing image documents
export const ImageCollection = new Mongo.Collection<ImageDoc>("images");

// Define basic permissions for database operations
ImageCollection.allow({
  // Allow insertion of new image documents (⚠️ unrestricted, use secure rules in production)
  insert: () => true,

  // Allow updates to existing image documents
  update: () => true,

  // Allow removal of image documents
  remove: () => true,
});

// Insert a new image document asynchronously
export async function insertImage(image: Omit<ImageDoc, "_id">) {
  // Insert the image and return the newly created document ID
  return await ImageCollection.insertAsync(image);
}

// Retrieve all images belonging to a specific asset
export async function getImagesByAsset(assetId: string) {
  // Find and return all image documents that match the provided assetId
  return await ImageCollection.find({ assetId }).fetch();
}

// Count the total number of images associated with a given asset
export async function countImagesByAsset(assetId: string) {
  // Return the number of matching image documents
  return await ImageCollection.find({ assetId }).count();
}
