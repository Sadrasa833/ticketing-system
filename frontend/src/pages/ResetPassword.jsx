import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { uid, token } = useParams(); 
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/password-reset-confirm/', { 
        uidb64: uid, 
        token, 
        new_password: password 
      });
      toast.success('رمز عبور با موفقیت تغییر کرد! حالا وارد شوید.');
      navigate('/login');
    } catch {
      toast.error('لینک نامعتبر است یا منقضی شده.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">ثبت رمز عبور جدید</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور جدید (حداقل ۶ کاراکتر)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="••••••••" required minLength="6" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
            {loading ? 'در حال ثبت...' : 'تغییر رمز'}
          </button>
        </form>
      </div>
    </div>
  );
}