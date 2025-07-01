import React, { useEffect, useRef, useState } from 'react';
import Ably from 'ably';

interface ChatBoxProps {
  streamId: string;
}

const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || '';

const ChatBox: React.FC<ChatBoxProps> = ({ streamId }) => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.Types.RealtimeChannelCallbacks | null>(null);

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

  const sendMessage = () => {
    if (!input.trim()) return;
    channelRef.current?.publish('message', { user: 'User', text: input });
    setInput('');
  };

  return (
    <div className="bg-white rounded shadow p-4 w-full">
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
