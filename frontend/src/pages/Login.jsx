import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('با موفقیت وارد شدید!');
      navigate('/'); 
    } catch {
      toast.error('نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🎫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">سیستم پشتیبانی</h1>
          <p className="text-gray-500 text-sm mt-1">لطفاً برای ورود اطلاعات خود را وارد کنید</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="username" required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">رمز عبور</label>
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 transition">فراموشی رمز؟</Link>
            </div>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
            {loading ? 'در حال بررسی...' : 'ورود'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          حساب کاربری ندارید؟ <Link to="/register" className="text-indigo-600 font-medium hover:underline">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}
