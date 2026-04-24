import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  OfficeBuildingIcon, 
  CurrencyDollarIcon,
  TrendingUpIcon,
  ExclamationCircleIcon,
  PlusCircleIcon
} from '@heroicons/react/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import api from '../../api/axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: t('TotalStores') || 'Jami do\'konlar', value: stats?.totalStores || 0, icon: OfficeBuildingIcon, color: 'from-indigo-600 to-blue-600', shadow: 'shadow-indigo-500/30' },
    { name: t('ActiveSubscriptions') || 'Faol obunalar', value: stats?.activeStores || 0, icon: CheckBadgeIcon, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/30' },
    { name: t('Expired') || 'Muddati o\'tgan', value: stats?.expiredStores || 0, icon: ExclamationCircleIcon, color: 'from-rose-500 to-orange-500', shadow: 'shadow-rose-500/30' },
    { name: t('TotalRevenue') || 'Jami tushum', value: (stats?.totalRevenue?.toLocaleString() || 0) + ' ' + t('Sum'), icon: CurrencyDollarIcon, color: 'from-amber-500 to-yellow-500', shadow: 'shadow-amber-500/30' },
  ];

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('Loading')}</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-header-title">{t('Dashboard')}</h1>
          <p className="page-header-desc">{t('AdminDashboardDesc') || 'Tizimning umumiy o\'sish va faollik ko\'rsatkichlari'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card) => (
          <div key={card.name} className="premium-card p-8 flex items-center space-x-6 hover:scale-[1.02] transition-all duration-500 group cursor-pointer">
            <div className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white ${card.shadow} group-hover:rotate-12 transition-transform duration-500`}>
              <card.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.name}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 premium-card p-10">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <TrendingUpIcon className="h-6 w-6 text-indigo-600" />
                {t('StoreGrowthChart') || 'Do\'konlar o\'sish grafigi'}
              </h2>
           </div>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.growthData || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{stroke: '#4f46e5', strokeWidth: 1}} 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px 24px'}}
                    itemStyle={{fontWeight: 900, color: '#4f46e5', fontSize: '14px'}}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="premium-card p-10 flex flex-col">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">{t('RecentAdded') || 'Yaqinda qo\'shilganlar'}</h2>
          <div className="space-y-6 flex-1">
             {stats?.recentStores?.length > 0 ? (
               stats.recentStores.map((store) => (
                 <div key={store._id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/10 transition-all">
                    <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                       <PlusCircleIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                       <p className="font-black text-slate-900 dark:text-white text-sm truncate">{store.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{format(new Date(store.createdAt), 'dd.MM.yyyy')}</p>
                    </div>
                 </div>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20 py-20">
                  <PlusCircleIcon className="h-16 w-16 text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('NoResults')}</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckBadgeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export default AdminDashboard;
