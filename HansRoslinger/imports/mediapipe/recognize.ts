// import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
// import { recogniseCustomGesture, handleTwoHandedGestures } from "./customGestures";
// import { Handedness } from "./types";
// import { Gesture, GestureType } from "../gesture/gesture";

// /**
//  * Recognize gestures from an image/canvas/video using Mediapipe and custom logic.
//  * @param input HTMLCanvasElement | HTMLVideoElement | HTMLImageElement
//  * @returns Array of detected gestures (custom or UNIDENTIFIED)
//  */
//   const vision = await FilesetResolver.forVisionTasks(
//     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
//   );
//   const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
//     baseOptions: {
//       modelAssetPath:
//         "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
//       delegate: "GPU",
//     },
//     runningMode: "IMAGE",
//     numHands: 2,
//     minHandDetectionConfidence: 0.6,
//   });

//   const result = await gestureRecognizer.recognize(input);
//   // Build Gesture objects for left/right hands
//   let leftGesture: Gesture | undefined = undefined;
//   let rightGesture: Gesture | undefined = undefined;
//   const singleHanded: Gesture[] = [];
//   if (result.landmarks && result.landmarks.length > 0) {
//     for (let i = 0; i < result.landmarks.length; i++) {
//       let handedness: Handedness = Handedness.RIGHT;
//       if (result.handedness && result.handedness[i] && result.handedness[i][0]?.categoryName) {
//         handedness = result.handedness[i][0].categoryName as Handedness;
//       }
//       const custom = recogniseCustomGesture(result.landmarks[i], handedness);
//       const gesture: Gesture = {
//         gestureID: custom ? custom.gestureID : GestureType.UNIDENTIFIED,
//         handedness,
//         timestamp: new Date(),
//         confidence: custom ? custom.confidence : 0,
//         singleGestureLandmarks: result.landmarks[i],
//         doubleGestureLandmarks: [],
//       };
//       if (handedness === Handedness.LEFT) leftGesture = gesture;
//       else if (handedness === Handedness.RIGHT) rightGesture = gesture;
//       singleHanded.push(gesture);
//     }
//   }
//   // Try to detect two-handed gesture first
//   let twoHanded: Gesture | undefined = undefined;
//   if (leftGesture && rightGesture) {
//     // Use your two-handed gesture logic
//     let handled = false;
//     handleTwoHandedGestures(leftGesture, rightGesture, (g) => {
//       twoHanded = g;
//       handled = true;
//     });
//     if (handled && twoHanded) {
//       return [{ gestureID: twoHanded.gestureID, handedness: twoHanded.handedness }];
//     }
//   }
//   // Otherwise, return single-handed gestures
//   return singleHanded.map(g => ({ gestureID: g.gestureID, handedness: g.handedness }));
// }
