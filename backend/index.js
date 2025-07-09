const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');

// ===== Konfigurasi dasar =====
const MQTT_URL = process.env.MQTT_URL || 'mqtt://test.mosquitto.org';
const PORT = process.env.PORT || 3001;

// Membuat aplikasi Express dan server HTTP
const app = express();
const server = http.createServer(app);

// WebSocket digunakan untuk mengirim data real-time ke frontend
const wss = new WebSocket.Server({ server });

// Melayani berkas frontend secara statis
app.use(express.static(__dirname + '/../frontend/public'));

// Menyimpan nilai sensor terkini
const latest = {
  suhu: null,
  kelembaban: null,
  cahaya: null,
  lastUpdate: null,
};

// Koneksi ke broker MQTT
const mqttClient = mqtt.connect(MQTT_URL);

// Callback saat koneksi MQTT berhasil
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  // Berlangganan topik sensor
  mqttClient.subscribe(['sensor/suhu', 'sensor/kelembaban', 'sensor/cahaya']);
});

// Kesalahan koneksi MQTT
mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

// Menerima pesan dari broker MQTT
mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  if (topic === 'sensor/suhu') {
    latest.suhu = parseFloat(payload);
  } else if (topic === 'sensor/kelembaban') {
    latest.kelembaban = parseFloat(payload);
  } else if (topic === 'sensor/cahaya') {
    latest.cahaya = parseFloat(payload);
  }
  latest.lastUpdate = new Date().toISOString();
  // Kirim nilai terbaru ke semua client WebSocket
  broadcast({ type: 'sensor', data: latest });
});

// Mengirim pesan ke semua client WebSocket yang terhubung
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Middleware untuk parsing JSON
app.use(express.json());

// Control endpoints to send MQTT commands
// Endpoint mengirim perintah kontrol ke perangkat
app.post('/api/control/:device', (req, res) => {
  const { device } = req.params;
  const { state } = req.body;
  const topicMap = {
    pompa: 'control/pompa',
    lampu: 'control/lampu',
    kipas: 'control/kipas',
  };
  const topic = topicMap[device];
  if (!topic) return res.status(400).json({ error: 'Perangkat tidak dikenal' });

  mqttClient.publish(topic, state ? 'ON' : 'OFF');
  broadcast({ type: 'control', device, state });
  res.json({ ok: true });
});

// Endpoint status untuk mengetahui koneksi MQTT
app.get('/api/status', (req, res) => {
  res.json({ mqttConnected: mqttClient.connected, latest });
});

// Menjalankan server HTTP
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
