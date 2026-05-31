import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/password-reset/', { email });
      toast.success('لینک بازیابی در ترمینال بک‌اند چاپ شد (شبیه‌ساز ایمیل).');
    } catch {
      toast.error('کاربری با این ایمیل یافت نشد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">بازیابی رمز عبور</h2>
        <p className="text-center text-gray-500 text-sm mb-6">ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="email@example.com" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
            {loading ? 'در حال ارسال...' : 'ارسال لینک'}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">← بازگشت به ورود</Link>
        </p>
      </div>
    </div>
  );
}