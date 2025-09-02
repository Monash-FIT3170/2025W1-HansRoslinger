// GCP bucket upload logic
// Constants for GCP project and bucket
export const GCP_PROJECT_ID = "hansroslinger-468011";
export const GCP_BUCKET_NAME = process.env.BUCKET_NAME ||"hansroslinger-assets";
export const GCP_BUCKET_REGION = process.env.LOCATION || "australia-southeast1";

// You will need to install @google-cloud/storage and authenticate with a service account
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

const storage = new Storage({ projectId: GCP_PROJECT_ID });
const bucket = storage.bucket(GCP_BUCKET_NAME);

export async function uploadImageToBucket(assetId: string, file: File): Promise<string> {
  const hash = crypto.randomBytes(8).toString('hex');
  const fileName = `${file.name.replace(/\s+/g, '_')}-${hash}`;
  const destination = `${assetId}/${fileName}`;
  const blob = bucket.file(destination);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await blob.save(buffer, {
    contentType: file.type,
    resumable: false,
    public: true,
  });

  // Return the authenticated URL
  return `https://storage.cloud.google.com/${GCP_BUCKET_NAME}/${destination}`;
}
