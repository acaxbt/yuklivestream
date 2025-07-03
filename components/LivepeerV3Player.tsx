import React from "react";
import { Player } from "@livepeer/react";

interface LivepeerV3PlayerProps {
  playbackUrl?: string;
  playbackId?: string;
}

const LivepeerV3Player: React.FC<LivepeerV3PlayerProps> = ({ playbackUrl, playbackId }) => {
  // Prioritaskan playbackId jika ada, fallback ke playbackUrl
  const id = playbackId || (playbackUrl ? playbackUrl.split("/")[5] : undefined);
  if (!id) return <div>Playback ID tidak ditemukan</div>;
  return (
    <div style={{ width: "100%" }}>
      <Player
        playbackId={id}
        autoPlay
        controls
        theme={{
          borderRadius: 8,
          colors: {
            accent: '#6366f1',
            containerBorderColor: '#e5e7eb',
          },
        }}
        objectFit="contain"
        aspectRatio="16to9"
        title="Livepeer v3 Player"
      />
      <div className="mt-2 text-xs text-gray-400 break-all">
        [v3] Playback ID: <span className="font-mono">{id}</span>
      </div>
    </div>
  );
};

export default LivepeerV3Player;
