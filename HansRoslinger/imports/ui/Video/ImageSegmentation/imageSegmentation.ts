// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ImageSegmenter, SegmentationMask, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

// Get DOM elements
const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d");
const webcamPredictions = document.getElementById("webcamPredictions");
const demosSection: HTMLElement = document.getElementById("demos");
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;
const videoHeight: string = "360px";
const videoWidth: string = "480px";
let runningMode: "IMAGE" | "VIDEO" = "IMAGE";
const resultWidthHeigth = 256;

let imageSegmenter: ImageSegmenter;
let labels: Array<string>;

// Create a transparent background (only keep person)
const legendColors = [
  [0, 0, 0, 0],     // Background - fully transparent
  [255, 255, 255, 255]  // Person - keep original colors
];

const createImageSegmenter = async () => {
  const audio = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
  );

  imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
      delegate: "GPU"
    },
    runningMode: runningMode,
    outputCategoryMask: true,
    outputConfidenceMasks: false
  });
  labels = imageSegmenter.getLabels();
  demosSection.classList.remove("invisible");
};
createImageSegmenter();

// [Previous image segmentation code remains the same...]

function callbackForVideo(result: ImageSegmenterResult) {
  // Resize canvas to match video
  if (canvasElement.width !== video.videoWidth || canvasElement.height !== video.videoHeight) {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
  }

  // Draw current video frame to canvas
  canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  const frame = canvasCtx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const pixels = frame.data;

  // Get segmentation mask (values between 0 and 1)
  const mask = result.categoryMask.getAsFloat32Array();

  // Process each pixel
  for (let i = 0; i < mask.length; i++) {
    const pixelIndex = i * 4;
    if (Math.round(mask[i]) === 1) {  // Background
      pixels[pixelIndex + 3] = 0;     // Set alpha to 0 (transparent)
    }
    // Person pixels (mask value 1) remain unchanged
  }

  // Put modified image back
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.putImageData(frame, 0, 0);

  // Continue prediction loop
  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  }
}

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and segmented it.
********************************************************************/

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Get segmentation from the webcam
let lastWebcamTime = -1;
async function predictWebcam() {
  if (video.currentTime === lastWebcamTime) {
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
    return;
  }
  lastWebcamTime = video.currentTime;
  canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  // Do not segmented if imageSegmenter hasn't loaded
  if (imageSegmenter === undefined) {
    return;
  }
  // if image mode is initialized, create a new segmented with video runningMode
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await imageSegmenter.setOptions({
      runningMode: runningMode
    });
  }
  let startTimeMs = performance.now();

  // Start segmenting the stream.
  imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
}

// Enable the live webcam view and start imageSegmentation.
async function enableCam(event) {
  if (imageSegmenter === undefined) {
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE SEGMENTATION";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE SEGMENTATION";
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
  video.addEventListener("loadeddata", predictWebcam);
}

// If webcam supported, add event listener to button.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById(
    "webcamButton"
  ) as HTMLButtonElement;
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
