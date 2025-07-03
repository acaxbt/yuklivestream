import React, { useEffect, useState } from "react";
import * as Player from "@livepeer/react/player";
import { getSrc } from "@livepeer/react/external";

interface LivepeerPlayerProps {
  playbackId: string;
}

// Helper to fetch playback info and get src (mocked fetch, replace with real API if needed)
async function getPlaybackSource(playbackId: string) {
  // TODO: Ganti dengan fetch ke API backend Anda jika ingin SSR/keamanan
  const res = await fetch(`https://livepeer.studio/api/playback/${playbackId}`);
  const playbackInfo = await res.json();
  return getSrc(playbackInfo.playbackInfo);
}

const LivepeerPlayer: React.FC<LivepeerPlayerProps> = ({ playbackId }) => {
  const [src, setSrc] = useState<any>(null);

  useEffect(() => {
    getPlaybackSource(playbackId).then(setSrc);
  }, [playbackId]);

  if (!src) return <div className="text-white">Loading player...</div>;

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <Player.Root src={src}>
        <Player.Container>
          <Player.Video title="Live stream" className="w-full h-auto max-h-[80vh] rounded-lg border border-gray-700" />
          <Player.Controls className="flex items-center justify-center mt-2">
            <Player.PlayPauseTrigger className="w-10 h-10" />
            <Player.MuteTrigger className="w-10 h-10 ml-2" />
            <Player.FullscreenTrigger className="w-10 h-10 ml-2" />
          </Player.Controls>
        </Player.Container>
      </Player.Root>
    </div>
  );
};

export default LivepeerPlayer;
