import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  playbackUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playbackUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

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

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered w-full h-64" />
    </div>
  );
};

export default VideoPlayer;
