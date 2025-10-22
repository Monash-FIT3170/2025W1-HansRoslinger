import { Gesture, gestureToScreenPosition } from "./gesture";

export const twoFingersLog = (_: Gesture, latestGesture: Gesture): void => {
  if (!latestGesture.singleGestureLandmarks || latestGesture.singleGestureLandmarks.length < 13) {
    console.warn("[TwoFingers] Not enough landmarks", latestGesture.singleGestureLandmarks);
    return;
  }

  const indexTip = latestGesture.singleGestureLandmarks[8];
  const middleTip = latestGesture.singleGestureLandmarks[12];

  const indexScreen = gestureToScreenPosition(indexTip.x, indexTip.y, indexTip.z);
  const middleScreen = gestureToScreenPosition(middleTip.x, middleTip.y, middleTip.z);

  console.log(
    `[TwoFingers] Index: (${indexScreen.screenX}, ${indexScreen.screenY}), ` +
      `Middle: (${middleScreen.screenX}, ${middleScreen.screenY})`
  );
};
