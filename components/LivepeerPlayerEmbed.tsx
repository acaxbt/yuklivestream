import React from "react";

interface LivepeerPlayerEmbedProps {
  playbackId: string;
  aspectRatio?: string;
}

const LivepeerPlayerEmbed: React.FC<LivepeerPlayerEmbedProps> = ({ playbackId, aspectRatio = "16:9" }) => {
  if (!playbackId) return <div>Playback ID tidak ditemukan</div>;
  // Livepeer.tv embed URL
  const embedUrl = `https://lvpr.tv/?v=${playbackId}&autoplay=1&muted=0`;
  // Aspect ratio styling
  const [w, h] = aspectRatio.split(":").map(Number);
  const paddingTop = h && w ? `${(h / w) * 100}%` : "56.25%";

  return (
    <div style={{ position: "relative", width: "100%", paddingTop }}>
      <iframe
        src={embedUrl}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
        title="Livepeer Player"
      />
    </div>
  );
};

export default LivepeerPlayerEmbed;
