import React, { useRef, useState } from 'react';

export default function WebcamStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  const startWebcam = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreaming(true);
    } catch (e: any) {
      setError(e.message || 'Tidak bisa mengakses webcam');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Webcam Livestream Preview</h1>
      <video ref={videoRef} className="w-full max-w-lg rounded shadow mb-4" autoPlay muted playsInline />
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={startWebcam}
          disabled={streaming}
        >
          Start Webcam
        </button>
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          onClick={stopWebcam}
          disabled={!streaming}
        >
          Stop Webcam
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <p className="mt-6 text-gray-600 text-center max-w-md">Halaman ini hanya preview webcam lokal. Untuk streaming ke Livepeer, gunakan software seperti OBS dan masukkan Stream Key & RTMP URL dari halaman Host.</p>
    </div>
  );
}
