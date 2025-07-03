import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/livepeer/list-streams').then(res => {
      setStreams(res.data.filter((s: any) => s.isActive));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Yuk Livestream</h1>
      <Link href="/host" className="mb-2 text-blue-600 underline">Host Stream</Link>
      <Link href="/GoLivePage" className="mt-2 text-green-600 underline font-semibold">Go Live (Daily + Livepeer)</Link>
      <div className="flex gap-4 mt-4 mb-2">
        <Link href="/custom-player" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold hover:bg-blue-200 transition">Custom Player</Link>
        <Link href="/retro-terminal" className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold hover:bg-green-200 transition">Retro Terminal</Link>
        <Link href="/watch/4c01af48-0116-459c-9a8f-13c7b33a5462" className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold hover:bg-yellow-200 transition">Contoh Watch</Link>
      </div>
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Active Streams</h2>
        {loading ? (
          <div>Loading...</div>
        ) : streams.length === 0 ? (
          <div className="text-gray-500">No active streams.</div>
        ) : (
          <ul className="space-y-2">
            {streams.map((s) => (
              <li key={s.id} className="bg-white rounded shadow p-3 flex flex-col">
                <span className="font-bold">{s.name || s.playbackId}</span>
                <span className="text-xs text-gray-500 mb-1">{new Date(s.createdAt).toLocaleString()}</span>
                <Link href={`/watch/${s.playbackId}`} className="text-blue-600 underline">Watch</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
