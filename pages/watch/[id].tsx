import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ChatBox from '../../components/ChatBox';
import LivepeerReactPlayer from '../../components/LivepeerReactPlayer';
import axios from 'axios';
import { usePlaybackInfo } from '@livepeer/react';

export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [playbackId, setPlaybackId] = useState<string | null>(null);

  // Playback info dari player
  const { data: playbackInfo } = usePlaybackInfo({ playbackId: playbackId || undefined });
  useEffect(() => {
    if (playbackInfo) {
      console.log('Livepeer playbackInfo:', playbackInfo);
    }
  }, [playbackInfo]);

  useEffect(() => {
    if (!id) return;
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/livepeer/stream-status?id=${id}`);
        setIsActive(res.data.isActive);
        setPlaybackUrl(`https://playback.livepeer.studio/hls/${res.data.playbackId}/index.m3u8`);
        setPlaybackId(res.data.playbackId);
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
      {playbackId && (
        <div className="mb-2 text-sm text-gray-500">Playback ID: <span className="font-mono">{playbackId}</span></div>
      )}
      {loading ? (
        <div>Loading stream...</div>
      ) : isActive ? (
        <>
          <div className="w-full max-w-2xl mb-4 flex flex-col items-center">
            {playbackId && (
              <>
                <div className="w-full max-w-2xl aspect-video flex items-center justify-center">
                  <LivepeerReactPlayer playbackId={playbackId} autoPlay />
                </div>
                <div className="mt-2 text-xs text-gray-400 break-all w-full text-left">
                  HLS URL: <span className="font-mono">https://livepeercdn.studio/hls/{playbackId}/index.m3u8</span>
                </div>
              </>
            )}
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
