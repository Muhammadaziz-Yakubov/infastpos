import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  ExclamationIcon,
  TrendingUpIcon
} from '@heroicons/react/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { format } from 'date-fns';
import useUIStore from '../../store/uiStore';

const Dashboard = () => {
  const { t } = useTranslation();
  const { theme } = useUIStore();
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        api.get('/store/dashboard-stats'),
        api.get('/sales')
      ]);
      setStats(statsRes.data);
      setRecentSales(salesRes.data.slice(0, 5));
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      name: t('TodayRevenue'), 
      value: (stats?.totalRevenueToday?.toLocaleString() || 0), 
      icon: CurrencyDollarIcon, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      name: t('TodaySales'), 
      value: stats?.totalSalesToday || 0, 
      icon: ShoppingBagIcon, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      name: t('TotalProducts'), 
      value: stats?.totalProducts || 0, 
      icon: CubeIcon, 
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    { 
      name: t('LowStock'), 
      value: stats?.lowStockProducts || 0, 
      icon: ExclamationIcon, 
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10'
    },
  ];

  const chartData = [
    { name: t('Mon'), total: 400000 },
    { name: t('Tue'), total: 300000 },
    { name: t('Wed'), total: 200000 },
    { name: t('Thu'), total: 278000 },
    { name: t('Fri'), total: 189000 },
    { name: t('Sat'), total: 239000 },
    { name: t('Sun'), total: stats?.totalRevenueToday || 0 },
  ];

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h1 className="page-header-title">{t('Welcome')}</h1>
          <p className="page-header-desc">{t('TodayStatus')}</p>
        </div>
        <div className="px-8 py-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 flex flex-col items-end group hover:scale-105 transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">{t('Date')}</p>
          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-500 transition-colors">{format(new Date(), 'dd MMMM, yyyy')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {statCards.map((card) => (
          <div key={card.name} className="premium-card p-6 md:p-10 flex flex-col justify-between group hover:scale-[1.05] transition-all duration-500">
            <div className={`h-14 w-14 md:h-16 md:w-16 rounded-[1.25rem] md:rounded-[1.5rem] ${card.bgColor} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-slate-200/50 dark:shadow-black/20`}>
              <card.icon className={`h-6 w-6 md:h-8 md:w-8 ${card.color}`} />
            </div>
            <div className="mt-8">
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{card.name}</p>
              <div className="flex items-baseline space-x-2 mt-2">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">{card.value}</p>
                {card.name === t('TodayRevenue') && <span className="text-xs font-black text-slate-400 uppercase">{t('Sum')}</span>}
              </div>
            </div>
            <div className={`mt-6 h-1 w-full rounded-full opacity-20 ${card.bgColor.replace('/10', '')}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Chart Section */}
        <div className="lg:col-span-2 premium-card p-6 md:p-12">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
                <TrendingUpIcon className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
              </div>
              {t('WeeklySales')}
            </h2>
            <div className="flex space-x-2">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">{t('All')}</span>
            </div>
          </div>
          <div className="h-80 w-full">
            {!loading && stats ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 800}}
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', radius: 16}}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      padding: '20px'
                    }}
                    itemStyle={{
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      letterSpacing: '0.15em'
                    }}
                  />
                  <Bar dataKey="total" radius={[12, 12, 12, 12]} barSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : (theme === 'dark' ? '#1e293b' : '#f1f5f9')} className="transition-all duration-500" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/5 rounded-[2rem] animate-pulse">
                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('Loading')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales Section */}
        <div className="premium-card p-6 md:p-12 flex flex-col">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('RecentSales')}</h2>
            <div className="h-8 w-8 md:h-10 md:w-10 bg-slate-100 dark:bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center">
              <ShoppingBagIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
            </div>
          </div>
          <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {recentSales.map((sale) => (
              <div key={sale._id} className="flex justify-between items-center group cursor-default hover:bg-slate-50 dark:hover:bg-white/5 p-4 rounded-3xl transition-all duration-300">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm">
                    <ShoppingBagIcon className="h-7 w-7 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">#{sale.receiptNumber.slice(-4)}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{format(new Date(sale.createdAt), 'HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{sale.finalAmount.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5">{t('Sum')}</p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-24 w-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <ShoppingBagIcon className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em]">{t('NoSales')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
