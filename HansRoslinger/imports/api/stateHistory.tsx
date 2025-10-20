const stateHistory: any[] = [null, null, null, null, null];
const loadDelay = 250;
const loadLimit = 1000;
let lastLoadTime = 0;
let lastSaveTime = 0;
let loadIndex = 0;
let saveIndex = 0;

function saveState(state: any) {
    const now = Date.now();

    if (now - lastSaveTime < loadDelay) {
        console.log("Too soon to save state");
        return;
    }

    lastSaveTime = now;

    // Insert new state at the front, keep max 5 states
    stateHistory.unshift(state);
    stateHistory.length = 5;

    // Increment saveIndex up to the maximum
    saveIndex = Math.min(saveIndex + 1, 5);

    console.log("State saved");
}

function loadState() {
    const now = Date.now();

    // Throttle loads
    if (now - lastLoadTime < loadDelay) {
        console.log("Last load too recent - aborting");
        return null;
    }

    // Reset load index if too much time has passed since last load
    if (now - lastLoadTime > loadLimit) {
        loadIndex = 0;
        console.log("Resetting load index");
    }

    if (loadIndex >= saveIndex) {
        console.log("No state to load");
        return null;
    }

    const state = stateHistory[loadIndex];
    loadIndex++;
    lastLoadTime = now;

    console.log("State loaded");
    return state;
}

export { saveState, loadState };
