import React, { useState, useRef } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import ChatBoxCustom from '../components/ChatBoxCustom';

export default function RetroTerminalPlayer() {
  const [url, setUrl] = useState('https://livepeercdn.com/hls/4bb855f00ybyc7x3/index.m3u8');
  const [playUrl, setPlayUrl] = useState(url);
  const [chatInput, setChatInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [flyingHearts, setFlyingHearts] = useState<{id:number;left:number;icon?:string;}[]>([]);
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

  // Flying heart handler
  const handleReaction = (icon = '❤️') => {
    if (!reactionBtnRef.current) return;
    const btn = reactionBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const cardRect = btn.closest('.retro-panel')?.getBoundingClientRect();
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
    window.dispatchEvent(new CustomEvent('send-chat-message', { detail: { user: 'You', text: chatInput } }));
    setChatInput("");
  };

  const handleToggleReactions = () => setShowReactions(v => !v);

  return (
    <div className="retro-terminal min-h-screen">
      <div
        className="retro-grid items-start"
        style={{
          alignItems: 'start',
          height: '720px',
          maxHeight: '720px',
          gridTemplateColumns: '2fr 1fr', // 2/3 dan 1/3
          gap: '24px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Video Panel */}
        <div className="retro-panel flex flex-col h-full relative" style={{height: '720px', minWidth: 0}}>
          {/* Flying hearts overlay */}
          <div className="pointer-events-none absolute left-0 top-0 w-full h-full z-30">
            {flyingHearts.map(h => (
              <span
                key={h.id}
                className="pointer-events-none select-none text-green-400 text-2xl animate-fly-heart absolute"
                style={{ left: `${h.left}%`, bottom: 60 }}
              >
                <span style={{fontSize: 32}}>{h.icon || '❤️'}</span>
              </span>
            ))}
          </div>
          <div className="retro-label">[ LIVE STREAM ]</div>
          <div className="retro-video flex items-center justify-center flex-1 min-h-0" style={{height: '100%'}}>
            <VideoPlayer playbackUrl={playUrl} />
          </div>
          <div className="retro-footer">URL: {playUrl}</div>
        </div>
        {/* Chat Panel */}
        <div className="retro-panel flex flex-col h-full" style={{height: '720px', minWidth: 0, maxWidth: '420px'}}>
          <div className="retro-label">[ LIVE CHAT ]</div>
          <div className="retro-chat-history bg-black text-green-300 flex-1 min-h-0" style={{height: '100%'}}>
            <ChatBoxCustom streamId="retro-demo" simulate={true} darkMode={true} />
          </div>
          {/* Input + Reaction in 1 row, rapi dan tidak nabrak */}
          <form className="retro-chat-input mt-2 flex gap-2 w-full box-border items-center" onSubmit={handleSendChat}>
            <input
              className="bg-black text-green-300 border-green-500 flex-1 min-w-0"
              placeholder="Type here..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="button" className="text-xl px-2" onClick={() => setShowEmoji(v => !v)} title="Emoji">😊</button>
            {showEmoji && (
              <div className="absolute bottom-12 left-0 bg-black border border-green-500 rounded-lg shadow p-2 flex gap-1 z-40">
                {emojiList.map(e => (
                  <button key={e} type="button" className="text-2xl hover:scale-125 transition" onClick={() => handleAddEmoji(e)}>{e}</button>
                ))}
              </div>
            )}
            <button type="submit" className="border border-green-500 text-green-400 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow" title="Kirim">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            </button>
            {/* Reaction button, tanpa ml-2, ikut gap flex */}
            <div className="relative flex items-center" ref={reactionHoverRef}>
              <button
                ref={reactionBtnRef}
                className="w-10 h-10 rounded-full border border-green-500 bg-black hover:bg-green-900 flex items-center justify-center text-green-400 text-xl shadow transition"
                title={reactionList[0].label}
                type="button"
                onClick={handleToggleReactions}
              >
                <span role="img" aria-label={reactionList[0].label}>{reactionList[0].icon}</span>
              </button>
              {showReactions && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 bg-black border border-green-500 rounded-xl shadow-lg px-3 py-2 z-40 animate-fade-in">
                  {reactionList.slice(1).map((r, i) => (
                    <button
                      key={r.icon}
                      className="w-9 h-9 rounded-full border border-green-500 bg-black hover:bg-green-900 flex items-center justify-center text-green-400 text-xl shadow transition"
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
          </form>
        </div>
      </div>
    </div>
  );
}
