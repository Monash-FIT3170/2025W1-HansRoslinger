Meteor.methods({
  // ...existing methods...
  async "assets.deleteImageFromGCP"(data: {
    assetId: string;
    fileName: string;
  }) {
    const prefix = `${data.assetId}/`;
    // Find file in bucket with this prefix and fileName (may have hash)
    const [files] = await bucket.getFiles({ prefix });
    const match = files.find(
      (f) =>
        f.name.startsWith(prefix) &&
        f.name.includes(data.fileName.replace(/\s+/g, "_")),
    );
    if (match) {
      await match.delete();
      return true;
    }
    return false;
  },
});
import { Meteor } from "meteor/meteor";
import { GCP_BUCKET_NAME } from "../GCP/bucket";
import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import { ImageCollection } from "../imports/api/database/images/images";

// Setup GCP storage client
const storage = new Storage();
const bucket = storage.bucket(GCP_BUCKET_NAME);

Meteor.methods({
  async "assets.uploadImageToGCP"(data: {
    assetId: string;
    fileName: string;
    fileType: string;
    base64: string;
  }) {
    const buffer = Buffer.from(data.base64, "base64");
    const hash = crypto.randomBytes(8).toString("hex");
    const safeFileName = data.fileName.replace(/\s+/g, "_");
    const destination = `${data.assetId}/${safeFileName}-${hash}`;
    const blob = bucket.file(destination);
    await blob.save(buffer, {
      contentType: data.fileType,
      resumable: false,
    });

    const url = `https://storage.cloud.google.com/${GCP_BUCKET_NAME}/${destination}`;
    // Determine next order for this asset's images
    const existingCount = await ImageCollection.find({
      assetId: data.assetId,
    }).countAsync?.();
    const order =
      typeof existingCount === "number"
        ? existingCount
        : ImageCollection.find({ assetId: data.assetId }).count();
    // Insert image document into MongoDB with order
    await ImageCollection.insertAsync({
      fileName: data.fileName,
      url,
      assetId: data.assetId,
      order,
    });
    return url;
  },
});
