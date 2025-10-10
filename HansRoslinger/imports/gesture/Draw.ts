/**
 * Purpose
 * -------
 * This file implements drawing functionality that allows users to draw red lines
 * on the screen using hand gestures. The drawing mode is activated by the DRAW gesture
 * (thumb, pointer, and middle finger together) and deactivated by a closed fist.
 * 
 * The drawing functionality:
 * - Creates a canvas overlay on top of the current content
 * - Tracks finger position and draws red lines
 * - Maintains drawing state across gesture updates
 * - Clears drawing when exiting draw mode
 */

import { Gesture, GestureType } from "./gesture";
import { gestureToScreenPosition } from "./util";

// Global state for drawing mode
let isDrawEnabled = false;
let drawCanvas: HTMLCanvasElement | null = null;
let drawContext: CanvasRenderingContext2D | null = null;
let lastDrawPosition: { x: number; y: number } | null = null;
let drawStartPosition: { x: number; y: number } | null = null;

// Eraser indicator state
let eraserIndicator: HTMLDivElement | null = null;
const ERASER_RADIUS = 40;

// Drawing delay state
let drawStartTime: number = 0;
const DRAW_DELAY_MS = 500;

// Gesture switching delays
let lastGestureType: GestureType | null = null;
let lastGestureSwitchTime: number = 0;
const GESTURE_SWITCH_DELAY_MS = 500;

// Open palm disable delay
let openPalmStartTime: number = 0;
const OPEN_PALM_DISABLE_DELAY_MS = 2000;

/**
 * Initialize the drawing canvas overlay
 */
function initializeDrawCanvas(): void {
  if (drawCanvas) return; // Already initialized

  drawCanvas = document.createElement('canvas');
  drawCanvas.id = 'gesture-draw-canvas';
  drawCanvas.style.position = 'fixed';
  drawCanvas.style.top = '0';
  drawCanvas.style.left = '0';
  drawCanvas.style.width = '100vw';
  drawCanvas.style.height = '100vh';
  drawCanvas.style.pointerEvents = 'none'; // Allow clicks to pass through
  drawCanvas.style.zIndex = '9999'; // High z-index to appear on top
  drawCanvas.style.backgroundColor = 'transparent';
  
  // Set canvas size to match viewport
  drawCanvas.width = window.innerWidth;
  drawCanvas.height = window.innerHeight;
  
  document.body.appendChild(drawCanvas);
  
  drawContext = drawCanvas.getContext('2d');
  if (drawContext) {
    drawContext.strokeStyle = '#ff0000'; // Red color
    drawContext.lineWidth = 3;
    drawContext.lineCap = 'round';
    drawContext.lineJoin = 'round';
  }

  // Handle window resize
  window.addEventListener('resize', resizeDrawCanvas);
}

/**
 * Resize the draw canvas when window size changes
 */
function resizeDrawCanvas(): void {
  if (!drawCanvas || !drawContext) return;
  
  drawCanvas.width = window.innerWidth;
  drawCanvas.height = window.innerHeight;
  
  drawContext.strokeStyle = '#ff0000';
  drawContext.lineWidth = 3;
  drawContext.lineCap = 'round';
  drawContext.lineJoin = 'round';
}

/**
 * Remove the drawing canvas and clean up
 */
function removeDrawCanvas(): void {
  if (drawCanvas && document.body.contains(drawCanvas)) {
    document.body.removeChild(drawCanvas);
  }
  drawCanvas = null;
  drawContext = null;
  window.removeEventListener('resize', resizeDrawCanvas);
}

/**
 * Create the eraser indicator (blue circle)
 */
