# Smart Farm IoT Dashboard

Proyek ini merupakan contoh aplikasi web untuk memantau dan mengendalikan kebun pintar secara real-time menggunakan MQTT. Backend dibangun dengan Node.js dan MQTT.js, sedangkan frontend menggunakan React dan Tailwind CSS.

## Menjalankan Aplikasi

1. Install dependensi backend:

   ```bash
   cd backend && npm install
   ```

2. Jalankan server backend:

   ```bash
   npm start
   ```

   Secara bawaan server akan berjalan pada port `3001` dan terhubung ke broker MQTT publik `mqtt://test.mosquitto.org`.

3. Buka browser dan akses `http://localhost:3001` untuk melihat dashboard.

## Struktur Folder

```
backend/   # Kode server Node.js
frontend/  # Berkas statis React dan Tailwind
```

## Contoh Payload MQTT

Lihat `backend/sample_payloads.json` untuk contoh data subscribe dan publish.
