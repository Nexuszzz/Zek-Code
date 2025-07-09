import FarmIllustration from "./FarmIllustration";
import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt/dist/mqtt';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const [pumpOn, setPumpOn] = useState(false);
export default function App() {
  const [data, setData] = useState({ suhu: [], kelembaban: [], cahaya: [] });
  const [status, setStatus] = useState('Disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const client = mqtt.connect('wss://test.mosquitto.org:8081');

    client.on('connect', () => {
      setStatus('Connected');
      client.subscribe('sensor/suhu');
      client.subscribe('sensor/kelembaban');
      client.subscribe('sensor/cahaya');
    });

    client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());
      setData((prev) => {
        const newData = { ...prev };
        const key = topic.split('/')[1];
        newData[key] = [...prev[key], { t: Date.now(), v: payload.value }].slice(-20);
        return newData;
      });
      setLastUpdate(new Date().toLocaleTimeString());
    });

    client.on('error', (err) => {
      console.error('Connection error', err);
      setStatus('Error');
    });

    return () => client.end();
  }, []);

  const sendCommand = (device, value) => {
    if (device === "pompa") setPumpOn(value === "ON");
    fetch(`http://localhost:3001/control/${device}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tren Sensor' },
    },
  };

  const suhuData = {
    labels: data.suhu.map((d) => new Date(d.t).toLocaleTimeString()),
    datasets: [{ label: 'Suhu', data: data.suhu.map((d) => d.v), borderColor: 'red' }],
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Smart Farm</h1>
      <div className="mb-2">Status MQTT: {status}</div>
      <div className="mb-2">Pembaruan Terakhir: {lastUpdate}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <Line options={chartOptions} data={suhuData} />
        </div>
        <div className="bg-white p-4 rounded shadow flex flex-col space-y-2">
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded"
            onClick={() => sendCommand('pompa', 'ON')}
          >
            Nyalakan Pompa
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded"
            onClick={() => sendCommand('pompa', 'OFF')}
          >
            Matikan Pompa
          </button>
        </div>
          <FarmIllustration pumpOn={pumpOn} />
      </div>
    </div>
  );
}
