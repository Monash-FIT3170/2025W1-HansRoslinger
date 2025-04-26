import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import * as tf from "@tensorflow/tfjs";

const VideoBackgroundRemoval = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmenterRef = useRef<ImageSegmenter | null>(null); // Use useRef to store segmenter

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !segmenterRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const segmenter = segmenterRef.current;

    if (ctx && video) {
      // Set canvas size to match video size
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Capture the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const imgTensor = tf.browser.fromPixels(imageData); // Convert image data to tensor

      // Apply background removal logic using Mediapipe
      const result = segmenter.segment(imgTensor);

      // Create a mask and remove background
      const mask = result.segmentationMask; // Get segmentation mask from the result
      const maskTensor = tf.browser.fromPixels(mask); // Convert mask to tensor
      const maskedFrame = tf.mul(imgTensor, maskTensor); // Apply mask to the frame

      // Convert the result back to imageData for displaying on canvas
      const maskedImageData = await tf.browser.toPixels(maskedFrame);
      ctx.putImageData(new ImageData(maskedImageData, canvas.width, canvas.height), 0, 0);
    }
  };

  useEffect(() => {
    const setup = async () => {
      // Load the segmenter from MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-assets/deeplabv3.tflite",
        },
        outputCategoryMask: true,
        outputConfidenceMasks: false,
        runningMode: "VIDEO", // Running in video mode
      });

      segmenterRef.current = segmenter; // Store segmenter in useRef

      // Initialize video stream
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start processing video frames
        const interval = setInterval(() => {
          processFrame(); // Process every frame
        }, 1000 / 30); // Aim for 30 FPS

        return () => clearInterval(interval); // Cleanup interval when component unmounts
      }
    };

    setup();

    return () => {
      // Cleanup resources (stop video stream)
      if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-container" style={{ position: "relative" }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

export default VideoBackgroundRemoval;
