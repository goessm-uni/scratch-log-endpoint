const ActionLog = require('./models/actionlog')
const mongoose = require('mongoose')

function init(mongoString) {
    //Set up mongoose connection
    mongoose.connect(mongoString, function(err) {
        if (err) {
            console.log(`Error connecting to database: ${error}`)
        } else {
            console.log('Connected to database.')
        }
    });
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    initLogID()
}

function initLogID() {
    const query = ActionLog.model.find().sort({logId:-1}).limit(1)
    let max_id_doc = query.exec(function (err, result) {
        if (err) {
            console.log('Error retrieving log ID')
            return
        }
        if (!result || result.length<1 || result[0].logId == undefined) {
            ActionLog.setMaxLogID(0)
        } else {
            ActionLog.setMaxLogID(result[0].logId)
        }
    })
}

function saveActions(actions) {
    if (!Array.isArray(actions)) return
    for (const action of actions) {
        // Create documents and save actions
        const action_log_doc = new ActionLog.model(action)
        const error = action_log_doc.validateSync();
        if (error) {
            console.log(error)
            continue
        }
        const doc = ActionLog.model.create(action_log_doc)
    }
}

module.exports = {
    init: init,
    saveActions: saveActions
}
