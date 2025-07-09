// Smart Farm Backend Server
// Connects to MQTT broker and communicates with frontend via WebSocket

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const SENSOR_TOPICS = ['sensor/suhu', 'sensor/kelembaban', 'sensor/cahaya'];
const CONTROL_TOPICS = {
  pump: 'control/pompa',
  lamp: 'control/lampu',
  fan: 'control/fan',
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Store latest sensor values
const sensorData = {
  suhu: 0,
  kelembaban: 0,
  cahaya: 0,
};

let mqttClient;
let mqttConnected = false;

// Connect to MQTT broker
function initMQTT() {
  mqttClient = mqtt.connect(MQTT_BROKER);

  mqttClient.on('connect', () => {
    mqttConnected = true;
    console.log('MQTT connected');
    SENSOR_TOPICS.forEach((topic) => mqttClient.subscribe(topic));
    io.emit('status', { mqtt: 'online' });
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT Error:', err.message);
  });

  mqttClient.on('offline', () => {
    mqttConnected = false;
    io.emit('status', { mqtt: 'offline' });
  });

  mqttClient.on('message', (topic, message) => {
    const value = Number(message.toString());
    if (topic === 'sensor/suhu') sensorData.suhu = value;
    if (topic === 'sensor/kelembaban') sensorData.kelembaban = value;
    if (topic === 'sensor/cahaya') sensorData.cahaya = value;
    sensorData.time = new Date().toISOString();
    io.emit('sensor', sensorData); // send data to clients
  });
}

initMQTT();

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('sensor', sensorData);
  socket.emit('status', { mqtt: mqttConnected ? 'online' : 'offline' });

  socket.on('control', ({ device, state }) => {
    const topic = CONTROL_TOPICS[device];
    if (topic) {
      mqttClient.publish(topic, String(state));
    }
  });
});

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mqtt: mqttConnected });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
