const ActionLog = require('../models/actionlog');
const mongoose = require('mongoose');
require('dotenv').config();

const mongoString = process.env.MONGODB;
const retryDelay = 5000;

let unsavedActions = [];
let connecting = false;
let reconnectTimer;
let changeStream;

/**
 * Establish mongoose connection to database.
 * Reconnects
 */
function connect() {
    clearTimeout(reconnectTimer)
    reconnectTimer = null

    if (connectionReady()) return
    if (connecting) return
    connecting = true;

    console.log('Trying to connect to database...')
    mongoose.connect(mongoString, function(err) {
        connecting = false
        if (err) {
            console.log(`Error connecting to database: ${err}. Retrying in ${retryDelay}ms`)
            _reconnect()
            return
        }
        console.log('Connected to database.')
        initLogID()
        mongoose.connection.on('error', (e) => {
            console.error(`MongoDB connection error: ${e}`)
            _reconnect()
        });
        // Update max log ID on delete by listening to change stream.
        // Note that change streams are only available on replica sets and sharded clusters.
        changeStream = ActionLog.model.watch().on('change', data => {
            if (data.ns.coll !== 'actionlogs') return
            if (data.operationType === 'delete') initLogID()
        })
    });
};

function _reconnect() {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(connect, retryDelay)
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
        if (!result || result.length<1 || !result[0].logId) {
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
