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

```env
CLOUDFLARE_STREAM_URL=https://stream.mydomain.com/hls/
```

---

## Struktur Aplikasi (Mermaid)

Berikut adalah struktur aplikasi saat ini dalam format Mermaid (HTML):

```html
<!-- paste this in mermaid.live or VSCode Mermaid Preview -->
<pre>
<code class="language-mermaid">
flowchart TD
  A[pages/index.tsx] -->|Landing| B[pages/watch/[streamId].tsx]
  A -->|Landing| C[pages/host.tsx]
  A -->|Landing| D[pages/custom-player.tsx]
  A -->|Landing| E[pages/webcam.tsx]
  A -->|Landing| F[pages/retro-terminal.tsx]
  B -->|Player| G[components/VideoPlayer.tsx]
  B -->|Chat| H[components/ChatBox.tsx]
  B -->|Chat| I[components/ChatBoxCustom.tsx]
  subgraph API
    J[pages/api/livepeer/create-stream.ts]
    K[pages/api/livepeer/list-streams.ts]
    L[pages/api/livepeer/stop-stream.ts]
    M[pages/api/livepeer/stream-status.ts]
  end
  C -->|Host| J
  C -->|Host| K
  C -->|Host| L
  C -->|Host| M
</code>
</pre>
```

---

Butuh automated test? Lihat dokumentasi Playwright/Cypress untuk contoh pengujian UI.
