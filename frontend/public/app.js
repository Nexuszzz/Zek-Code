// Komponen React untuk dashboard
const { useState, useEffect } = React;

function Dashboard() {
  const [data, setData] = useState({ suhu: null, kelembaban: null, cahaya: null, lastUpdate: null });
  const [status, setStatus] = useState('disconnect');
  const [chartData, setChartData] = useState({ labels: [], suhu: [], kelembaban: [], cahaya: [] });
  // Status ON/OFF setiap perangkat
  const [deviceStatus, setDeviceStatus] = useState({ pompa: false, lampu: false, kipas: false });

  // Membuka koneksi WebSocket ke backend
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onopen = () => setStatus('connect');
    ws.onclose = () => setStatus('disconnect');
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'sensor') {
        setData(msg.data);
        setChartData(prev => ({
          labels: [...prev.labels, new Date(msg.data.lastUpdate).toLocaleTimeString()],
          suhu: [...prev.suhu, msg.data.suhu],
          kelembaban: [...prev.kelembaban, msg.data.kelembaban],
          cahaya: [...prev.cahaya, msg.data.cahaya],
        }));
      }
      if (msg.type === 'control') {
        setDeviceStatus(prev => ({ ...prev, [msg.device]: msg.state })); // update indikator perangkat
      }
    };
    return () => ws.close();
  }, []);

  // Membuat grafik setiap ada data baru
  useEffect(() => {
    if (chartData.labels.length === 0) return;
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          { label: 'Suhu (°C)', data: chartData.suhu, borderColor: 'red', fill: false },
          { label: 'Kelembaban (%)', data: chartData.kelembaban, borderColor: 'green', fill: false },
          { label: 'Cahaya (lux)', data: chartData.cahaya, borderColor: 'orange', fill: false },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });
  }, [chartData]);

  // Mengirim perintah kontrol ke backend
  const sendControl = (device, state) => {
    fetch(`/api/control/${device}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  };

  return (
    React.createElement('div', { className: 'p-4' },
      React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, 'Dashboard Smart Farm'),
      React.createElement('img', { src: './smartfarm.svg', className: 'w-48 mb-4', alt: 'Farm' }),
      React.createElement('div', { className: 'mb-2' }, `Status Koneksi: ${status}`),
      React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-4' },
        ['suhu', 'kelembaban', 'cahaya'].map(key =>
          React.createElement('div', { key, className: 'bg-white p-4 rounded shadow' },
            React.createElement('h2', { className: 'font-semibold' }, key.charAt(0).toUpperCase() + key.slice(1)),
            React.createElement('p', { className: 'text-xl' }, data[key] !== null ? data[key] : '-')
          )
        )
      ),
      React.createElement('canvas', { id: 'chart', height: '100' }),
      // Indikator status perangkat
      React.createElement('div', { className: 'my-4 grid grid-cols-3 gap-4' },
        Object.entries(deviceStatus).map(([k, v]) =>
          React.createElement('div', { key: k, className: 'p-2 bg-white rounded shadow text-center' },
            React.createElement('p', null, k.charAt(0).toUpperCase() + k.slice(1)),
            React.createElement('span', {
              className: v ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
            }, v ? 'ON' : 'OFF')
          )
        )
      ),
      React.createElement('div', { className: 'mt-4 grid grid-cols-3 gap-2' },
        React.createElement('button', {
          onClick: () => sendControl('pompa', true),
          className: 'bg-blue-500 text-white p-2 rounded'
        }, 'Nyalakan Pompa'),
        React.createElement('button', {
          onClick: () => sendControl('lampu', true),
          className: 'bg-yellow-500 text-white p-2 rounded'
        }, 'Nyalakan Lampu'),
        React.createElement('button', {
          onClick: () => sendControl('kipas', true),
          className: 'bg-green-500 text-white p-2 rounded'
        }, 'Nyalakan Kipas'),
        React.createElement('button', {
          onClick: () => sendControl('pompa', false),
          className: 'bg-gray-500 text-white p-2 rounded'
        }, 'Matikan Pompa'),
        React.createElement('button', {
          onClick: () => sendControl('lampu', false),
          className: 'bg-gray-700 text-white p-2 rounded'
        }, 'Matikan Lampu'),
        React.createElement('button', {
          onClick: () => sendControl('kipas', false),
          className: 'bg-gray-900 text-white p-2 rounded'
        }, 'Matikan Kipas')
      ),
      React.createElement('p', { className: 'mt-4 text-sm' }, `Pembaruan Terakhir: ${data.lastUpdate || '-'}`)
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Dashboard));
