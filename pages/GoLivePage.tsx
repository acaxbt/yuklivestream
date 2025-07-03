import React, { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import axios from 'axios';

const DAILY_ROOM_URL = process.env.NEXT_PUBLIC_DAILY_ROOM_URL || '';
const LIVEPEER_RTMP_URL = process.env.NEXT_PUBLIC_LIVEPEER_RTMP_URL || '';
const LIVEPEER_STREAM_KEY = process.env.NEXT_PUBLIC_LIVEPEER_STREAM_KEY || '';

const GoLivePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const callObjectRef = useRef<DailyCall | null>(null); // useRef instead of useState
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil token otomatis sebelum join
  const getToken = async () => {
    try {
      const res = await axios.post('/api/daily/generate-token', {
        roomName: DAILY_ROOM_URL.split('/').pop(),
        isOwner: true,
      });
      return res.data.token;
    } catch (e: any) {
      setError('Gagal generate token: ' + (e?.message || JSON.stringify(e)));
      return null;
    }
  };

  // Start Daily call in send-only mode
  const startLive = async () => {
    setLoading(true);
    setError('');
    try {
      if (callObjectRef.current) {
        await callObjectRef.current.leave();
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
      const token = await getToken();
      if (!token) throw new Error('Token Daily tidak tersedia');
      const call = DailyIframe.createCallObject();
      callObjectRef.current = call;
      await call.join({
        url: DAILY_ROOM_URL,
        token,
        audioSource: true,
        videoSource: true,
      });
      setIsLive(true);
      // Start RTMP Out
      await call.startLiveStreaming({
        rtmpUrl: `${LIVEPEER_RTMP_URL}/${LIVEPEER_STREAM_KEY}`,
      });
    } catch (e: any) {
      setError(e?.message || JSON.stringify(e) || 'Failed to start live');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  // Stop Daily call and RTMP Out
  const stopLive = async () => {
    if (callObjectRef.current) {
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
      setIsLive(false);
    }
  };

  // Cleanup DailyIframe on unmount
  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
    };
  }, []);

  // Show local preview
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('getUserMedia tidak didukung di browser ini.');
      return;
    }
    let stream: MediaStream;
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: {
        sampleRate: 48000,
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true
      }
    })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Log video track settings
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('Kamera aktif. Resolusi:', settings.width + 'x' + settings.height, '| Frame rate:', settings.frameRate);
        }
      })
      .catch(() => setError('Tidak bisa akses kamera/mikrofon'));
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">Go Live (Daily + Livepeer)</h1>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center gap-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="rounded-lg w-full aspect-video bg-black border border-gray-700"
          style={{ maxHeight: 240 }}
        />
        {isLive && (
          <div className="flex items-center gap-2 text-red-500 font-bold text-base sm:text-lg">
            <span className="animate-pulse">●</span> LIVE
          </div>
        )}
        {error && <div className="text-red-400 text-xs sm:text-sm text-center break-words">{error}</div>}
        <button
          className={`w-full py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg ${isLive ? 'bg-red-600' : 'bg-green-600'} mt-2`}
          onClick={isLive ? stopLive : startLive}
          disabled={loading}
        >
          {loading ? 'Loading...' : isLive ? 'Stop Live' : 'Go Live'}
        </button>
      </div>
    </div>
  );
};

export default GoLivePage;
