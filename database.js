const ActionLog = require('./models/actionlog');
const mongoose = require('mongoose');
require('dotenv').config();

const mongoString = process.env.MONGODB;
let unsavedActions = [];
let connecting = false;

/**
 * Establish mongoose connection
 */
function connect() {
    if (connectionReady()) return
    if (connecting) return
    connecting = true
    //let connectionTimeout = setTimeout(() => {connecting = false}, 5000)

    console.log('Trying to connect to database...')
    mongoose.connect(mongoString, function(err) {
        connecting = false
        //clearTimeout(connectionTimeout)
        if (err) {
            console.log(`Error connecting to database: ${err}`)
            setTimeout(connect, 5000) // Retry
        } else {
            console.log('Connected to database.')
            initLogID()
            mongoose.connection.on('error', (e) => {
                console.error(`MongoDB connection error: ${e}`)
            });
        }
    });
};

/**
 * Retrieve current maximum log ID from database
 */
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
        saveUnsavedActions()
    })
};

/**
 * Save all actions in given array to database.
 * @param actions
 * @returns {string|undefined} Error string or undefined if no error
 */
function saveActions(actions) {
    if (!Array.isArray(actions)) return('Invalid actions.')

    if (!connectionReady()) {
        unsavedActions.push(...actions)
        console.error('error saving actions: No database connection')
        console.log(`${unsavedActions.length} unsaved actions.`)
        connect()
        return('No database connection')
    }
    saveUnsavedActions()
    for (const action of actions) {
        // Create documents and save actions
        const action_log_doc = new ActionLog.model(action)
        const error = action_log_doc.validateSync();
        if (error) {
            console.log(error)
            continue
        }
        ActionLog.model.create(action_log_doc)
            .then(document => {
                console.log(`Saved document: ${document.get('type')}`)
            })
            .catch(error => {
                console.log(`Error saving document: ${error}`)
                unsavedActions.push(action)
            })
    }
};

/**
 * Save all unsaved actions that failed to save before
 */
function saveUnsavedActions() {
    if (!unsavedActions || unsavedActions.length === 0) return
    console.log(`Saving ${unsavedActions.length} unsaved actions.`)
    let actionsToSave = [...unsavedActions]
    unsavedActions = []
    saveActions(actionsToSave)
}

/**
 * @returns {boolean} Whether mongoose connection is ready
 */
function connectionReady() {
    return mongoose.connection.readyState === mongoose.STATES.connected;
}

module.exports = {
    connect: connect,
    connectionReady: connectionReady,
    saveActions: saveActions
};
