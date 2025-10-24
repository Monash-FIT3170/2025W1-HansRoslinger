/**
 * Purpose
 * -------
 * Implements hand-gesture-based drawing functionality.
 * Users can draw red lines on the screen using the DRAW gesture and erase with a fist/pointer.
 * Maintains drawing state, smoothing, delays, and eraser preview.
 */

import { Gesture, GestureType } from "./gesture";
import { gestureToScreenPosition } from "./util";

// ---------- Global drawing state ----------
let isDrawEnabled = false; // Tracks whether draw mode is active
let drawCanvas: HTMLCanvasElement | null = null; 
let drawContext: CanvasRenderingContext2D | null = null; 
let lastDrawPosition: { x: number; y: number } | null = null; // Last smoothed draw position
let drawStartPosition: { x: number; y: number } | null = null; 
let smoothedDrawPosition: { x: number; y: number } | null = null; // For movement smoothing

// Eraser state
let eraserIndicator: HTMLDivElement | null = null;
const ERASER_RADIUS = 80;

// Drawing smoothing and timing constants
const MIN_DRAW_DISTANCE_SQUARED = 4; // Minimum distance squared to consider a line segment
const SMOOTHING_ALPHA = 0.25; // Weight for exponential smoothing (reduces jitter)
let lastConfirmedDrawTimestamp: number = 0; // Used for grace period when gestures are ambiguous
const DRAW_CONTINUATION_GRACE_MS = 400; // Allow brief continuation even if gesture becomes unrecognized

// Gesture switching delays
let drawStartTime = 0; 
const DRAW_DELAY_MS = 500; // Initial delay after starting draw before lines appear
let lastGestureType: GestureType | null = null;
let lastGestureSwitchTime = 0; 
const GESTURE_SWITCH_DELAY_MS = 500; // Prevent rapid gesture switches

// Open palm disable delay
let openPalmStartTime = 0;
const OPEN_PALM_DISABLE_DELAY_MS = 1000; // Must hold open palm for this duration to exit draw mode

// ---------- Utility functions ----------
function isOnPresentingPage(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/present";
}

// Reset all drawing state when leaving presenting page
function cleanupWhenNotPresenting(): void {
  if (!isOnPresentingPage()) {
    isDrawEnabled = false;
    removeDrawCanvas();
    removeEraserIndicator();
    document?.body?.classList.remove("draw-active-outline");
    // Reset all timing and position states
    drawStartPosition = lastDrawPosition = null;
    drawStartTime = lastGestureType = lastGestureSwitchTime = openPalmStartTime = 0;
    resetSmoothing();
    lastConfirmedDrawTimestamp = 0;
  }
}

// Initialize canvas overlay for drawing
function initializeDrawCanvas(): void {
  if (!isOnPresentingPage() || drawCanvas) return;

  drawCanvas = document.createElement("canvas");
  drawCanvas.id = "gesture-draw-canvas";
  drawCanvas.style.position = "fixed";
  drawCanvas.style.top = "0";
  drawCanvas.style.left = "0";
  drawCanvas.style.width = "100vw";
  drawCanvas.style.height = "100vh";
  drawCanvas.style.pointerEvents = "none"; // Allow clicks through the canvas
  drawCanvas.style.zIndex = "9999";
  drawCanvas.width = window.innerWidth;
  drawCanvas.height = window.innerHeight;
  document.body.appendChild(drawCanvas);

  drawContext = drawCanvas.getContext("2d");
  if (drawContext) {
    drawContext.strokeStyle = "#ff0000"; // Red lines
    drawContext.lineWidth = 3;
    drawContext.lineCap = drawContext.lineJoin = "round";
  }

  // Resize canvas on window changes to keep full coverage
  window.addEventListener("resize", resizeDrawCanvas);
}

// Resize the canvas and restore drawing properties
function resizeDrawCanvas(): void {
  if (!drawCanvas || !drawContext) return;
  drawCanvas.width = window.innerWidth;
  drawCanvas.height = window.innerHeight;
  drawContext.strokeStyle = "#ff0000";
  drawContext.lineWidth = 3;
}

// ---------- Canvas / Eraser handling ----------
function removeDrawCanvas(): void {
  if (drawCanvas && document.body.contains(drawCanvas)) document.body.removeChild(drawCanvas);
  drawCanvas = drawContext = null;
  window.removeEventListener("resize", resizeDrawCanvas);
}

function createEraserIndicator(): void {
  if (!isOnPresentingPage() || eraserIndicator) return;
  eraserIndicator = document.createElement("div");
  eraserIndicator.id = "gesture-eraser-indicator";
  eraserIndicator.style.position = "fixed";
  eraserIndicator.style.width = eraserIndicator.style.height = `${ERASER_RADIUS * 2}px`;
  eraserIndicator.style.borderRadius = "50%";
  eraserIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.3)";
  eraserIndicator.style.border = "2px solid rgba(0,123,255,0.6)";
  eraserIndicator.style.pointerEvents = "none";
  eraserIndicator.style.zIndex = "10000";
  eraserIndicator.style.display = "none"; // Hidden by default
  eraserIndicator.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(eraserIndicator);
}

