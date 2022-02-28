const ws = require('ws');
const express = require('express');
const addWebsocket = require('./src/websocket');
require('dotenv').config();
require('./src/util/verify-env').verifyEnv();

const port = process.env.PORT || 8000;
const app = express();

// Add custom websocket from src/websocket to app
addWebsocket(app);

app.get('/', (req, res) => {
  res.send("I'm a little data endpoint :)")
});

// actionlog routes
require('./src/routes/actionlog.routes')(app);

const server = app.listen(port, () => {
  console.log(`Data endpoint listening on port ${port}!`)
});

process.on('exit', code => {
  console.log(`Process exited with code ${code}`)
});

module.exports = app;
