const enableWs = require('express-ws');
const uuid = require('uuid');
const database = require('./database');
database.connect();
require('dotenv').config();

const path = '/logging';
const authKey = process.env.LOGGING_AUTH_KEY;
const pingInterval = 30000;
const connectionMap = new Map();


const pingWebSocket = function (ws) {
    ws.ping((err, _duration, _payload) => {
        if (err) {
            console.log(`Ping error to user ${ws.username}: ${err}`)
        } else {
            console.log(`Ping success to user ${ws.username}`)
        }
    })
};

const getUserId = function (wsConnection) {
    if (!wsConnection) return;
    let userId = uuid.v4();
    wsConnection.userId = userId
};

const broadcastUserId = function (wsConnection) {
    if (!wsConnection?.userId) return
    wsConnection.send(JSON.stringify({newUserId: wsConnection.userId}))
}

const handleMessage = function (msg, ws) {
    console.log('message received: ' + msg.toString())
    let message
    try {
        message = JSON.parse(msg)
    } catch (e) {
        console.log('message received was not valid JSON')
        return
    }
    // Check message for auth key
    if (!('authKey' in message && message.authKey === authKey)) {
        console.log('no valid auth in message')
        return
    }
    // Handle incoming actions
    if ('userActions' in message) {
        const actions = message.userActions
        // Add userId to actions
        for (const action of actions) action.userId = ws.userId
        let saveError = database.saveActions(actions)
        // Info: Response is sent before error can resolve, so error response will be sent in next message
        if (saveError) {
            ws.send(JSON.stringify({success: false, error: saveError}))
        } else {
            ws.send(JSON.stringify({success: true}))
        }
    }
}

const onConnection = function (ws, req) {
    if ('userId' in req.query) ws.userId = req.query.userId
    if (!ws.userId) getUserId(ws)
    connectionMap.set(ws.userId, ws)
    broadcastUserId(ws)
    console.log(`Websocket opened with user ${ws.userId}`)
    // Send ping to keep websocket alive
    ws.pingInterval = setInterval(pingWebSocket, pingInterval, ws)

    ws.on('message', msg => { handleMessage(msg, ws)})

    ws.on('close', () => {
        console.log(`Websocket closed with user ${ws.userId}`)
        clearInterval(ws.pingInterval)
        connectionMap.delete(ws.userId)
    })
};

module.exports = (expressApp) => {
    enableWs(expressApp);
    expressApp.ws(path, onConnection)
};

