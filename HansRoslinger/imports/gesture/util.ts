// Need to get bounding rectangle of videoelement passed into this function to get this working correctly for all window scales where the video feed does not match the window
// Otherwise, positions are only accurate if scale of video feed matches scale of the window
export const gestureToScreenPosition = (x: number, y: number, z?: number): { screenX: number; screenY: number } => {
  // Get the screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Flip the x coordinate (mirrored horizontally)
  const flippedX = 1 - x;

  // Convert normalized x and y to absolute screen positions
  const screenX = Math.round(flippedX * screenWidth);
  const screenY = Math.round(y * screenHeight);

  return { screenX, screenY };
};
