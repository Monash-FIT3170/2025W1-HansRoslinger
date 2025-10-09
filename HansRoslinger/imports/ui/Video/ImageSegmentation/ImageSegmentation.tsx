// src/components/ImageSegmentation.jsx
import React, { useEffect } from "react";
import { useMatch } from "react-router-dom";
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";
import "./imageSegmentation.css";
// import './imageSegmentationScript'; // Assuming this TypeScript file contains imperative logic

interface ImageSegmentationProps {
  grayscale: () => boolean;
}

export const ImageSegmentation: React.FC<ImageSegmentationProps> = ({
  grayscale,
}) => {
  const isPresenting = useMatch("/present");

  useEffect(() => {
    const video = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement = document.getElementById(
      "canvas",
    ) as HTMLCanvasElement;
    const canvasCtx = canvasElement.getContext("2d");
    // const webcamPredictions = document.getElementById("webcamPredictions");
    const demosSection: HTMLElement = document.getElementById("demos");
    let enableWebcamButton: HTMLButtonElement;
    let webcamRunning: boolean = false;
    // const videoHeight: string = "360px";
    // const videoWidth: string = "480px";
    let runningMode: "IMAGE" | "VIDEO" = "IMAGE";
    // const resultWidthHeigth = 256;
    let rafID: number | null = null;

    let imageSegmenter: ImageSegmenter;
    // let labels: Array<string>;

    // Create a transparent background (only keep person)
    // const legendColors = [
    //   [0, 0, 0, 0], // Background - fully transparent
    //   [255, 255, 255, 255], // Person - keep original colors
    // ];

    const createImageSegmenter = async () => {
      const audio = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm",
      );

      imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU",
        },
        runningMode: runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
      labels = imageSegmenter.getLabels();
      demosSection.classList.remove("invisible");
    };
    createImageSegmenter();

    // [Previous image segmentation code remains the same...]

    function callbackForVideo(result: ImageSegmenterResult) {
      // Resize canvas to match video
      if (
        canvasElement.width !== video.videoWidth ||
        canvasElement.height !== video.videoHeight
      ) {
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;
      }

      // Draw current video frame to canvas
      canvasCtx.drawImage(
        video,
        0,
        0,
        canvasElement.width,
        canvasElement.height,
      );
      const frame = canvasCtx.getImageData(
        0,
        0,
        canvasElement.width,
        canvasElement.height,
      );
      const pixels = frame.data;

      // Get segmentation mask (values between 0 and 1)
      const mask = result.categoryMask.getAsFloat32Array();

      for (let i = 0; i < mask.length; i++) {
        const pixelIndex = i * 4;
        if (Math.round(mask[i]) === 1) {
          // Background
          pixels[pixelIndex + 3] = 0; // Set alpha to 0 (transparent)
        } else if (grayscale() == true) {
          const r = pixels[pixelIndex];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          pixels[pixelIndex] = gray;
          pixels[pixelIndex + 1] = gray;
          pixels[pixelIndex + 2] = gray;
        }
      }

      // Put modified image back
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.putImageData(frame, 0, 0);

      // Continue prediction loop
      if (webcamRunning) {
        rafID = window.requestAnimationFrame(predictWebcam);
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
          rafID = window.requestAnimationFrame(predictWebcam);
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
          runningMode: runningMode,
        });
      }
      const startTimeMs = performance.now();

      // Start segmenting the stream.
      imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
    }

    // Enable the live webcam view and start imageSegmentation.
    async function enableCam() {
      if (imageSegmenter === undefined) {
        return;
      }

      if (webcamRunning === true) {
        webcamRunning = false;
        stopWebcam();
      } else {
        webcamRunning = true;
        // getUsermedia parameters.
        const constraints = {
          video: true,
        };

        // Activate the webcam stream.
        video.srcObject =
          await navigator.mediaDevices.getUserMedia(constraints);
        video.addEventListener("loadeddata", predictWebcam);
      }
    }

    function stopWebcam() {
      const stream = video.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
      if (rafID != null) {
        cancelAnimationFrame(rafID);
      }
      video.removeEventListener("loadeddata", predictWebcam);
    }

    // If webcam supported, add event listener to button.s
    if (hasGetUserMedia()) {
      enableWebcamButton = document.getElementById(
        "background-removal-enable",
      ) as HTMLButtonElement;
      enableWebcamButton.addEventListener("click", enableCam);
      enableWebcamButton = document.getElementById(
        "background-removal-enable",
      ) as HTMLButtonElement;
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }

    return () => {
      webcamRunning = false;
      stopWebcam();
    };
  }, [isPresenting]);

  return (
    <div className="`absolute top-0 left-0 w-full h-full flex justify-center items-center fixed inset-0 z-[-1] ${grayscale ? 'grayscale' : ''}`">
      <video id="webcam" autoPlay style={{ display: "none" }}></video>
      <canvas
        id="canvas"
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      ></canvas>
    </div>
  );
};
