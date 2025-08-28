import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { AssetCollection } from '../../../api/database/assets/assets';
import { ImageCollection } from '../../../api/database/images/images';

// Hook: return assets with image count
export function useAssetsWithImageCount() {
  return useTracker(() => {
    Meteor.subscribe('assets');
    Meteor.subscribe('images');
    const assets = AssetCollection.find({}).fetch();
    const images = ImageCollection.find({}).fetch();
    return assets.map(asset => ({
      ...asset,
      imageCount: images.filter(img => img.assetId === asset._id).length,
    }));
  }, []);
}

// Helper: safe ArrayBuffer -> base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB per chunk
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}

// Create asset and upload images
export async function createAssetWithImages({
  name,
  icon,
  files,
}: {
  name: string;
  icon: string;
  files: File[];
}) {
  // Insert asset
  const assetId = await AssetCollection.insertAsync({ name, icon });
  console.log('Created asset with id:', assetId, 'Uploading', files.length, 'images');
  // Wait briefly to ensure asset is available in DB (Meteor eventual consistency)
  await new Promise(res => setTimeout(res, 300));

  // Upload images and insert docs
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    await new Promise((resolve, reject) => {
      Meteor.call(
        'assets.uploadImageToGCP',
        {
          assetId,
          fileName: file.name,
          fileType: file.type,
          base64
        },
        (err: Meteor.Error) => {
          if (err) reject(err);
          else resolve(null);
        }
      );
    });
  }
}
