import { Mongo } from "meteor/mongo";

export interface ImageDoc {
  _id?: string;
  fileName: string;
  url: string;
  assetId: string;
  order?: number;
}

export const ImageCollection = new Mongo.Collection<ImageDoc>("images");

ImageCollection.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

export async function insertImage(image: Omit<ImageDoc, "_id">) {
  return await ImageCollection.insertAsync(image);
}

export async function getImagesByAsset(assetId: string) {
  return await ImageCollection.find({ assetId }).fetch();
}

export async function countImagesByAsset(assetId: string) {
  return await ImageCollection.find({ assetId }).count();
}
