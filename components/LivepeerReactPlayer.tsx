import React from "react";
import { Player, usePlaybackInfo } from "@livepeer/react";

interface LivepeerReactPlayerProps {
  playbackId: string;
  autoPlay?: boolean;
}

const LivepeerReactPlayer: React.FC<LivepeerReactPlayerProps> = ({ playbackId, autoPlay = true }) => {
  const { data: playbackInfo } = usePlaybackInfo({ playbackId });
  React.useEffect(() => {
    if (playbackInfo && Array.isArray((playbackInfo as any).source)) {
      console.log("Livepeer playbackInfo:", playbackInfo);
      (playbackInfo as any).source.forEach((src: any) => {
        console.log('Source:', src.hrn, '| type:', src.type, '| url:', src.url);
      });
    }
  }, [playbackInfo]);

  if (!playbackId) return <div>Playback ID tidak ditemukan</div>;
  return (
    <div style={{ width: "100%" }}>
      <Player
        playbackId={playbackId}
        autoPlay={autoPlay}
        muted={true}
        showPipButton
        showTitle={false}
        aspectRatio="16to9"
        controls={{ autohide: 3000 }}
      />
    </div>
  );
};

export default LivepeerReactPlayer;
