import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AgentLiveChats() {
  const { user } = useAuth();
  const [activeChats, setActiveChats] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchActiveChats();
    const interval = setInterval(fetchActiveChats, 10000); // آپدیت هر ۱۰ ثانیه
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages]);

  useEffect(() => {
    return () => { if (socket) socket.close(); };
  }, [socket]);

  const fetchActiveChats = async () => {
    try {
      const res = await api.get('/tickets/live-chat/active/');
      setActiveChats(res.data);
      
      // اگر چت انتخاب شده آپدیت شد، آن را بروزرسانی کن
      if (selectedSession) {
        const updated = res.data.find(c => c.id === selectedSession.id);
        if (updated) setSelectedSession(updated);
      }
    } catch (err) {
      console.error('خطا در دریافت لیست چت‌ها');
    }
  };

  const selectChat = async (session) => {
    // اختصاص چت به پشتیبان اگر هنوز پشتیبان ندارد
    if (!session.agent) {
      try {
        await api.patch(`/tickets/live-chat/${session.id}/assign/`, { agent_id: user.id });
        session.agent = user.id; // بروزرسانی محلی
      } catch (err) {
        console.error('خطا در اختصاص چت');
      }
    }

    if (socket) socket.close();
    setSelectedSession(session);
    
    // اتصال سوکت
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/live-chat/${session.id}/`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSelectedSession(prev => ({
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

  if (!user || user.role === 'customer') {
    return <div className="p-10 text-center text-red-500 font-bold">شما دسترسی به این صفحه ندارید.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 h-[calc(100vh-100px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-full overflow-hidden">
        
        {/* لیست چت‌ها */}
        <div className="w-1/3 bg-gray-50 border-l border-gray-100 flex flex-col">
          <div className="p-4 bg-indigo-600 text-white font-bold text-center">
            چت‌های فعال ({activeChats.length})
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {activeChats.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 text-sm">چت فعالی وجود ندارد.</div>
            ) : (
              activeChats.map(chat => (
                <div 
                  key={chat.id} 
                  onClick={() => selectChat(chat)}
                  className={`p-4 mb-2 rounded-xl cursor-pointer transition ${selectedSession?.id === chat.id ? 'bg-indigo-100 border-indigo-300' : 'bg-white border hover:bg-gray-100'}`}
                >
                  <div className="font-bold text-gray-800">مشتری: {chat.customer_name}</div>
                  <div className="text-xs text-gray-500">وضعیت: {chat.agent ? 'در حال پاسخگویی' : 'منتظر شما'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* پنجره گفتگو */}
        <div className="w-2/3 flex flex-col bg-white">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">یک چت را انتخاب کنید.</div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 font-bold text-gray-800">گفتگو با: {selectedSession.customer_name}</div>
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 flex flex-col gap-4">
                {selectedSession.messages?.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_name === user.username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 text-sm rounded-xl ${msg.sender_name === user.username ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-800'}`}>
                      <div className="text-[10px] opacity-70 mb-1">{msg.sender_name}</div>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="پاسخ..."
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">ارسال</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}