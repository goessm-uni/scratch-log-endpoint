const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let maxLogId

// Sets the max log ID for sequential ID
// This only works assuming there is only one data endpoint
const setMaxLogID = function (max) {
    maxLogId = max
    console.log(`max log id set to ${maxLogId}`)
}

const ActionLogSchema = new Schema({
    logId: {type: Number},
    timestamp: {type: String, required: true},
    type: {type: String, required: true},
    data: {type: Object},
    codeState: {type: Object}
});

ActionLogSchema.pre('save', function(next) {
    assignLogID(this)
    next()
})

// Assign sequential log id to doc
function assignLogID(document) {
    if (maxLogId == undefined) return false
    document.logId = ++maxLogId
    return true
}

const actionLogModel = mongoose.model('ActionLog', ActionLogSchema)

//Export model
module.exports = {
    model: actionLogModel,
    setMaxLogID: setMaxLogID
}
