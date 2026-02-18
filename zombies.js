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
import dotenv from 'dotenv';

dotenv.config();

const tenantId = process.env.TENANT_ID;
const oauth = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  audience: 'https://projects.synamedia.com',
  grant_type: 'client_credentials'
};

if (!tenantId || !oauth.client_id || !oauth.client_secret) {
  console.error('Missing required environment variables. Please set TENANT_ID, CLIENT_ID, and CLIENT_SECRET (e.g. in a .env file).');
  process.exit(1);
}

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
  sendGroupMessage(tenantId, req.body.groups, req.body.payload, "ZombieAlert");
  res.end();
});

async function getAccessToken() {
  let tokenResponse = await fetch("https://auth.synamedia.com/oauth/token", {
    method: "post",
    body: JSON.stringify(oauth),
    headers: {"Content-Type": "application/json"}
  });
  let json = await tokenResponse.json();
  return json.access_token;
}

let accessToken = await getAccessToken();
setInterval(async () => {
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.error('Failed to refresh access token:', err);
  }
}, 21600000);

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
