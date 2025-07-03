import React, { useState, useEffect, useRef } from 'react';
import LivepeerReactPlayer from '../components/LivepeerReactPlayer';
import ChatBoxCustom from '../components/ChatBoxCustom';
import axios from 'axios';

export default function CustomPlayerPage() {
  const [url, setUrl] = useState('');
  const [playUrl, setPlayUrl] = useState('');
  const [streamId, setStreamId] = useState('');
  const [chatInput, setChatInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const playerBoxRef = useRef<HTMLDivElement>(null);
  const chatFlexRef = useRef<HTMLDivElement>(null);
  // Flying hearts state
  const [flyingHearts, setFlyingHearts] = useState<{id:number;left:number; icon?: string;}[]>([]);
  const heartId = useRef(0);
  const reactionBtnRef = useRef<HTMLButtonElement>(null);
  const reactionHoverRef = useRef<HTMLDivElement>(null);
  const emojiList = ['😂', '🔥', '👍', '😍', '👏', '😭', '😎', '🎉'];
  const reactionList = [
    { icon: '❤️', label: 'Love' },
    { icon: '😂', label: 'LOL' },
    { icon: '🔥', label: 'Fire' },
    { icon: '👍', label: 'Like' },
    { icon: '👏', label: 'Clap' },
  ];

  // Theme toggle
  const [theme, setTheme] = useState<'basic' | 'cyberpunk'>('basic');

  // Ambil playback url livestream terakhir secara default
  useEffect(() => {
    const fetchLastStream = async () => {
      try {
        const res = await axios.get('/api/livepeer/list-streams');
        const streams = res.data;
        if (Array.isArray(streams) && streams.length > 0) {
          // Urutkan dari terbaru, ambil yang playbackId ada
          const sorted = streams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const last = sorted.find(s => s.playbackId);
          if (last) {
            const playback = `https://livepeercdn.com/hls/${last.playbackId}/index.m3u8`;
            setUrl(playback);
            setPlayUrl(playback);
            setStreamId(last.playbackId);
          }
        }
      } catch {}
    };
    fetchLastStream();
  }, []);

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayUrl(url);
    // Ambil streamId dari url jika ada, atau random jika tidak
    const match = url.match(/\/hls\/(.+?)\//);
    setStreamId(match ? match[1] : Math.random().toString(36).substring(2, 10));
  };

  // Samakan tinggi flex chat+player
  useEffect(() => {
    if (playerBoxRef.current && chatFlexRef.current) {
      chatFlexRef.current.style.height = `${playerBoxRef.current.offsetHeight}px`;
    }
  }, [playUrl]);

  // Flying heart handler
  const handleReaction = (icon = '❤️') => {
    if (!reactionBtnRef.current) return;
    const btn = reactionBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const cardRect = btn.closest('.custom-player-card')?.getBoundingClientRect();
    let left = 50;
    if (rect && cardRect) {
      left = ((rect.left + rect.width / 2 - cardRect.left) / cardRect.width) * 100;
    }
    const id = heartId.current++;
    setFlyingHearts(prev => [...prev, { id, left, icon }]);
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(h => h.id !== id));
    }, 1800);
  };

  const handleAddEmoji = (emoji: string) => {
    setChatInput(chatInput + emoji);
    setShowEmoji(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    // Publish ke Ably channel (lewat ChatBoxCustom via custom event)
    window.dispatchEvent(new CustomEvent('send-chat-message', { detail: { user: 'You', text: chatInput } }));
    setChatInput("");
  };

  // Ganti trigger show/hide reaction menu dari hover ke klik
  const handleToggleReactions = () => setShowReactions(v => !v);

  // Handle hover agar menu reaction tidak langsung hilang
  useEffect(() => {
    if (!showReactions) return;
    function handlePointer(e: MouseEvent) {
      if (!reactionHoverRef.current) return;
      if (!reactionHoverRef.current.contains(e.target as Node)) {
        setShowReactions(false);
      }
    }
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [showReactions]);

  return (
    <div className={theme === 'cyberpunk' ? 'cyberpunk min-h-screen bg-gray-900 flex flex-col items-center justify-center px-2 py-6' : 'min-h-screen bg-gray-50 flex flex-col items-center justify-center px-2 py-6'}>
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-8 border border-gray-100 relative custom-player-card">
        {/* Flying hearts overlay */}
        <div className="pointer-events-none absolute left-0 top-0 w-full h-full z-30">
          {flyingHearts.map(h => (
            <span
              key={h.id}
              className="pointer-events-none select-none text-pink-500 text-2xl animate-fly-heart absolute"
              style={{ left: `${h.left}%`, bottom: 60 }}
            >
              <span style={{fontSize: 32}}>{h.icon || '❤️'}</span>
            </span>
          ))}
        </div>
        <div className="mb-2 flex items-center gap-3">
          <div className="text-xs font-semibold text-pink-600 tracking-widest text-left">LIVE</div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight text-left font-sans drop-shadow-sm">detikinjuga</div>
          <span className="ml-2 px-2 py-1 bg-gray-100 text-xs font-bold text-gray-700 rounded-full shadow-sm">1.2K penonton</span>
        </div>
        {playUrl && (
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Video player kiri */}
            <div className="flex-1 flex flex-col items-center" ref={playerBoxRef}>
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                {/* Ganti VideoPlayer ke LivepeerReactPlayer */}
                {streamId && <LivepeerReactPlayer playbackId={streamId} />}
              </div>
            </div>
            {/* Livechat kanan, tinggi sama dengan player */}
            <div className="w-full md:w-[340px] flex flex-col" ref={chatFlexRef}>
              <div className="flex-1 flex flex-col h-full min-h-0">
                <div className="flex-1 min-h-0 max-h-full">
                  <ChatBoxCustom streamId={streamId} simulate={true} />
                </div>
              </div>
              {/* Input chat dan reaction */}
              <div className="flex items-center gap-2 mt-2 h-12">
                <form onSubmit={handleSendChat} className="flex w-full gap-2 relative">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    placeholder="Ketik pesan..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <button type="button" className="text-xl px-2" onClick={() => setShowEmoji(v => !v)} title="Emoji">😊</button>
                  {showEmoji && (
                    <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow p-2 flex gap-1 z-40">
                      {emojiList.map(e => (
                        <button key={e} type="button" className="text-2xl hover:scale-125 transition" onClick={() => handleAddEmoji(e)}>{e}</button>
                      ))}
                    </div>
                  )}
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow" title="Kirim">
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                  </button>
                </form>
                <div
                  className="relative flex items-center"
                  ref={reactionHoverRef}
                >
                  <button
                    ref={reactionBtnRef}
                    className="w-10 h-10 rounded-full bg-pink-50 hover:bg-pink-200 flex items-center justify-center text-pink-600 text-xl shadow transition"
                    title={reactionList[0].label}
                    type="button"
                    onClick={handleToggleReactions}
                  >
                    <span role="img" aria-label={reactionList[0].label}>{reactionList[0].icon}</span>
                  </button>
                  {showReactions && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 rounded-xl shadow-lg px-3 py-2 z-40 border border-pink-100 animate-fade-in">
                      {reactionList.slice(1).map((r, i) => (
                        <button
                          key={r.icon}
                          className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-200 flex items-center justify-center text-pink-600 text-xl shadow transition"
                          title={r.label}
                          type="button"
                          onClick={() => handleReaction(r.icon)}
                        >
                          <span role="img" aria-label={r.label}>{r.icon}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Input box url playback di bawah, rata kiri */}
      <form onSubmit={handlePlay} className="flex gap-2 mt-4 w-full max-w-6xl justify-start">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          placeholder="Masukkan URL .m3u8 playback"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg font-semibold shadow">Play</button>
      </form>
      {/* Theme toggle di bawah, center align */}
      <div className="flex justify-center mt-8 mb-4 w-full">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-bold shadow ${theme === 'basic' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-cyan-300 border border-cyan-400'}`}
            onClick={() => setTheme('basic')}
          >
            Basic
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-bold shadow ${theme === 'cyberpunk' ? 'bg-pink-600 text-yellow-300 border border-pink-400' : 'bg-gray-700 text-pink-400 border border-pink-400'}`}
            onClick={() => setTheme('cyberpunk')}
          >
            Cyberpunk
          </button>
        </div>
      </div>
    </div>
  );
}
