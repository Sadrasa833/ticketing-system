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
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || 'شما حق پاسخگویی به این تیکت را ندارید.');
      } else {
        toast.error('خطا در ارسال پاسخ.');
      }
    } finally { 
      setSending(false); 
    }
  };

  const handleAssign = async (agentId) => {
    if (!agentId) return;
    try {
      await api.patch(`/tickets/${id}/assign/`, { agent_id: agentId });
      toast.success('تیکت با موفقیت به پشتیبان ارجاع شد!');
      fetchTicket();
    } catch (error) {
      toast.error('خطا در ارجاع تیکت.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/tickets/${id}/`, { status: newStatus });
      toast.success('وضعیت تیکت با موفقیت تغییر کرد!');
      fetchTicket();
    } catch (error) {
      toast.error('خطا در تغییر وضعیت تیکت.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
        <span>←</span> بازگشت
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">#{ticket.id} - {ticket.title}</h1>
            
            <div className="flex items-center gap-2">
              {user?.role === 'admin' || user?.role === 'agent' ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer shadow-sm"
                >
                  <option value="open">🟢 باز</option>
                  <option value="in_progress">🟡 در حال بررسی</option>
                  <option value="closed">🔴 بسته شده</option>
                </select>
              ) : (
                <StatusBadge status={ticket.status} />
              )}
              <PriorityBadge priority={ticket.priority} />
            </div>
            
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>دسته‌بندی: {ticket.category_name || 'نامشخص'}</span>
            <span>ایجاد کننده: <span className="font-medium text-gray-700">{ticket.created_by?.username}</span></span>
            {ticket.assigned_to && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                مسئول: {ticket.assigned_to.username}
              </span>
            )}
          </div>

          {user?.role === 'admin' && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-800">ارجاع تیکت به:</span>
              <select 
                value={ticket.assigned_to?.id || ''} 
                onChange={(e) => handleAssign(e.target.value)}
                className="border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer transition font-medium"
              >
                <option value="" disabled>انتخاب پشتیبان...</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.username}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="p-6 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
          {ticket.description}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4">پاسخ‌ها ({ticket.replies?.length || 0})</h3>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 max-h-[500px] overflow-y-auto flex flex-col gap-4 bg-gray-50/30">
          {ticket.replies?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">هنوز پاسخی ثبت نشده است.</div>
          ) : (
            ticket.replies?.map((r) => (
              <div key={r.id} className={`flex ${r.author?.username === user?.username ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${r.author?.username === user?.username ? 'bg-indigo-600 text-white rounded-bl-none' : 'bg-white border border-gray-200 text-gray-800 rounded-br-none shadow-sm'}`}>
                  <div className={`text-xs mb-2 font-medium flex justify-between gap-4 ${r.author?.username === user?.username ? 'text-indigo-200' : 'text-gray-500'}`}>
                    <span>{r.author?.username}</span>
                    <span className="opacity-70">{new Date(r.created_at).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{r.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {ticket.status !== 'closed' ? (
          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleReply} className="flex gap-3">
              <textarea 
                value={reply} 
                onChange={(e) => setReply(e.target.value)} 
                rows={2}
                placeholder="پاسخ خود را بنویسید..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-gray-50 transition"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }} 
              />
              <button type="submit" disabled={sending || !reply.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-medium transition disabled:opacity-50 text-sm">
                {sending ? '...' : 'ارسال'}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 mr-2">Enter برای ارسال، Shift+Enter برای رفتن به خط جدید</p>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-500 bg-gray-50">
            🔒 این تیکت بسته شده است و امکان ثبت پاسخ جدید وجود ندارد.
          </div>
        )}
      </div>
    </div>
  );
}
