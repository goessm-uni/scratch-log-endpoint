# scratch-log-endpoint

A data endpoint for logging-scratch-gui.

## Installation
Create a .env file in the main directory containing the following keys:
```bash
MONGODB: [your mongodb connection url]
LOGGING_AUTH_KEY: [websocket auth key defined in your scratch-log-sender]
SECRETTOKEN: [token used by your replay-scratch-gui, if used]
```
Then start the endpoint with
```bash
node index.js
```
