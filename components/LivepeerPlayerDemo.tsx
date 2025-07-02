import React from 'react';
import '@livepeer/player';

interface LivepeerPlayerDemoProps {
  playbackUrl: string;
}

const LivepeerPlayerDemo: React.FC<LivepeerPlayerDemoProps> = ({ playbackUrl }) => {
  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <livepeer-player
        src={playbackUrl}
        theme="auto"
        controls
        style={{ width: '100%', height: '360px' }}
        muted
        autoPlay
      />
    </div>
  );
};

export default LivepeerPlayerDemo;
