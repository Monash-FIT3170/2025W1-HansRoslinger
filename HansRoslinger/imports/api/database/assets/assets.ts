import { Mongo } from "meteor/mongo";

export interface Asset {
  _id?: string;
  name: string;
  icon: string;
}

export const AssetCollection = new Mongo.Collection<Asset>("assets");

AssetCollection.allow({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

export async function insertAsset(asset: Omit<Asset, "_id">) {
  return await AssetCollection.insertAsync(asset);
}

export async function getAssets() {
  return await AssetCollection.find({}).fetch();
}
