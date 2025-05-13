// src/components/ImageSegmentation.jsx
import React, { useEffect } from 'react';
import './test.css';
import './test.ts'; // Assuming this TypeScript file contains imperative logic

const ImageSegmentation = () => {
  useEffect(() => {
    // If test.ts contains imperative code (not a module), you may need to move that logic here
  }, []);

  return (
    <div>
      <h1>Segmenting images using the MediaPipe Image Segmentation Task</h1>

      <section id="demos" className="invisible">
        <h2>Demo: Segmenting Images</h2>
        <p><b>Click on an image below</b> to see its Segmentation.</p>

        <div className="segmentOnClick">
          <canvas className="removed"></canvas>
          <img
            src="https://assets.codepen.io/9177687/dog_flickr_publicdomain.jpeg"
            crossOrigin="anonymous"
            title="Click to get segmentation!"
            alt="Dog"
          />
          <p className="classification removed"></p>
        </div>

        <div className="segmentOnClick">
          <canvas className="removed"></canvas>
          <img
            src="https://assets.codepen.io/9177687/cat_flickr_publicdomain.jpeg"
            crossOrigin="anonymous"
            title="Click to get segmentation!"
            alt="Cat"
          />
          <p className="classification removed"></p>
        </div>

        <h2>Demo: Webcam continuous segmentation</h2>
        <p>
          Hold some objects up close to your webcam to get real-time segmentation.
          <br />
          Click <b>enable webcam</b> below and grant access to the webcam if prompted.
        </p>

        <div className="webcam">
          <button id="webcamButton" className="mdc-button mdc-button--raised">
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">ENABLE WEBCAM</span>
          </button>
          <video id="webcam" autoPlay style={{ display: 'none' }}></video>
          <canvas id="canvas" width="1280px" height="720px"></canvas>
        </div>
      </section>
    </div>
  );
};

export { ImageSegmentation };
