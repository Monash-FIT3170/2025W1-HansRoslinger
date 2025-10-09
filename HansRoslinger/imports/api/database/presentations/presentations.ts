import { Mongo } from "meteor/mongo";

export interface Presentation {
  _id?: string;
  name: string;
  createdAt: Date;
  userID: string;
  assetID: string;
}

export const PresentationCollection = new Mongo.Collection<Presentation>("presentations");
PresentationCollection.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

export async function createPresentation(presentation: Presentation): Promise<string> {
  return await PresentationCollection.insertAsync(presentation);
}

export async function getPresentationById(id: string): Promise<Presentation | undefined> {
  return await PresentationCollection.findOneAsync({ _id: id });
}

export async function updatePresentation(id: string, updates: Partial<Presentation>): Promise<number> {
  return await PresentationCollection.updateAsync({ _id: id }, { $set: updates });
}

export async function deletePresentation(id: string): Promise<number> {
  return await PresentationCollection.removeAsync({ _id: id });
}

export async function doesPresentationExist(userID: string, name: string): Promise<boolean> {
  const presentation = await PresentationCollection.findOneAsync({
    userID,
    name,
  });
  return !!presentation;
}

export async function getPresentationsByUser(userID: string): Promise<Presentation[]> {
  return PresentationCollection.find({ userID }).fetch();
}
