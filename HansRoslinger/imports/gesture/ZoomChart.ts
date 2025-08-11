import { Gesture, gestureToScreenPosition } from "./gesture";

export const processZoomChart = (_1: Gesture, latestGesture: Gesture): void => {
  let leftHandScreenPosition, rightHandScreenPosition;
  try {
    leftHandScreenPosition = gestureToScreenPosition(
      latestGesture.doubleGestureLandmarks[0][9].x,
      latestGesture.doubleGestureLandmarks[0][9].y,
    );
    rightHandScreenPosition = gestureToScreenPosition(
      latestGesture.doubleGestureLandmarks[1][9].x,
      latestGesture.doubleGestureLandmarks[1][9].y,
    );
  // if this catch occurs it means that a closed fist has occured and we should end the zoom
  // we need this error catching because otherwise the left or right hand position when getting index 9 will crash
  } catch {
    leftHandScreenPosition = { screenX: 0, screenY: 0 };
    rightHandScreenPosition = { screenX: 0, screenY: 0 };
  }
  console.log(`starting left hand position: ${JSON.stringify(leftHandScreenPosition)}`);
  console.log(`starting right hand position: ${JSON.stringify(rightHandScreenPosition)}`);

  // x and y needs to be a midpoint between the two hands
  const gestureEvent = new CustomEvent("chart:togglezoom", {
  detail: {
    x: (leftHandScreenPosition.screenX + rightHandScreenPosition.screenX) / 2,
    y: (leftHandScreenPosition.screenY + rightHandScreenPosition.screenY) / 2,
    },
  });

  window.dispatchEvent(gestureEvent);
};

export const processZoom = (
  zoomStartPosition: { x: number; y: number },
  gestures: Gesture,
): void => {
  console.log(`gesture: ${JSON.stringify(gestures)}`);
  const leftHandScreenPosition = gestureToScreenPosition(
    gestures.doubleGestureLandmarks[0][9].x,
    gestures.doubleGestureLandmarks[0][9].y,
  );
  const rightHandScreenPosition = gestureToScreenPosition(
    gestures.doubleGestureLandmarks[1][9].x,
    gestures.doubleGestureLandmarks[1][9].y,
  );
  console.log(`left hand: ${JSON.stringify(leftHandScreenPosition)}`);
  console.log(`right hand: ${JSON.stringify(rightHandScreenPosition)}`);
  console.log(`zoom start: ${JSON.stringify(zoomStartPosition)}`);

  // Calculate the horizontal difference (dx) and vertical difference (dy) between the two hands
const dx = rightHandScreenPosition.screenX - leftHandScreenPosition.screenX;
const dy = rightHandScreenPosition.screenY - leftHandScreenPosition.screenY;

// Max distance to normalise the zoom level
const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.5; // 50% of the screen size

// Normalise the horizontal (dx) and vertical (dy) movements betwween 0-1
const normalisedDx = Math.min(Math.abs(dx) / maxDistance, 1);
const normalisedDy = Math.min(Math.abs(dy) / maxDistance, 1); 

// Reverse it so when hands are close, the chart is zoomed out.
  const scaleX = Math.min(Math.max(1 + normalisedDx, 0.5), 1.5);
  const scaleY = 1 - normalisedDy * 0.9;

  console.log("dx:", dx, "dy:", dy);
  console.log("Zoom scaleX:", scaleX, "scaleY:", scaleY);
  window.dispatchEvent(
    new CustomEvent<{ scaleX: number; scaleY: number }>("chart:zoom", {
      detail: { scaleX, scaleY },
    }),
  );
};
