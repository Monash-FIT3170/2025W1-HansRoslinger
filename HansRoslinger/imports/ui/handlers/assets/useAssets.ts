import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Asset, AssetCollection } from '../../../api/database/assets/assets';
import { getUserIDCookie } from '../../../cookies/cookies';
import { ImageCollection } from '../../../api/database/images/images';

export interface AssetWithCount extends Asset { imageCount: number }

export function useAssetsWithImageCount(): AssetWithCount[] {
  return useTracker<AssetWithCount[]>(() => {
    Meteor.subscribe('assets');
    Meteor.subscribe('images');
    const userId = getUserIDCookie();
    const assets = AssetCollection.find({ userId }).fetch();
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
    binary += String.fromCharCode(...Array.from(chunk as Uint8Array));
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
  const userId = getUserIDCookie();
  if (!userId) {
    throw new Error('User ID is required to create an asset.');
  }
  // Insert asset with userId
  const assetId = await AssetCollection.insertAsync({ name, icon, userId });
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
