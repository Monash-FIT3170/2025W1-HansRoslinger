import { Mongo } from "meteor/mongo";

// Define the structure of a Presentation document
export interface Presentation {
  // Optional MongoDB document ID (auto-generated)
  _id?: string;

  // Name or title of the presentation
  name: string;

  // Date and time when the presentation was created
  createdAt: Date;

  // ID of the user who created this presentation
  userID: string;

  // ID of the associated asset for this presentation
  assetID: string;
}

// Create a MongoDB collection for storing Presentation documents
export const PresentationCollection = new Mongo.Collection<Presentation>("presentations");

// Define permissions for basic database operations
PresentationCollection.allow({
  // Allow insertion of new presentation documents (⚠️ unrestricted; secure this in production)
  insert: () => true,

  // Allow updates to existing presentation documents
  update: () => true,

  // Allow removal of presentation documents
  remove: () => true,
});

// Insert a new presentation document asynchronously
export async function createPresentation(presentation: Presentation): Promise<string> {
  // Insert the presentation and return the generated document ID
  return await PresentationCollection.insertAsync(presentation);
}

// Retrieve a presentation by its unique ID
export async function getPresentationById(id: string): Promise<Presentation | undefined> {
  // Find and return a single presentation document that matches the given ID
  return await PresentationCollection.findOneAsync({ _id: id });
}

// Update a presentation document with new field values
export async function updatePresentation(id: string, updates: Partial<Presentation>): Promise<number> {
  // Apply updates using MongoDB’s $set operator
  return await PresentationCollection.updateAsync({ _id: id }, { $set: updates });
}

// Delete a presentation document by its ID
export async function deletePresentation(id: string): Promise<number> {
  // Remove the presentation document from the collection
  return await PresentationCollection.removeAsync({ _id: id });
}

// Check if a presentation already exists for a given user and name
export async function doesPresentationExist(userID: string, name: string): Promise<boolean> {
  // Find a presentation document matching both userID and name
  const presentation = await PresentationCollection.findOneAsync({
    userID,
    name,
  });

  // Return true if found, false otherwise
  return !!presentation;
}

// Retrieve all presentations created by a specific user
export async function getPresentationsByUser(userID: string): Promise<Presentation[]> {
  // Find and return all presentation documents belonging to the given user
  return PresentationCollection.find({ userID }).fetch();
}
