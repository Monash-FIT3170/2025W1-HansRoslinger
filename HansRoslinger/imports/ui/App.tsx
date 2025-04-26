import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import BackgroundRemoval from './BackGroundRemoval';
import { GestureRecognition } from './GestureRecognition';

export const App = () => (
  <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gesture-recognition" element={<GestureRecognition />} />
        <Route path="/background-removal" element={<BackgroundRemoval />} />
      </Routes>
    </BrowserRouter>
  </div>
);
