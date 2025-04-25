import React from 'react';
import { Hello } from './Hello';
import { Info } from './Info';
import GestureRecognizerComponent from "../mediapipe/gestures";

export const App = () => (
  <div>
    <h1>Welcome to Meteor!</h1>
    <Hello />
    <Info />
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Gesture Recognition Demo</h1>
      <GestureRecognizerComponent />
    </div>
  </div>
  
);
