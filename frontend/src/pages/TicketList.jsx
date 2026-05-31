import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TicketCard from '../components/TicketCard';

export default function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });

  useEffect(() => {
    api.get('/tickets/').then((res) => { setTickets(res.data); setFiltered(res.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = tickets;
    if (filter.status) result = result.filter((t) => t.status === filter.status);
    if (filter.priority) result = result.filter((t) => t.priority === filter.priority);
    if (filter.search) result = result.filter((t) => t.title.toLowerCase().includes(filter.search.toLowerCase()));
    setFiltered(result);
  }, [filter, tickets]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تیکت‌ها</h1>
        {user?.role === 'customer' && (
          <Link to="/tickets/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition">+ تیکت جدید</Link>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <input type="text" placeholder="جستجو..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="in_progress">در حال بررسی</option>
          <option value="resolved">حل شده</option>
          <option value="closed">بسته</option>
        </select>
        <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">همه اولویت‌ها</option>
          <option value="low">کم</option>
          <option value="medium">متوسط</option>
          <option value="high">زیاد</option>
        </select>
        <span className="text-sm text-gray-400 self-center">{filtered.length} تیکت</span>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-5xl">🔍</span>
          <p className="text-gray-500 mt-3">نتیجه‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </div>
      )}
    </div>
  );
}
