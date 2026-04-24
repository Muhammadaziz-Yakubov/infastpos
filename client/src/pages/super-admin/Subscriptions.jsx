import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCardIcon, SearchIcon, FilterIcon, CalendarIcon, ShoppingBagIcon } from '@heroicons/react/outline';
import api from '../../api/axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const AdminSubscriptions = () => {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/admin/subscriptions');
      setSubscriptions(data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subscriptions.filter(s => 
    s.storeId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-header-title">{t('Subscriptions')}</h1>
          <p className="page-header-desc">{t('SubscriptionHistoryDesc') || 'Tizimdagi barcha to\'lovlar va obuna faollashuvlari'}</p>
        </div>
      </div>

      <div className="premium-card p-4">
        <div className="relative">
          <SearchIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t('SearchStorePlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-14"
          />
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Store')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Plan')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Price')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('StartDate')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('ExpiryDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('Loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
                    {t('NoResults')}
                  </td>
                </tr>
              ) : filteredSubs.map((sub) => (
                <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                       <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                          <ShoppingBagIcon className="h-6 w-6" />
                       </div>
                       <span className="font-black text-slate-900 dark:text-white tracking-tight">{sub.storeId?.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      sub.plan === 'monthly' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                    }`}>
                      {sub.plan === 'monthly' ? t('MonthlyPlan') : t('ThreeMonthPlan')}
                    </span>
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900 dark:text-white text-base">
                    {sub.price.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t('Sum')}</span>
                  </td>
                  <td className="px-10 py-6 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                    {format(new Date(sub.startDate), 'dd.MM.yyyy')}
                  </td>
                  <td className="px-10 py-6 text-[13px] font-black text-indigo-600 dark:text-indigo-400">
                    {format(new Date(sub.endDate), 'dd.MM.yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
