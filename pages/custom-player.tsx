import React, { useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import ChatBoxCustom from '../components/ChatBoxCustom';

export default function CustomPlayerPage() {
  const [url, setUrl] = useState('');
  const [playUrl, setPlayUrl] = useState('');
  const [streamId, setStreamId] = useState('');

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayUrl(url);
    // Ambil streamId dari url jika ada, atau random jika tidak
    const match = url.match(/\/hls\/(.+?)\//);
    setStreamId(match ? match[1] : Math.random().toString(36).substring(2, 10));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Custom HLS Player + Live Chat</h1>
      <form onSubmit={handlePlay} className="flex gap-2 mb-4 w-full max-w-xl">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Masukkan URL .m3u8 playback"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Play</button>
      </form>
      {playUrl && (
        <div className="w-full max-w-2xl">
          <VideoPlayer playbackUrl={playUrl} />
          <ChatBoxCustom streamId={streamId} simulate={true} />
        </div>
      )}
    </div>
  );
}
