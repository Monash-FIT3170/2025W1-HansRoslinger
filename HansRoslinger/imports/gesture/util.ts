
export const gestureToScreenPosition = (x: number, y: number, z?: number): { screenX: number; screenY: number } => {
  // Get the screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Flip the x coordinate (mirrored horizontally)
  const flippedX = 1 - x;

  // Convert normalized x and y to absolute screen positions
  const screenX = Math.round(flippedX * screenWidth);
  const screenY = Math.round(y * screenHeight);

  // Optionally, you can use z for depth-related calculations if needed
  if (z !== undefined) {
    console.log(`Depth (z): ${z}`);
  }

  return { screenX, screenY };
};
