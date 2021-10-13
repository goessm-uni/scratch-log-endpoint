const ws = require('ws');
const express = require('express');
const enableWs = require('express-ws');
require('dotenv').config();

const port = process.env.PORT || 8000;
const app = express();
const authKey = process.env.LOGGING_AUTH_KEY;

const verifyEnv = require('./verify-env');
verifyEnv();

enableWs(app);

let database = require('./database');
database.connect();

const pingWebSocket = function (ws) {
  ws.ping((err, _duration, _payload) => {
    if (err) {
      console.log(`Ping error to user ${ws.username}: ${err}`)
    } else {
      console.log(`Ping success to user ${ws.username}`)
    }
  })
}

app.ws('/logging', (ws, req) => {
  ws.username = req.query.username
  console.log(`Websocket opened with user ${ws.username}`)
  // Send ping to keep websocket alive
  ws.pingInterval = setInterval(pingWebSocket, 3000, ws)

  ws.on('message', msg => {
    console.log('message received: ' + msg.toString())
    if (msg === 'ping') ws.send('pong')
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
      let saveError = database.saveActions(actions)
      // Info: Response is sent before error can resolve, so error response will be sent in next message
      if (saveError) {
        ws.send(JSON.stringify({success: false, error: saveError}))
      } else {
        ws.send(JSON.stringify({success: true}))
      }
    }
  })

  ws.on('close', () => {
    console.log(`Websocket closed with user ${ws.username}`)
    clearInterval(ws.pingInterval)
  })
});

app.get('/', (req, res) => {
  res.send("I'm a little data endpoint :)")
});

const server = app.listen(port, () => {
  console.log(`Data endpoint listening on port ${port}!`)
});

process.on('exit', code => {
  console.log(`Process exited with code ${code}`)
});

module.exports = app;
