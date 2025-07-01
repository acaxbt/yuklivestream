import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import VideoPlayer from '../../components/VideoPlayer';
import ChatBox from '../../components/ChatBox';
import axios from 'axios';

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/livepeer/stream-status?id=${id}`);
        setIsActive(res.data.isActive);
        setPlaybackUrl(`https://livepeercdn.com/hls/${res.data.playbackId}/index.m3u8`);
      } catch {
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Live Stream</h1>
      {loading ? (
        <div>Loading stream...</div>
      ) : isActive ? (
        <>
          <div className="w-full max-w-2xl mb-4">
            <VideoPlayer playbackUrl={playbackUrl} />
          </div>
          <div className="w-full max-w-2xl">
            <ChatBox streamId={id as string} />
          </div>
        </>
      ) : (
        <div>Stream belum mulai. Silakan tunggu...</div>
      )}
    </div>
  );
}
