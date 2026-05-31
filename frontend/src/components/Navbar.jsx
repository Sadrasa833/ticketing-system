import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) =>
    location.pathname === path ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-700';

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-white font-bold text-lg flex items-center gap-2">
          🎫 <span>Support Desk</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive('/')}`}>داشبورد</Link>
          <Link to="/tickets" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive('/tickets')}`}>تیکت‌ها</Link>
          {user?.role === 'customer' && (
            <Link to="/tickets/new" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive('/tickets/new')}`}>تیکت جدید</Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm font-medium">{user?.username}</p>
            <p className="text-indigo-200 text-xs">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="bg-indigo-800 hover:bg-indigo-900 text-white text-sm px-3 py-2 rounded-lg transition">خروج</button>
        </div>
      </div>
    </nav>
  );
}
