

const stateHistory = [null, null, null, null, null];
var stateRetrieved = true
var startTime = 0

function getState() {
    const state = stateHistory[0]

    stateHistory[0] = stateHistory[1]
    stateHistory[1] = stateHistory[2]
    stateHistory[2] = stateHistory[3]
    stateHistory[3] = stateHistory[4]
    stateHistory[4] = null

    stateRetrieved = true
    startTime = time.current()
    return state
}

function saveState() {
    if(stateRetrieved && time.current() - startTime > 1000) {
        stateHistory[0] = null
        stateHistory[1] = null
        stateHistory[2] = null
        stateHistory[3] = null
        stateHistory[4] = null
        stateRetrieved = false
    } else if (time.current() - startTime > 1000) {
        // Save
    }