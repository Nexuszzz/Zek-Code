const express = require('express');
const cors = require('cors');
const MQTT = require('mqtt');
const SSE = require('express-sse');

// Create Express app
const app = express();
const sse = new SSE();
app.use(cors());
app.use(express.json());

// Connect to MQTT broker
const mqttUrl = process.env.MQTT_URL || 'mqtt://test.mosquitto.org';
const client = MQTT.connect(mqttUrl);

let latestData = {};

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  // Subscribe to sensor topics
  client.subscribe('sensor/suhu');
  client.subscribe('sensor/kelembaban');
  client.subscribe('sensor/cahaya');
});

client.on('message', (topic, message) => {
  // Assume payload is JSON string
  try {
    const data = JSON.parse(message.toString());
    latestData[topic] = data;
    // Broadcast via SSE
    sse.send({ topic, data, time: new Date().toISOString() });
  } catch (err) {
    console.error('Invalid JSON', err);
  }
});

client.on('error', (err) => {
  console.error('MQTT Error:', err);
});

// SSE endpoint for clients
app.get('/events', sse.init);

// Publish command to topic
app.post('/control/:device', (req, res) => {
  const { device } = req.params;
  const payload = JSON.stringify(req.body);
  client.publish(`control/${device}`, payload);
  res.json({ status: 'ok' });
});

// Endpoint to get latest data snapshot
app.get('/data', (req, res) => {
  res.json(latestData);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('Server running on port', port);
});