function updateEraserIndicator(position: { x: number; y: number }): void {
  if (!eraserIndicator) createEraserIndicator();
  if (eraserIndicator) {
    eraserIndicator.style.left = `${position.x}px`;
    eraserIndicator.style.top = `${position.y}px`;
    eraserIndicator.style.display = "block"; // Show the indicator
  }
}

function hideEraserIndicator(): void {
  if (eraserIndicator) eraserIndicator.style.display = "none";
}

function removeEraserIndicator(): void {
  if (eraserIndicator && document.body.contains(eraserIndicator)) {
    document.body.removeChild(eraserIndicator);
    eraserIndicator = null;
  }
}

// ---------- Gesture handling ----------
/**
 * Determines if we can switch to a new gesture.
 * Logic:
 * - Always allow returning to DRAW to keep line continuity
 * - Prevent rapid gesture changes with a delay
 * - Reset last draw position when leaving DRAW to prevent line jumps
 */
function canSwitchGesture(newGestureType: GestureType): boolean {
  const currentTime = Date.now();
  const previousGestureType = lastGestureType;

  if (newGestureType === GestureType.DRAW) {
    lastGestureType = newGestureType;
    lastGestureSwitchTime = currentTime;
    return true;
  }

  if (lastGestureType === newGestureType) return true;

  if (lastGestureType !== null && currentTime - lastGestureSwitchTime < GESTURE_SWITCH_DELAY_MS) return false;

  if (previousGestureType === GestureType.DRAW) {
    lastDrawPosition = null;
    resetSmoothing();
  }

  lastGestureType = newGestureType;
  lastGestureSwitchTime = currentTime;
  return true;
}

/**
 * Check if open palm gesture has been held long enough to exit draw mode.
 */
function checkOpenPalmDisable(gestureType: GestureType): boolean {
  const currentTime = Date.now();
  if (gestureType === GestureType.OPEN_PALM) {
    if (!openPalmStartTime) openPalmStartTime = currentTime;
    return currentTime - openPalmStartTime >= OPEN_PALM_DISABLE_DELAY_MS;
  } else {
    openPalmStartTime = 0;
    return false;
  }
}

// Get the screen coordinates for drawing from the index finger tip
function getDrawPosition(latestGesture: Gesture): { x: number; y: number } | null {
  const landmarks = latestGesture.singleGestureLandmarks;
  if (!landmarks || landmarks.length < 9) return null;
  const indexTip = landmarks[8];
  const screenPos = gestureToScreenPosition(indexTip.x, indexTip.y);
  return { x: screenPos.screenX, y: screenPos.screenY };
}

// Exponential smoothing to reduce jitter in finger movement
function resetSmoothing(seedPosition?: { x: number; y: number }): void {
  smoothedDrawPosition = seedPosition ? { ...seedPosition } : null;
}

function getSmoothedPosition(position: { x: number; y: number }): { x: number; y: number } {
  if (!smoothedDrawPosition) {
    smoothedDrawPosition = { ...position };
    return smoothedDrawPosition;
  }
  smoothedDrawPosition = {
    x: smoothedDrawPosition.x + (position.x - smoothedDrawPosition.x) * SMOOTHING_ALPHA,
    y: smoothedDrawPosition.y + (position.y - smoothedDrawPosition.y) * SMOOTHING_ALPHA,
  };
  return smoothedDrawPosition;
}

// ---------- Drawing / Erasing ----------
function drawLine(currentPosition: { x: number; y: number }): void {
  if (!drawContext || !lastDrawPosition) return;
  const deltaX = currentPosition.x - lastDrawPosition.x;
  const deltaY = currentPosition.y - lastDrawPosition.y;

  // Skip drawing if finger moved too little (avoid clutter)
  if (deltaX * deltaX + deltaY * deltaY < MIN_DRAW_DISTANCE_SQUARED) return;

  drawContext.beginPath();
  drawContext.moveTo(lastDrawPosition.x, lastDrawPosition.y);
  drawContext.lineTo(currentPosition.x, currentPosition.y);
  drawContext.stroke();
}

// Erase a circular area using compositing mode
function eraseArea(position: { x: number; y: number }, radius: number = ERASER_RADIUS): void {
  if (!drawContext) return;
  drawContext.save();
  drawContext.globalCompositeOperation = "destination-out";
  drawContext.beginPath();
  drawContext.arc(position.x, position.y, radius, 0, Math.PI * 2);
  drawContext.fill();
  drawContext.restore();
}

// ---------- External API ----------
export function clearDrawing(): void {
  if (drawContext && drawCanvas) drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  hideEraserIndicator();
}

export function removeDrawing(): void {
  removeDrawCanvas();
  removeEraserIndicator();
}

export function isDrawModeEnabled(): boolean {
  return isDrawEnabled;
}
