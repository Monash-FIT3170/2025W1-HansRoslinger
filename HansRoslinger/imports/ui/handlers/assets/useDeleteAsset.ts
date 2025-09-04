import { Meteor } from "meteor/meteor";
import { AssetCollection } from "../../../api/database/assets/assets";
import { ImageCollection } from "../../../api/database/images/images";

export async function deleteAssetAndFiles(assetId: string) {
  // Get all images for this asset
  const images = await ImageCollection.find({ assetId }).fetch();
  // Remove images from DB
  for (const img of images) {
    await Meteor.callAsync("assets.deleteImageFromGCP", {
      assetId,
      fileName: img.fileName,
    });
    await ImageCollection.removeAsync({ _id: img._id });
  }
  // Remove asset
  await AssetCollection.removeAsync({ _id: assetId });
}
