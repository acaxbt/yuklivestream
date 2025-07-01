import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface StreamInfo {
  id: string;
  streamKey: string;
  playbackId: string;
  ingestUrl: string;
  playbackUrl: string;
}

const HOST_INGEST_URL = 'rtmp://rtmp.livepeer.com/live';
const USD_TO_IDR = 16000; // kurs estimasi, bisa diubah sesuai kurs terbaru
const COST_PER_MINUTE = 0.005; // USD, contoh estimasi

export default function HostPage() {
  const [stream, setStream] = useState<StreamInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [costIdr, setCostIdr] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update cost setiap 5 detik jika stream aktif
  useEffect(() => {
    if (stream && status !== 'Stopped') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (startTime) {
          const minutes = Math.ceil(((Date.now() - startTime) / 1000) / 60);
          const usd = minutes * COST_PER_MINUTE;
          setCost(usd);
          setCostIdr(usd * USD_TO_IDR);
        }
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stream, status, startTime]);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await axios.get('/api/livepeer/list-streams');
        setHistory(res.data);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const createStream = async () => {
    setLoading(true);
    setError('');
    setStatus('');
    setStartTime(Date.now());
    setEndTime(null);
    setCost(0);
    setCostIdr(0);
    try {
      const res = await axios.post('/api/livepeer/create-stream', { name: 'My Live Stream' });
      const data = res.data;
      setStream({
        id: data.id,
        streamKey: data.streamKey,
        playbackId: data.playbackId,
        ingestUrl: HOST_INGEST_URL,
        playbackUrl: `https://livepeercdn.com/hls/${data.playbackId}/index.m3u8`,
      });
      pollStatus(data.id);
    } catch (e: any) {
      setError(
        typeof e?.response?.data?.error === 'string'
          ? e?.response?.data?.error
          : typeof e?.response?.data?.error === 'object' && e?.response?.data?.error !== null
            ? JSON.stringify(e?.response?.data?.error)
            : e?.response?.data?.error?.toString() || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    if (!stream) return;
    setLoading(true);
    try {
      await axios.post('/api/livepeer/stop-stream', { id: stream.id });
      setStatus('Stopped');
      setEndTime(Date.now());
      if (startTime) {
        const minutes = Math.ceil(((Date.now() - startTime) / 1000) / 60);
        const usd = minutes * COST_PER_MINUTE;
        setCost(usd);
        setCostIdr(usd * USD_TO_IDR);
      }
    } catch (e: any) {
      setError(
        typeof e?.response?.data?.error === 'string'
          ? e?.response?.data?.error
          : typeof e?.response?.data?.error === 'object' && e?.response?.data?.error !== null
            ? JSON.stringify(e?.response?.data?.error)
            : e?.response?.data?.error?.toString() || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/livepeer/stream-status?id=${id}`);
        setStatus(res.data.isActive ? 'Live' : 'Not Live');
        if (res.data.isActive) clearInterval(interval);
      } catch (e) {
        setStatus('Error fetching status');
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Host a Live Stream</h1>
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-lg font-semibold mb-2">History Livestream</h2>
        {historyLoading ? (
          <div>Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-gray-500">Belum ada livestream.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created</th>
                  <th className="p-2 border">PlaybackId</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 border">{s.name}</td>
                    <td className="p-2 border">{s.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="p-2 border">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="p-2 border font-mono">{s.playbackId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={createStream}
        disabled={loading || !!stream}
      >
        {loading ? 'Starting...' : 'Start Stream'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {stream && (
        <div className="mt-6 w-full max-w-md bg-white rounded shadow p-4">
          <div className="mb-2"><b>Stream Key:</b> <span className="break-all">{stream.streamKey}</span></div>
          <div className="mb-2"><b>Ingest URL:</b> {stream.ingestUrl}</div>
          <div className="mb-2"><b>Playback URL:</b> <span className="break-all">{stream.playbackUrl}</span></div>
          <div className="mb-2"><b>Status:</b> {status || 'Checking...'}</div>
          <div className="mb-2"><b>Estimasi Biaya:</b> ${cost.toFixed(3)} USD / Rp{costIdr.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            onClick={stopStream}
            disabled={loading || status === 'Stopped'}
          >
            Stop Stream
          </button>
        </div>
      )}
    </div>
  );
}
