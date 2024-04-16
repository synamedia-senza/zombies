// Zombies
// Andrew Zamler-Carhart

// To run the server:
// HOSTNAME=localhost PORT=8080 node zombies.js
// or just:
// node zombies.js

import fetch from 'node-fetch';
import express from 'express';
import errorHandler from 'errorhandler';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.json' with {type: "json"};

let app = express();
let hostname = process.env.HOSTNAME || 'localhost';
let port = parseInt(process.env.PORT, 10) || 8080;
let publicDir = path.dirname(fileURLToPath(import.meta.url)) + '/public';

app.use(express.static(publicDir));
app.use(express.json());
app.use(errorHandler({dumpExceptions: true, showStack: true}));
app.listen(port);

console.log("Zombies server running at " + hostname + ":" + port);

app.post('/message', function (req, res) {
  console.log(req.body);
  sendGroupMessage(config.tenantId, req.body.groups, req.body.payload, "ZombieAlert");
  res.end();
});

async function getAcesssToken() {
  let tokenResponse = await fetch("https://auth.synamedia.com/oauth/token", {
  	method: "post",
  	body: JSON.stringify(config.oauth),
  	headers: {"Content-Type": "application/json"}
  });
  let json = await tokenResponse.json();
  return json.access_token;
}

let accessToken = await getAcesssToken();
setTimeout(() => accessToken = getAccessToken(), 21600000);

async function sendGroupMessage(tenantId, groups, payload, eventName) {
  let res = await fetch("https://hyperscale-message-broker-main.ingress.active.streaming.synamedia.com/" + 
    "message-broker/1.0/messages/tenant/" + tenantId + "/groups/app", {
  	method: "post",
  	body: JSON.stringify({groups, payload, eventName}),
  	headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken
    }
  });
  console.log(res.status);
}

async function sendDeviceMessage(deviceId, payload, eventName) {
  let res = await fetch("https://hyperscale-message-broker-main.ingress.active.streaming.synamedia.com/" + 
    "message-broker/1.0/messages/devices/" + deviceId, {
  	method: "post",
  	body: JSON.stringify({
      payload, 
      eventName, 
      "target": "application",
      "origin": "internal"
    }),
  	headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken
    }
  });
  console.log(res.status);
}