function createEraserIndicator(): void {
  if (eraserIndicator) return; // Already exists

  eraserIndicator = document.createElement('div');
  eraserIndicator.id = 'gesture-eraser-indicator';
  eraserIndicator.style.position = 'fixed';
  eraserIndicator.style.width = `${ERASER_RADIUS * 2}px`;
  eraserIndicator.style.height = `${ERASER_RADIUS * 2}px`;
  eraserIndicator.style.borderRadius = '50%';
  eraserIndicator.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'; // Transparent blue
  eraserIndicator.style.border = '2px solid rgba(0, 123, 255, 0.6)';
  eraserIndicator.style.pointerEvents = 'none';
  eraserIndicator.style.zIndex = '10000'; // Above everything
  eraserIndicator.style.display = 'none'; // Hidden by default
  eraserIndicator.style.transform = 'translate(-50%, -50%)'; // Center on position

  document.body.appendChild(eraserIndicator);
}

/**
 * Update the eraser indicator position
 */
function updateEraserIndicator(position: { x: number; y: number }): void {
  if (!eraserIndicator) {
    createEraserIndicator();
  }

  if (eraserIndicator) {
    eraserIndicator.style.left = `${position.x}px`;
    eraserIndicator.style.top = `${position.y}px`;
    eraserIndicator.style.display = 'block';
  }
}

/**
 * Hide the eraser indicator
 */
function hideEraserIndicator(): void {
  if (eraserIndicator) {
    eraserIndicator.style.display = 'none';
  }
}

/**
 * Remove the eraser indicator completely
 */
function removeEraserIndicator(): void {
  if (eraserIndicator && document.body.contains(eraserIndicator)) {
    document.body.removeChild(eraserIndicator);
    eraserIndicator = null;
  }
}

/**
 * Check if enough time has passed to allow gesture switching
 */
function canSwitchGesture(newGestureType: GestureType): boolean {
  const currentTime = Date.now();
  
  // If it's the same gesture type, no delay needed
  if (lastGestureType === newGestureType) {
    return true;
  }
  
  // If it's a different gesture, check if enough time has passed
  if (lastGestureType !== null && currentTime - lastGestureSwitchTime < GESTURE_SWITCH_DELAY_MS) {
    return false;
  }
  
  // If we're switching away from DRAW gesture, reset drawing position to prevent line connections
  if (lastGestureType === GestureType.DRAW && newGestureType !== GestureType.DRAW) {
    lastDrawPosition = null;
    console.log("Switched away from DRAW gesture - resetting draw position to prevent line connection");
  }
  
  // Update the gesture tracking
  lastGestureType = newGestureType;
  lastGestureSwitchTime = currentTime;
  return true;
}

/**
 * Check if open palm has been held long enough to disable draw mode
 */
function checkOpenPalmDisable(gestureType: GestureType): boolean {
  const currentTime = Date.now();
  
  if (gestureType === GestureType.OPEN_PALM) {
    if (openPalmStartTime === 0) {
      // First time detecting open palm, start the timer
      openPalmStartTime = currentTime;
      return false;
    } else {
      // Check if enough time has passed
      return currentTime - openPalmStartTime >= OPEN_PALM_DISABLE_DELAY_MS;
    }
  } else {
    // Reset the timer if it's not open palm
    openPalmStartTime = 0;
    return false;
  }
}
function getDrawPosition(latestGesture: Gesture): { x: number; y: number } | null {
  try {
    const landmarks = latestGesture.singleGestureLandmarks;
    if (!landmarks || landmarks.length < 9) {
      return null;
    }
    
    // Use index finger tip (landmark 8) for drawing position
    const indexTip = landmarks[8];
    const screenPos = gestureToScreenPosition(indexTip.x, indexTip.y);
    
    return { x: screenPos.screenX, y: screenPos.screenY };
  } catch {
    return null;
  }
}

/**
 * Get the fist position for erasing (uses middle of hand)
 */
