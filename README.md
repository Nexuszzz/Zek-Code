# Smart Farm IoT Dashboard

This project contains a minimal example of a smart farm dashboard using React, Tailwind CSS and Node.js with MQTT.js.

## Struktur Folder
- `backend` – Express server yang menghubungkan ke broker MQTT dan menyediakan endpoint kontrol.
- `frontend` – Aplikasi React untuk menampilkan data sensor secara real-time dan mengontrol perangkat.

## Menjalankan Backend
```bash
cd backend
npm install
node server.js
```
Server akan berjalan di `http://localhost:3001` dan terkoneksi ke broker `mqtt://test.mosquitto.org`.

## Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Aplikasi dapat diakses di `http://localhost:5173`.

## Contoh Payload MQTT
- **Sensor** (`sensor/suhu`)
```json
{"value": 25}
```
- **Kontrol** (`control/pompa`)
```json
{"value": "ON"}
```

## Catatan
- UI menggunakan Bahasa Indonesia.
- Diagram 3D isometrik sederhana terdapat pada komponen `FarmIllustration`.
- Dashboard menampilkan status koneksi dan pembaruan terakhir.
