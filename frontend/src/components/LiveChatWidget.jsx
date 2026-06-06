import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && !session) {
      startChat();
    }
  }, [isOpen, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  useEffect(() => {
    return () => { if (socket) socket.close(); };
  }, [socket]);

  const startChat = async () => {
    try {
      setError('');
      const res = await api.post('/tickets/live-chat/start/');
      setSession(res.data);
      connectSocket(res.data.id); 
    } catch (err) {
      setError(err.response?.data?.error || 'خطا در ارتباط با سرور');
    }
  };

  const connectSocket = (sessionId) => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/live-chat/${sessionId}/`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSession(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), {
          id: Date.now(),
          sender_name: data.sender,
          message: data.message,
          created_at: data.created_at
        }]
      }));
    };
    
    setSocket(ws);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    
    socket.send(JSON.stringify({
      message: message,
      user_id: user.id
    }));
    setMessage('');
  };

  if (!user || user.role !== 'customer') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all h-[500px]">
          
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">پشتیبانی زنده</h3>
              <p className="text-xs text-indigo-200 mt-1">
                {session ? `در حال گفتگو با: ${session.agent_name}` : 'در حال اتصال...'}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 flex flex-col gap-3">
            {error ? (
              <div className="text-center text-sm text-red-500 mt-10 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
            ) : !session ? (
              <div className="text-center text-sm text-gray-400 mt-10">لطفاً صبر کنید...</div>
            ) : session.messages?.length === 0 ? (
              <div className="text-center text-sm text-gray-400 mt-10">پشتیبان ما به زودی پاسخگوی شما خواهد بود. پیامتان را بنویسید.</div>
            ) : (
              session.messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_name === user.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 text-sm rounded-2xl ${msg.sender_name === user.username ? 'bg-indigo-600 text-white rounded-bl-none' : 'bg-white border border-gray-200 text-gray-800 rounded-br-none shadow-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              disabled={!session || error}
              className="flex-1 border-none focus:ring-0 text-sm bg-gray-50 rounded-xl px-4 py-2"
            />
            <button type="submit" disabled={!message.trim() || !session || error} className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition">
              <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}