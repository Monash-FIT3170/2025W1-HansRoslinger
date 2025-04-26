import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

const createSegmenter = async () => {
  try {
    // Set the backend for TensorFlow.js (WebGL is often the fastest)
    await tf.setBackend('webgl');

    console.log('Loading BodyPix model...');
    // Load the BodyPix model
    const segmenter = await bodyPix.load({
      architecture: 'MobileNetV1',  // You can switch to MobileNetV2 or ResNet for better accuracy or performance
      outputStride: 16,            // Lower output stride = better accuracy but slower performance
      quantBytes: 2,               // Lower quantBytes = better accuracy
    });

    console.log('BodyPix model loaded successfully');
    return segmenter;
  } catch (error) {
    console.error('Error creating segmenter:', error);
  }
};

class VideoBackground {
  #animationId;
  #segmenter;

  getSegmenter = async () => {
    if (!this.#segmenter) {
      this.#segmenter = await createSegmenter();
    }
    return this.#segmenter;
  };

  stop = () => {
    cancelAnimationFrame(this.#animationId);
    console.log('Stop effects');
  };

  blur = async (canvas, video) => {
    const foregroundThreshold = 0.5; // Threshold for segmenting foreground
    const edgeBlurAmount = 15;        // Amount of blur at the edges
    const flipHorizontal = false;     // Flip the segmentation output (optional)
    const blurAmount = 5;             // Main blur effect intensity

    const segmenter = await this.getSegmenter();

    // Make sure that the video has loaded and has a valid size
    if (!video.videoWidth || !video.videoHeight) {
      console.error('Invalid video dimensions:', video.videoWidth, video.videoHeight);
      return;
    }

    console.log('Applying blur effect to video');
    
    const processFrame = async () => {
      // Segmentation step: Get segmentation data for the person in the video
      const segmentation = await segmenter.segmentPerson(video);

      // Ensure segmentation is not null or undefined
      if (!segmentation) {
        console.error('Segmentation failed or returned empty.');
        return;
      }

      // Draw the blur effect on the canvas
      bodyPix.drawBokehEffect(
        canvas,
        video,
        segmentation,
        foregroundThreshold,
        blurAmount,
        edgeBlurAmount,
        flipHorizontal
      );

      // Recursively call processFrame to keep updating the blur effect
      this.#animationId = requestAnimationFrame(processFrame);
    };

    // Start the frame processing
    this.#animationId = requestAnimationFrame(processFrame);
  };

  remove = async (canvas, video) => {
    const context = canvas.getContext('2d');
    const segmenter = await this.getSegmenter();

    console.log('Applying background removal effect to video');
    const processFrame = async () => {
      context.drawImage(video, 0, 0);
      const segmentation = await segmenter.segmentPerson(video);
      const coloredPartImage = await bodyPix.toBinaryMask(segmentation);
      const imageData = context.getImageData(0, 0, video.videoWidth, video.videoHeight);

      // Iterate through the imageData and set the background pixels' alpha to 0
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (coloredPartImage.data[i] === 255) {
          imageData.data[i] = 0;  // Make background pixels fully transparent
        }
      }

      // Draw the processed image on the canvas
      await bodyPix.drawMask(canvas, imageData);
      this.#animationId = requestAnimationFrame(processFrame);
    };
    this.#animationId = requestAnimationFrame(processFrame);
  };
}

const videoBackground = new VideoBackground();

export default videoBackground;
