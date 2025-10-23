import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Asset, AssetCollection } from "../../../api/database/assets/assets";
import { getUserIDCookie } from "../../../cookies/cookies";
import { ImageCollection } from "../../../api/database/images/images";

export interface AssetWithCount extends Asset {
  imageCount: number;
}

/**
 * Track list of user's assets with counts of images per asset.
 *
 * @returns list of assets with image counts
 */
export function useAssetsWithImageCount(): AssetWithCount[] {
  return useTracker<AssetWithCount[]>(() => {
    Meteor.subscribe("assets");
    Meteor.subscribe("images");
    const userId = getUserIDCookie();
    const assets = AssetCollection.find({ userId }).fetch();
    const images = ImageCollection.find({}).fetch();
    return assets.map((asset) => ({
      ...asset,
      imageCount: images.filter((img) => img.assetId === asset._id).length,
    }));
  }, []);
}

// Helper: safe ArrayBuffer -> base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB per chunk
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...Array.from(chunk as Uint8Array));
  }
  return btoa(binary);
}

// Load pdf.js from CDN
async function loadPdfJS(): Promise<any> {
  if (typeof window === "undefined") {
    return null;
  }

  // Check if already loaded
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });

    // Check if pdfjsLib is now available
    if (!(window as any).pdfjsLib) {
      throw new Error("PDF.js library not available after loading");
    }

    // Set worker path
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    return (window as any).pdfjsLib;
  } catch (error) {
    console.error("Error loading PDF.js:", error);
    throw error;
  }
}

// Convert PDF to images using pdf.js from CDN
async function convertPdfToImages(file: File): Promise<File[]> {
  try {
    const pdfjsLib = await loadPdfJS();

    if (!pdfjsLib) {
      throw new Error("PDF.js library failed to load");
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const imageFiles: File[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.85);
      });

      const imageFile = new File([blob], `${file.name.replace(".pdf", "")}_page_${pageNum}.jpg`, { type: "image/jpeg" });

      imageFiles.push(imageFile);
    }

    return imageFiles;
  } catch (error) {
    console.error("PDF conversion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to convert PDF: ${errorMessage}`);
  }
}

// Check if file is PDF
function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

// Process file - convert PDFs to images, pass through other files
async function processFile(file: File): Promise<File[]> {
  if (isPdfFile(file)) {
    return await convertPdfToImages(file);
  } else {
    // For non-PDF files, return as single file array
    return [file];
  }
}

// Create asset and upload images
export async function createAssetWithImages({ name, icon, files }: { name: string; icon: string; files: File[] }, onProgress?: (progress: number) => void) {
  const userId = getUserIDCookie();
  if (!userId) {
    throw new Error("User ID is required to create an asset.");
  }

  // Insert asset with userId
  const assetId = await AssetCollection.insertAsync({ name, icon, userId });
  console.log("Created asset with id:", assetId, "Uploading", files.length, "images");
  // Wait briefly to ensure asset is available in DB (Meteor eventual consistency)
  await new Promise((res) => setTimeout(res, 300));

  onProgress?.(5); // Initial progress

  // Process all files (convert PDFs to images)
  const allImageFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const processedFiles = await processFile(file);
      allImageFiles.push(...processedFiles);
      // Progress from 5% to 40% during file processing
      const processProgress = 5 + ((i + 1) / files.length) * 35;
      onProgress?.(Math.round(processProgress));
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
      throw error;
    }
  }

  console.log(`Converted ${files.length} files to ${allImageFiles.length} images`);

  onProgress?.(40); // Processing complete, starting uploads

  // Upload images and insert docs
  for (let i = 0; i < allImageFiles.length; i++) {
    const file = allImageFiles[i];
    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    await new Promise((resolve, reject) => {
      Meteor.call(
        "assets.uploadImageToGCP",
        {
          assetId,
          fileName: file.name,
          fileType: file.type,
          base64,
        },
        (err: Meteor.Error) => {
          if (err) reject(err);
          else resolve(null);
        },
      );
    });

    // Progress from 40% to 90% during uploads
    const uploadProgress = 40 + ((i + 1) / allImageFiles.length) * 50;
    onProgress?.(Math.round(uploadProgress));
  }

  onProgress?.(90); // Uploads complete
}
