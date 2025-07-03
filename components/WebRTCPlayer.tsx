import React, { useEffect, useRef, useState } from 'react';

interface WebRTCPlayerProps {
  playbackUrl: string;
}

// Helper untuk membentuk URL WHEP dari playbackUrl HLS
const getWhepUrl = (playbackUrl: string) => {
  const match = playbackUrl.match(/\/([a-zA-Z0-9_-]+)\/index\.m3u8/);
  const playbackId = match ? match[1] : '';
  // Ganti endpoint sesuai region/project Livepeer jika perlu
  return `wss://whep.livepeer.studio/stream/${playbackId}`;
};

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ playbackUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pc: RTCPeerConnection | null = null;
    let ws: WebSocket | null = null;
    let closed = false;

    async function startWebRTC() {
      try {
        const whepUrl = getWhepUrl(playbackUrl);
        ws = new WebSocket(whepUrl);
        pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        };
        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          if (data.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws?.send(JSON.stringify({ sdp: pc.localDescription }));
          }
        };
        ws.onopen = async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws?.send(JSON.stringify({ sdp: pc.localDescription }));
        };
        ws.onerror = () => setError('WebRTC connection error');
      } catch (e) {
        setError('WebRTC playback failed');
      }
    }
    startWebRTC();
    return () => {
      closed = true;
      ws?.close();
      pc?.close();
    };
  }, [playbackUrl]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} autoPlay playsInline controls className="w-full h-64 bg-black" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">{error}</div>
      )}
    </div>
  );
};

export default WebRTCPlayer;