function getFistPosition(latestGesture: Gesture): { x: number; y: number } | null {
  try {
    const landmarks = latestGesture.singleGestureLandmarks;
    if (!landmarks || landmarks.length < 21) {
      return null;
    }
    
    // Use the middle of the hand (average of key landmarks) for fist position
    const wrist = landmarks[0];
    const middleMcp = landmarks[9]; // Middle finger base
    const indexMcp = landmarks[5]; // Index finger base
    
    // Calculate center point
    const centerX = (wrist.x + middleMcp.x + indexMcp.x) / 3;
    const centerY = (wrist.y + middleMcp.y + indexMcp.y) / 3;
    
    const screenPos = gestureToScreenPosition(centerX, centerY);
    return { x: screenPos.screenX, y: screenPos.screenY };
  } catch {
    return null;
  }
}

/**
 * Draw a line from the last position to the current position
 */
function drawLine(currentPosition: { x: number; y: number }): void {
  if (!drawContext || !lastDrawPosition) return;
  
  drawContext.beginPath();
  drawContext.moveTo(lastDrawPosition.x, lastDrawPosition.y);
  drawContext.lineTo(currentPosition.x, currentPosition.y);
  drawContext.stroke();
}

/**
 * Erase a circular area around the given position
 */
function eraseArea(position: { x: number; y: number }, radius: number = ERASER_RADIUS): void {
  if (!drawContext) return;
  
  drawContext.save();
  drawContext.globalCompositeOperation = 'destination-out';
  drawContext.beginPath();
  drawContext.arc(position.x, position.y, radius, 0, Math.PI * 2);
  drawContext.fill();
  drawContext.restore();
}

/**
 * Called when a draw gesture is (re)started.
 * Toggles draw mode and sets up the drawing canvas
 */
export const draw = (_initial: Gesture, latestGesture: Gesture): void => {
  if (latestGesture.gestureID === GestureType.CLOSED_FIST) {
    console.log("ending draw mode - keeping drawing on screen");
    window.dispatchEvent(
      new CustomEvent("chart:toggledraw", {
        detail: { x: 0, y: 0 },
      }),
    );
    return;
  }

  if (latestGesture.gestureID === GestureType.OPEN_PALM) {
    // Check if open palm has been held long enough
    if (checkOpenPalmDisable(latestGesture.gestureID)) {
      console.log("canceling draw mode with open palm after 2 second delay");
      window.dispatchEvent(
        new CustomEvent("chart:toggledraw", {
          detail: { x: 0, y: 0 },
        }),
      );
    } else {
      console.log("open palm detected, waiting for 2 second hold...");
    }
    return;
  } else {
    // Reset open palm timer if not open palm
    openPalmStartTime = 0;
  }

  const currentPosition = getDrawPosition(latestGesture);
  if (!currentPosition) return;

  // Save starting position for draw mode
  drawStartPosition = currentPosition;

  window.dispatchEvent(
    new CustomEvent("chart:toggledraw", {
      detail: { x: currentPosition.x, y: currentPosition.y },
    }),
  );
};

/**
 * Process drawing for the current gesture - only draws if it's a DRAW gesture
 */
export function processDraw(_currentDrawPosition: { x: number; y: number }, latestGesture: Gesture): void {
  if (!isDrawEnabled || !drawContext) return;
  
  // Check if we can switch to this gesture (with delay)
  if (!canSwitchGesture(latestGesture.gestureID)) {
    // Still in delay period for gesture switching, maintain previous gesture behavior
    return;
  }
  
  // Only draw if the current gesture is specifically the DRAW gesture
  if (latestGesture.gestureID === GestureType.DRAW) {
    // Check if enough time has passed since draw mode started
    const currentTime = Date.now();
    if (currentTime - drawStartTime < DRAW_DELAY_MS) {
      // Still in delay period, don't draw yet
      return;
    }

    const currentPosition = getDrawPosition(latestGesture);
    if (!currentPosition) return;
    
    // If we have a last position and it's not null, draw a line
    // If lastDrawPosition is null (after switching from another gesture), start a new line
    if (lastDrawPosition) {
      drawLine(currentPosition);
    } else {
      // Starting a new line - just set the position without drawing
      console.log("Starting new line segment at:", currentPosition);
    }
    
    // Update the last position for the next frame
    lastDrawPosition = currentPosition;
  }
  
  // Hide eraser indicator when actively drawing
  hideEraserIndicator();
}

