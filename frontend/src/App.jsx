import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Title, Tooltip);

const socket = io('http://localhost:3001');

export default function App() {
  const [sensor, setSensor] = useState({ suhu: 0, kelembaban: 0, cahaya: 0, time: '' });
  const [status, setStatus] = useState('offline');
  const [history, setHistory] = useState([]);
  const [deviceState, setDeviceState] = useState({ pump: false, lamp: false, fan: false });

  useEffect(() => {
    socket.on('sensor', (data) => {
      setSensor(data);
      setHistory((h) => [...h.slice(-19), { ...data }]);
    });
    socket.on('status', (data) => setStatus(data.mqtt));
  }, []);

  const handleControl = (device, state) => {
    socket.emit("control", { device, state });
    setDeviceState((s) => ({ ...s, [device]: state === 1 }));
  };

  const chartData = {
    labels: history.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: 'Suhu',
        data: history.map((d) => d.suhu),
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
      },
      {
        label: 'Kelembaban',
        data: history.map((d) => d.kelembaban),
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
      },
      {
        label: 'Cahaya',
        data: history.map((d) => d.cahaya),
        borderColor: 'rgb(255, 206, 86)',
        fill: false,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard Smart Farm</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Data Sensor Terbaru</h2>
          <p>Suhu: {sensor.suhu}&deg;C</p>
          <p>Kelembaban Tanah: {sensor.kelembaban}%</p>
          <p>Cahaya: {sensor.cahaya} lux</p>
          <p className="text-sm text-gray-500">Update: {new Date(sensor.time).toLocaleString()}</p>
          <p className="mt-2">Status MQTT: <span className={status === 'online' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <Line data={chartData} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-4">
        <h2 className="font-semibold mb-2">Kontrol Perangkat</h2>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => handleControl('pump', 1)}
          >
            Pompa ON
          </button>
          <button
            className="px-3 py-1 bg-gray-400 text-white rounded"
            onClick={() => handleControl('pump', 0)}
          >
            Pompa OFF
          </button>
          <button
            className="px-3 py-1 bg-yellow-500 text-white rounded"
            onClick={() => handleControl('lamp', 1)}
          >
            Nyalakan Lampu
          </button>
          <button
            className="px-3 py-1 bg-gray-400 text-white rounded"
            onClick={() => handleControl('lamp', 0)}
          >
            Matikan Lampu
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={() => handleControl('fan', 1)}
          >
            Kipas ON
          </button>
          <button
            className="px-3 py-1 bg-gray-400 text-white rounded"
            onClick={() => handleControl('fan', 0)}
          >
            Kipas OFF
          </button>
        </div>
      </div>

      <div className="mt-4">
        <svg viewBox="0 0 200 100" className="w-full h-48">
          {/* Simple 3D isometric farm illustration */}
          <rect x="20" y="50" width="60" height="40" fill="#c6f6d5" />
          <rect x="90" y="40" width="80" height="50" fill="#a0aec0" />
          {deviceState.pump && <circle cx="50" cy="70" r="5" fill="blue" />}
        </svg>
      </div>
    </div>
  );
}

