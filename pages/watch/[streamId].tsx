import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const SHAKA_CDN = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.7/shaka-player.compiled.js";

function loadShakaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.shaka) return resolve();
    const script = document.createElement("script");
    script.src = SHAKA_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    shaka?: any;
  }
}

const CLOUDFLARE_STREAM_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_URL || process.env.CLOUDFLARE_STREAM_URL || "https://stream.mydomain.com/hls/";

export default function WatchStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const router = useRouter();
  const { streamId } = router.query;

  useEffect(() => {
    if (!streamId) return;
    let player: any;
    let destroyed = false;
    async function setupPlayer() {
      await loadShakaScript();
      if (!window.shaka || !videoRef.current) return;
      player = new window.shaka.Player(videoRef.current);
      player.configure({
        streaming: {
          lowLatencyMode: true,
          bufferingGoal: 6,
          rebufferingGoal: 3,
          inaccurateManifestTolerance: 0,
        },
      });
      player.addEventListener("error", (e: any) => {
        // Optionally handle errors
      });
      try {
        await player.load(`${CLOUDFLARE_STREAM_URL}${streamId}/index.m3u8`);
        setPlayerReady(true);
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(() => setAutoplayFailed(true));
        }
      } catch (e) {
        setAutoplayFailed(true);
      }
    }
    setupPlayer();
    return () => {
      destroyed = true;
      if (player) player.destroy();
    };
  }, [streamId]);

  const handleManualPlay = () => {
    videoRef.current?.play();
    setAutoplayFailed(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-2xl font-bold text-white mb-4">Live Stream: {streamId}</h1>
      <div className="w-full max-w-3xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full bg-black"
          controls
          autoPlay
          playsInline
          muted
        />
      </div>
      {autoplayFailed && (
        <button
          onClick={handleManualPlay}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Play
        </button>
      )}
    </div>
  );
}