/**
 * Process erasing with fist gesture
 */
export function processErase(latestGesture: Gesture): void {
  if (!isDrawEnabled || !drawContext) return;
  
  // Check if we can switch to this gesture (with delay)
  if (!canSwitchGesture(latestGesture.gestureID)) {
    // Still in delay period for gesture switching
    return;
  }
  
  const fistPosition = getFistPosition(latestGesture);
  if (!fistPosition) return;
  
  // Show the eraser indicator at the fist position
  updateEraserIndicator(fistPosition);
  
  // Erase the area
  eraseArea(fistPosition, ERASER_RADIUS);
}

/**
 * Show eraser indicator without erasing (for preview)
 */
export function showEraserPreview(latestGesture: Gesture): void {
  if (!isDrawEnabled) return;
  
  // Check if we can switch to this gesture (with delay)
  if (!canSwitchGesture(latestGesture.gestureID)) {
    // Still in delay period, don't change eraser preview
    return;
  }
  
  // Only show eraser preview if the gesture looks like it could be a fist
  // Check if most fingers are curled (indicating a potential fist)
  const landmarks = latestGesture.singleGestureLandmarks;
  if (!landmarks || landmarks.length < 21) {
    hideEraserIndicator();
    return;
  }

  // Simple check: if gesture is not a clear draw gesture, hide the indicator
  // This prevents the blue circle from showing when just moving hands around
  if (latestGesture.gestureID === GestureType.DRAW || 
      latestGesture.gestureID === GestureType.CLOSED_FIST ||
      latestGesture.gestureID === GestureType.UNIDENTIFIED) {
    const fistPosition = getFistPosition(latestGesture);
    if (fistPosition) {
      updateEraserIndicator(fistPosition);
    } else {
      hideEraserIndicator();
    }
  } else {
    // For other clear gestures (open palm, pointing, etc.), hide the indicator
    hideEraserIndicator();
  }
}

/**
 * Check if draw mode is currently enabled
 */
export function isDrawModeEnabled(): boolean {
  return isDrawEnabled;
}

// Set up event listener for draw mode toggle (similar to zoom)
if (typeof window !== "undefined") {
  window.addEventListener("chart:toggledraw", (event: Event) => {
    const customEvent = event as CustomEvent<{ x: number; y: number }>;
    isDrawEnabled = !isDrawEnabled;
    if (isDrawEnabled && customEvent.detail) {
      const { x, y } = customEvent.detail;
      drawStartPosition = { x, y };
      lastDrawPosition = { x, y };
      drawStartTime = Date.now(); // Set the start time for the delay
      // Reset gesture tracking
      lastGestureType = null;
      lastGestureSwitchTime = 0;
      openPalmStartTime = 0;
      console.log(`Draw enabled. Start position set to:`, drawStartPosition);
      initializeDrawCanvas();
      createEraserIndicator(); // Create the eraser indicator
      document?.body?.classList.add("draw-active-outline");
    } else {
      drawStartPosition = null;
      lastDrawPosition = null;
      drawStartTime = 0; // Reset start time
      // Reset gesture tracking
      lastGestureType = null;
      lastGestureSwitchTime = 0;
      openPalmStartTime = 0;
      hideEraserIndicator(); // Hide the eraser indicator
      document?.body?.classList.remove("draw-active-outline");
      // DON'T remove the canvas - keep the drawing on screen
      console.log("Draw mode disabled - keeping drawing visible");
    }
  });
}

/**
 * Clear all drawings from the canvas (can be called externally)
 */
export function clearDrawing(): void {
  if (drawContext && drawCanvas) {
    drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  }
  hideEraserIndicator(); // Hide eraser when clearing
}

/**
 * Remove the drawing canvas completely
 */
export function removeDrawing(): void {
  removeDrawCanvas();
  removeEraserIndicator(); // Remove eraser indicator too
}

// Export the drawing state for external access
export { isDrawEnabled };