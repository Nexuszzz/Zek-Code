# Smart Farm IoT

Proyek ini menyediakan aplikasi web untuk memantau dan mengontrol Smart Farm secara real-time.

## Struktur Folder

- `backend/` - Server Node.js menggunakan MQTT.js dan Socket.io
- `frontend/` - Aplikasi React dengan Tailwind CSS

## Menjalankan Aplikasi

1. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Jalankan backend**
   ```bash
   npm start --prefix ../backend
   ```
3. **Jalankan frontend**
   ```bash
   npm run dev --prefix ../frontend
   ```

Backend akan terhubung ke broker MQTT publik (`broker.hivemq.com`) dan frontend akan menampilkan data sensor.

## Contoh Payload MQTT

- Data sensor (subscribe)
  ```json
  { "suhu": 28, "kelembaban": 70, "cahaya": 300 }
  ```
- Perintah kontrol (publish)
  ```json
  { "device": "pompa", "state": 1 }
  ```

## Fitur

- Dashboard responsif berbahasa Indonesia
- Grafik histori sensor menggunakan Chart.js
- Kontrol perangkat (Pompa, Lampu, Kipas) via MQTT
- Indikator status koneksi MQTT

