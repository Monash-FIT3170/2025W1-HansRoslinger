import React from "react";
import GestureRecognizerComponent from "../mediapipe/gestures";

export const GestureRecognition = () => {
    return (<>
        <h1>Welcome to Meteor!</h1>
        <div className="p-8">
            <h1 className="text-xl font-bold mb-4">Gesture Recognition Demo</h1>
            <GestureRecognizerComponent />
        </div>
    </>
    )
};