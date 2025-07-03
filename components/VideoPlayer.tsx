import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  playbackUrl: string;
  startTime?: string; // ISO string, optional
}

const getLLHLSUrl = (url: string) => {
  // Ganti /hls/ menjadi /llhls/ jika ditemukan, atau tambahkan /llhls/ jika belum ada
  if (url.includes('/hls/')) {
    return url.replace('/hls/', '/llhls/');
  }
  // Jika sudah /llhls/, biarkan
  if (url.includes('/llhls/')) {
    return url;
  }
  // Fallback: coba tambahkan /llhls/ sebelum playbackId
  return url.replace(/(\/)([a-zA-Z0-9_-]+)(\/index\.m3u8)/, '/hls/$2/index.m3u8');
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playbackUrl, startTime }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null); // Tambah state latency

  // Countdown logic
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diff = start.getTime() - now.getTime();
      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else {
        setCountdown(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    let triedFallback = false;
    let player;
    const llhlsUrl = getLLHLSUrl(playbackUrl);
    const hlsUrl = playbackUrl;
    function setupPlayer(srcUrl: string) {
      if (videoRef.current) {
        player = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          sources: [
            {
              src: srcUrl,
              type: 'application/x-mpegURL',
            },
          ],
          html5: {
            vhs: {
              liveSyncDuration: 2,
              maxBufferLength: 4,
              maxLiveSyncPlaybackRate: 1.1,
              enableLowInitialPlaylist: true,
            },
          },
        });
        playerRef.current = player;
        player.on('waiting', () => setIsWaiting(true));
        player.on('playing', () => setIsWaiting(false));
        player.on('error', () => {
          setIsError(true);
          // Fallback ke HLS jika LL-HLS gagal dan belum pernah fallback
          if (!triedFallback && srcUrl === llhlsUrl) {
            triedFallback = true;
            player.src({ src: hlsUrl, type: 'application/x-mpegURL' });
            setIsError(false);
          }
        });
        player.on('loadeddata', () => setIsError(false));
      }
    }
    if (videoRef.current && !playerRef.current) {
      setupPlayer(llhlsUrl);
    } else if (playerRef.current) {
      playerRef.current.src({ src: llhlsUrl, type: 'application/x-mpegURL' });
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [playbackUrl]);

  useEffect(() => {
    setShowOverlay(isWaiting || isError || !!countdown);
  }, [isWaiting, isError, countdown]);

  // Latency checker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playerRef.current) {
      interval = setInterval(() => {
        try {
          // Ambil currentTime player (waktu video yang sedang diputar)
          const video = playerRef.current.el().querySelector('video');
          if (video) {
            // Estimasi waktu server: gunakan Date.now() (UTC ms)
            // Estimasi waktu player: currentTime (detik) + (startTime jika ada)
            let playerTime = video.currentTime;
            let serverNow = Date.now() / 1000; // detik
            if (startTime) {
              // Jika stream ada startTime (ISO), tambahkan ke currentTime
              const startEpoch = new Date(startTime).getTime() / 1000;
              playerTime = startEpoch + video.currentTime;
            }
            // Latency = serverNow - playerTime
            const estLatency = serverNow - playerTime;
            if (estLatency > 0 && estLatency < 120) {
              setLatency(estLatency);
            } else {
              setLatency(null);
            }
          }
        } catch {}
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, playbackUrl, showOverlay]);

  // PIP handler
  const handlePip = () => {
    if (videoRef.current && videoRef.current.requestPictureInPicture) {
      videoRef.current.requestPictureInPicture();
    }
  };

  return (
    <div data-vjs-player className="relative w-full h-full">
      <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-64" />
      {showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 text-white text-center">
          {countdown ? (
            <>
              <div className="text-lg font-semibold mb-2">Stream belum dimulai</div>
              <div className="text-3xl font-bold tracking-widest">{countdown}</div>
            </>
          ) : isError ? (
            <div className="text-lg font-semibold">Stream belum dimulai</div>
          ) : isWaiting ? (
            <div className="text-lg font-semibold animate-pulse">Buffering...</div>
          ) : null}
        </div>
      )}
      {/* Indikator Latency */}
      {latency !== null && (
        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded text-xs z-30">
          Latency: {latency.toFixed(1)} detik
        </div>
      )}
      {/* PIP Button */}
      <button
        className="absolute bottom-3 right-3 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow z-30"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={handlePip}
        title="Picture in Picture"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2"/>
          <rect x="13" y="13" width="6" height="4" rx="1" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
};

export default VideoPlayer;
