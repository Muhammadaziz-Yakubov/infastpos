import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { GlobeAltIcon } from '@heroicons/react/outline';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const { setLanguage } = useUIStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return toast.error(t('Iltimos, login va parolni kiriting') || 'Please enter login and password');
    }

    try {
      const user = await login(username, password);
      toast.success(t('Welcome'));
      
      // Redirect based on role
      if (user.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'store_owner') {
        navigate('/store/dashboard');
      } else if (user.role === 'cashier') {
        navigate('/cashier/pos');
      } else {
        navigate(from);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('Login xatosi') || 'Login error');
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <div className="flex items-center space-x-2 bg-white dark:bg-[#0f172a] px-3 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          <select 
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          InFast POS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
          {t('Tizimga kirish') || 'Login to system'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#0f172a] py-8 px-4 shadow-xl shadow-indigo-500/5 sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-white/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                {t('Login') || 'Login'}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/5 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                {t('Parol') || 'Password'}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-white/5 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/20 text-sm font-black text-white bg-[#4f46e5] hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all transform active:scale-[0.98]"
              >
                {loading ? t('Loading') : t('Login') || 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
