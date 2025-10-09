
const stateHistory = [null, null, null, null, null];
const loadDelay = 250
const loadLimit = 1000
var lastLoadTime = 0
var loadIndex = 0
var saveIndex = 0


function loadState() {
    if(Date.now() - lastLoadTime > loadLimit) {
        loadIndex = 0
    } else if (Date.now() - lastLoadTime < loadDelay) {
        return
    }

    var state;
    if (loadIndex < saveIndex) {
        state = stateHistory[loadIndex]
        loadIndex = loadIndex + 1
        lastLoadTime = Date.now()
    } else {
        state = null
    }
   
    return state
}

function saveState(state: any) {
    if(loadIndex > 0 && Date.now() - lastLoadTime > loadLimit) {
        // Reset
        saveIndex = 0
        loadIndex = 0
    } else if (loadIndex > 0 && Date.now() - lastLoadTime < loadLimit) {
        return
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
    