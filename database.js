const ActionLog = require('./models/actionlog');
const mongoose = require('mongoose');
require('dotenv').config();

const mongoString = process.env.MONGODB;
let unsavedActions = [];

function init() {
    //Set up mongoose connection
    mongoose.connect(mongoString, function(err) {
        if (err) {
            console.log(`Error connecting to database: ${err}`)
        } else {
            console.log('Connected to database.')
        }
    });
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    initLogID()
};

function initLogID() {
    if (!connectionReady()) return
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
};

function saveActions(actions) {
    if (!Array.isArray(actions)) return
    if (!connectionReady()) {
        console.error('error saving actions: No database connection')
        unsavedActions.push(...actions)
        console.log(`${unsavedActions.length} unsaved actions.`)
        init()
        return
    }
    actions.push(...unsavedActions);
    unsavedActions = [];
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
};

function connectionReady() {
    return mongoose.connection.readyState === mongoose.STATES.connected;
}

module.exports = {
    init: init,
    saveActions: saveActions
};
