import React, { useEffect, useRef, useState } from 'react';
import Ably from 'ably';

interface ChatBoxProps {
  streamId: string;
  simulate?: boolean;
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

const ChatBox: React.FC<ChatBoxProps> = ({ streamId, simulate }) => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!ablyApiKey) return;
    ablyRef.current = new Ably.Realtime(ablyApiKey);
    channelRef.current = ablyRef.current.channels.get(`chat-${streamId}`);
    channelRef.current.subscribe('message', (msg: any) => {
      setMessages((prev) => [...prev, msg.data]);
    });
    return () => {
      channelRef.current?.detach();
      ablyRef.current?.close();
    };
  }, [streamId]);

  // Simulasi random chat
  useEffect(() => {
    if (!simulate || !channelRef.current) return;
    const interval = setInterval(() => {
      const user = randomNames[Math.floor(Math.random() * randomNames.length)];
      const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      channelRef.current.publish('message', { user, text });
    }, 1200 + Math.random() * 1200); // 1.2-2.4 detik
    return () => clearInterval(interval);
  }, [simulate, channelRef.current]);

  const sendMessage = () => {
    if (!input.trim()) return;
    channelRef.current?.publish('message', { user: 'You', text: input });
    setInput('');
  };

  return (
    <div className="bg-white rounded shadow p-4 w-full mt-4">
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
      <div className="h-48 overflow-y-auto border p-2 bg-gray-50">
        {messages.slice().reverse().map((msg, idx) => (
          <div key={idx} className="mb-1">
            <b>{msg.user}:</b> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatBox;
