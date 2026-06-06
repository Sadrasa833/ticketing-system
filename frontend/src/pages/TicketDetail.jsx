import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import toast from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => { 
    fetchTicket(); 
    if (user?.role === 'admin') fetchAgents(); 
  }, [id, user?.role]);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [ticket?.replies]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}/`);
      setTicket(res.data);
    } catch { 
      toast.error('تیکت یافت نشد.');
      navigate('/tickets'); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/auth/agents/');
      setAgents(res.data);
    } catch (err) {
      console.error('خطا در دریافت لیست پشتیبان‌ها', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/reply/`, { message: reply });
      setReply('');
      fetchTicket(); 
    } catch (error) {
      toast.error('خطا در ارسال پاسخ.');
    } finally { 
      setSending(false); 
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/tickets/${id}/`, { status: newStatus });
      toast.success('وضعیت با موفقیت تغییر کرد!');
      fetchTicket(); 
    } catch (error) {
      toast.error('خطا در تغییر وضعیت.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* هدر و دکمه‌های کنترل */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          <span>←</span> بازگشت
        </button>
        
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <button 
            onClick={() => navigate('/live-chats')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            🟢 مشاهده چت‌های زنده
          </button>
        )}
      </div>

      {/* کارت اصلی تیکت */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">#{ticket.id} - {ticket.title}</h1>
            
            {/* منوی تغییر وضعیت */}
            {(user?.role === 'admin' || user?.role === 'agent') && (
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium bg-white cursor-pointer shadow-sm"
              >
                <option value="open">🟢 باز</option>
                <option value="in_progress">🟡 در حال بررسی</option>
                <option value="closed">🔴 بسته شده</option>
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>ایجاد کننده: {ticket.created_by?.username}</span>
            {ticket.assigned_to && <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">مسئول: {ticket.assigned_to.username}</span>}
          </div>
        </div>
        <div className="p-6 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</div>
      </div>

      {/* بخش پاسخ‌ها */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">پاسخ‌ها ({ticket.replies?.length || 0})</h3>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 max-h-[500px] overflow-y-auto flex flex-col gap-4 bg-gray-50/30">
          {ticket.replies?.map((r) => (
            <div key={r.id} className={`flex ${r.author?.username === user?.username ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${r.author?.username === user?.username ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-800'}`}>
                <div className="text-xs opacity-70 mb-1 font-bold">{r.author?.username}</div>
                <div className="text-sm">{r.message}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {ticket.status !== 'closed' && (
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleReply} className="flex gap-3">
              <textarea 
                value={reply} 
                onChange={(e) => setReply(e.target.value)} 
                rows={2}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 resize-none bg-gray-50"
                placeholder="پاسخ خود را بنویسید..."
              />
              <button type="submit" disabled={sending} className="bg-indigo-600 text-white px-6 rounded-xl font-medium">ارسال</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
