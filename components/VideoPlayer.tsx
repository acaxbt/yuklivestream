import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  playbackUrl: string;
  startTime?: string; // ISO string, optional
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playbackUrl, startTime }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

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
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        sources: [
          {
            src: playbackUrl,
            type: 'application/x-mpegURL',
          },
        ],
      });
      playerRef.current.on('waiting', () => setIsWaiting(true));
      playerRef.current.on('playing', () => setIsWaiting(false));
      playerRef.current.on('error', () => setIsError(true));
      playerRef.current.on('loadeddata', () => setIsError(false));
    } else if (playerRef.current) {
      playerRef.current.src({ src: playbackUrl, type: 'application/x-mpegURL' });
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
