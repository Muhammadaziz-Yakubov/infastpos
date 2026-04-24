import { BanIcon, PhoneIcon, LogoutIcon } from '@heroicons/react/outline';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Blocked = () => {
  const { user, logout, checkAuth } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await checkAuth();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] dark:bg-[#020617] flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-[#0f172a] rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none p-10 text-center border border-gray-100 dark:border-white/5">
        <div className="h-24 w-24 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100 dark:border-red-500/20 animate-pulse">
          <BanIcon className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          {t('BlockedTitle') || 'Siz bloklangansiz'}
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 font-medium">
          {t('BlockedMessage', { name: user?.name }) || `Hurmatli ${user?.name}, sizning kassa terminaliga kirish huquqingiz vaqtincha cheklangan.`}
        </p>

        <div className="bg-gray-50 dark:bg-[#1e293b] rounded-3xl p-6 mb-8 border border-gray-100 dark:border-white/5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('ContactOwner') || 'Do\'kon rahbari bilan bog\'laning'}</p>
          <div className="flex items-center justify-center gap-3 text-xl font-black text-gray-900 dark:text-white">
            <div className="h-10 w-10 bg-white dark:bg-[#0f172a] rounded-xl shadow-sm flex items-center justify-center border border-gray-100 dark:border-white/10">
              <PhoneIcon className="h-5 w-5 text-indigo-600" />
            </div>
            {user?.storePhone || t('NoNumber') || 'Raqam ko\'rsatilmagan'}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full bg-[#4f46e5] text-white font-black py-4 rounded-2xl hover:bg-[#4338ca] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
          >
            {t('CheckAgain') || 'Qayta tekshirish'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <LogoutIcon className="h-5 w-5" />
            {t('Logout')}
          </button>
        </div>

        <p className="mt-10 text-[10px] text-gray-300 dark:text-gray-600 font-bold uppercase tracking-widest">
          InFast POS • {t('SecuritySystem') || 'Xavfsizlik tizimi'}
        </p>
      </div>
    </div>
  );
};

export default Blocked;
