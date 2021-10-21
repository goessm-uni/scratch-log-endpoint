const ws = require('ws');
const express = require('express');
const addWebsocket = require('./src/websocket');
require('./src/util/verify-env').verifyEnv();
require('dotenv').config();

const port = process.env.PORT || 8000;
const app = express();
addWebsocket(app);

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
