import React, { useEffect, useRef, useState } from 'react';
import Ably from 'ably';

interface ChatBoxProps {
  streamId: string;
  simulate?: boolean;
  darkMode?: boolean;
}

const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || '';

const randomNames = ['Budi', 'Siti', 'Andi', 'Rina', 'Joko', 'Maya', 'Dewi', 'Agus', 'Tina'];
const randomMessages = [
  'Halo!',
  'Mantap streamingnya!',
  'Keren banget!',
  'Salam dari Jakarta!',
  'Lancar jaya!',
  'Ada yang nonton dari Surabaya?',
  'Suaranya jelas!',
  'Videonya HD!',
  'Gas terus!',
  'Seru banget!'
];

const ChatBox: React.FC<ChatBoxProps> = ({ streamId, simulate, darkMode }) => {
  const [messages, setMessages] = useState<{ user: string; text: string; join?: boolean }[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!ablyApiKey) return;
    ablyRef.current = new Ably.Realtime(ablyApiKey);
    channelRef.current = ablyRef.current.channels.get(`chat-${streamId}`);
    channelRef.current.subscribe('message', (msg: any) => {
      setMessages((prev) => [...prev, msg.data]);
    });
    // Listen for custom event to send chat from parent
    const handler = (e: any) => {
      if (e.detail && e.detail.user && e.detail.text) {
        channelRef.current?.publish('message', { user: e.detail.user, text: e.detail.text });
      }
    };
    window.addEventListener('send-chat-message', handler);
    return () => {
      window.removeEventListener('send-chat-message', handler);
      channelRef.current?.detach();
      ablyRef.current?.close();
    };
  }, [streamId]);

  // Simulasi random chat
  useEffect(() => {
    if (!simulate || !channelRef.current) return;
    const interval = setInterval(() => {
      // Simulasi notifikasi penonton baru
      if (Math.random() < 0.18) {
        const user = randomNames[Math.floor(Math.random() * randomNames.length)];
        setMessages((prev) => [...prev, { user: '', text: `👋 ${user} baru saja bergabung!`, join: true }]);
      } else {
        const user = randomNames[Math.floor(Math.random() * randomNames.length)];
        const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        channelRef.current.publish('message', { user, text });
      }
    }, 1200 + Math.random() * 1200); // 1.2-2.4 detik
    return () => clearInterval(interval);
  }, [simulate, channelRef.current]);

  // Scroll ke bawah otomatis jika user tidak scroll ke atas
  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    if (!showScrollToBottom) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [messages]);

  // Deteksi apakah user scroll ke atas
  const handleScroll = () => {
    const chat = chatRef.current;
    if (!chat) return;
    const isAtBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 10;
    setShowScrollToBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    const chat = chatRef.current;
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
      setShowScrollToBottom(false);
    }
  };

  return (
    <div className={darkMode ? "w-full h-full flex flex-col relative bg-[#181c24] text-green-200" : "w-full h-full flex flex-col relative"}>
      <div
        ref={chatRef}
        className={darkMode ? "flex-1 h-full overflow-y-auto border rounded-lg bg-[#23272f] px-4 pt-3 pb-2 relative flex flex-col" : "flex-1 h-full overflow-y-auto border rounded-lg bg-white px-4 pt-3 pb-2 relative flex flex-col"}
        onScroll={handleScroll}
        style={{ minHeight: 0, height: '100%', maxHeight: '100%' }}
      >
        <div className="flex-grow" />
        {messages.map((msg, idx) => (
          msg.join ? (
            <div key={idx} className="mb-2 text-xs text-center text-blue-400 animate-fade-in">{msg.text}</div>
          ) : (
            <div key={idx} className="mb-2 flex items-center gap-2">
              {/* Avatar */}
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background: stringToColor(msg.user, darkMode ? '#23272f' : '#fff')}}>
                {msg.user ? msg.user[0].toUpperCase() : 'U'}
              </span>
              {/* Nama user warna-warni */}
              <b className="mr-1" style={{color: stringToColor(msg.user, darkMode ? '#23272f' : '#fff')}}>{msg.user}:</b>
              {/* Highlight jika ada @detikinjuga */}
              <span className={/\@detikinjuga/i.test(msg.text) ? 'bg-yellow-200 px-1 rounded' : ''}>{msg.text}</span>
            </div>
          )
        ))}
        {showScrollToBottom && (
          <button
            className="sticky bottom-3 right-3 ml-auto border border-green-500 text-green-400 bg-[#23272f] px-3 py-1 rounded shadow hover:bg-green-900 transition z-10"
            style={{ position: 'sticky', left: 'unset', right: 0 }}
            onClick={scrollToBottom}
          >
            Scroll ke bawah
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBox;

// Helper untuk warna avatar/nama
function stringToColor(str: string, bg: string = '#23272f') {
  if (!str) return '#8884';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate HSL color, force high saturation and lightness for contrast
  const hue = Math.abs(hash) % 360;
  // Cek apakah background gelap atau terang
  const isDark = isDarkColor(bg);
  const sat = 85;
  const light = isDark ? 60 : 40;
  return `hsl(${hue},${sat}%,${light}%)`;
}

function isDarkColor(hex: string) {
  // Remove # if present
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  // Perceived brightness
  return (r*0.299 + g*0.587 + b*0.114) < 186;
}
