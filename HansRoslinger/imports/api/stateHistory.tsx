

const stateHistory = [null, null, null, null, null];
var lastLoadTime = 0
var loadIndex = 0
var saveIndex = 0

function loadState() {
    if(time.current() - lastLoadTime > 1000) {
        loadIndex = 0
    }

    var state;
    if (loadIndex < saveIndex) {
        state = stateHistory[loadIndex]
        loadIndex = loadIndex + 1
        lastLoadTime = time.current()
    } else {
        state = null
    }
   
    return state
}

function saveState(state: any) {
    if(time.current() - lastLoadTime > 1000) {
        // Reset
        saveIndex = 0
    } 

    stateHistory[4] = stateHistory[3]
    stateHistory[3] = stateHistory[2]
    stateHistory[2] = stateHistory[1]
    stateHistory[1] = stateHistory[0]
    stateHistory[0] = state

    if (saveIndex < 5) {
        saveIndex = saveIndex + 1
    }
}
    