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
database.init();

app.ws('/logging', (ws, req) => {
  ws.on('open', () => {
    console.log('Websocket connection opened.')
  })

  ws.on('message', msg => {
    console.log('message received: ' + msg.toString())
    if (msg === 'ping') ws.send('pong')
    const message = JSON.parse(msg)
    // Check message for auth key
    if (!('authKey' in message && message.authKey === authKey)) {
      console.log('no valid auth in message')
      return
    }
    if ('userActions' in message) {
      const actions = message.userActions
      database.saveActions(actions)
    }
  })

  ws.on('close', () => {
    console.log('WebSocket was closed')
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
