import React, { useEffect } from 'react';

interface LivepeerPlayerCDNProps {
  playbackUrl: string;
}

const LivepeerPlayerCDN: React.FC<LivepeerPlayerCDNProps> = ({ playbackUrl }) => {
  useEffect(() => {
    if (!window.customElements.get('livepeer-player')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@livepeer/player@latest/dist/index.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  return (
    <livepeer-player
      src={playbackUrl}
      theme="auto"
      controls
      style={{ width: '100%', height: '360px' }}
      muted
      autoPlay
    />
  );
};

export default LivepeerPlayerCDN;
