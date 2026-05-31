import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import TicketCard from '../components/TicketCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const ticketsRes = await api.get('/tickets/');
      setRecentTickets(ticketsRes.data.slice(0, 5));
      if (user?.role !== 'customer') {
        const statsRes = await api.get('/dashboard/stats/');
        setStats(statsRes.data);
      }
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سلام، {user?.username} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">خوش آمدید به پنل پشتیبانی</p>
        </div>
        {user?.role === 'customer' && (
          <Link to="/tickets/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition">
            + تیکت جدید
          </Link>
        )}
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard title="کل تیکت‌ها" value={stats.total} icon="🎫" color="blue" />
          <StatsCard title="باز" value={stats.open} icon="📬" color="blue" />
          <StatsCard title="در بررسی" value={stats.in_progress} icon="⏳" color="yellow" />
          <StatsCard title="حل شده" value={stats.resolved} icon="✅" color="green" />
          <StatsCard title="اورژانسی" value={stats.high_priority} icon="🔴" color="red" />
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800 text-lg">آخرین تیکت‌ها</h2>
          <Link to="/tickets" className="text-indigo-600 text-sm hover:underline">مشاهده همه ←</Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">📭</span>
            <p className="text-gray-500 mt-3">هیچ تیکتی وجود ندارد</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {recentTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        )}
      </div>
    </div>
  );
}
