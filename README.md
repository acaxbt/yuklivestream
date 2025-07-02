# Serverless Twitch-like Livestream App

## 📺 Fitur Streaming Low Latency

Halaman `/watch/[streamId].tsx` memungkinkan Anda menonton livestream dengan latensi rendah menggunakan Shaka Player dan LL-HLS.

### Cara Testing Halaman Streaming

1. **Jalankan Development Server**
   ```sh
   npm run dev
   # atau
   yarn dev
   ```
2. **Akses Halaman Streaming**
   Buka browser ke:
   ```
   http://localhost:3000/watch/[streamId]
   ```
   Ganti `[streamId]` dengan ID stream aktif Anda.
3. **Cek Fitur**
   - Video player muncul dan mencoba memutar stream.
   - Jika autoplay gagal, tombol “Play” akan muncul.
   - Playback berjalan real-time (low latency).
4. **Cek Konsol Browser**
   - Lihat error Shaka Player atau network jika ada masalah.
5. **Uji Responsif**
   - Resize window dan cek tampilan player di berbagai ukuran layar.

### Konfigurasi Lingkungan

Tambahkan ke `.env.local`:
```
CLOUDFLARE_STREAM_URL=https://stream.mydomain.com/hls/
```

---

Butuh automated test? Lihat dokumentasi Playwright/Cypress untuk contoh pengujian UI.
