/**
 * GestureType
 * -----------
 * Enumerates all recognized hand gestures from the MediaPipe / custom detection.
 * Each gesture can be mapped to an application function.
 */
export enum GestureType {
  CLOSED_FIST, // All fingers curled: often used to cancel or filter
  I_LOVE_YOU, // Thumb, index, pinky extended: unused currently
  UNIDENTIFIED, // Gesture couldn't be classified: used for continuity logic
  OPEN_PALM, // All fingers extended: often used to clear or exit draw mode
  POINTING_UP, // Index finger pointing up (thumb/pinky may also be out): used for selection/hover
  THUMB_DOWN, // Thumbs down: currently unused
  THUMB_UP, // Thumbs up: currently unused
  VICTORY, // Index and middle finger up (peace sign): currently unused
  PINCH, // Pinch gesture: often used for click or interaction
  DOUBLE_PINCH, // Two-hand pinch: used for zoom
  TWO_FINGER_POINTING_LEFT, // Used for switching chart type
  TWO_FINGER_POINTING_RIGHT, // Used for switching dataset
  DRAW, // Thumb, pointer, and middle finger together: activates drawing mode
}

/**
 * FunctionType
 * ------------
 * Enumerates high-level application actions that gestures can trigger.
 */
export enum FunctionType {
  UNUSED, // Gesture is intentionally ignored
  SELECT, // Hover/selection functionality
  FILTER, // Apply chart filter
  CLEAR, // Clear chart or drawings
  ZOOM, // Zoom into chart
  SWITCH_CHART, // Switch between chart types
  SWITCH_DATA, // Switch between datasets
  CLICK, // Simulates a mouse click
  DRAW, // Activates drawing mode
}
