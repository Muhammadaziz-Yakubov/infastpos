import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  DownloadIcon,
  TrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';

const Reports = () => {
  const { t } = useTranslation();
  const { theme } = useUIStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/reports?period=${period}`;
      if (dateRange.from && dateRange.to) {
        url = `/reports?from=${dateRange.from}&to=${dateRange.to}`;
      }
      const { data } = await api.get(url);
      setData(data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    daily: t('ReportDaily'),
    weekly: t('ReportWeekly'),
    monthly: t('ReportMonthly'),
  };

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="page-header-title">{t('Reports')}</h1>
          <p className="page-header-desc">{t('ReportsDesc')}</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2.5 md:px-6 md:py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                period === p 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="premium-card p-6 md:p-10 flex flex-col justify-between group">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3.5 md:p-4 rounded-[1.25rem] md:rounded-[1.5rem] bg-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
                <CurrencyDollarIcon className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
              </div>
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('ReportTotalRevenue')}</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{data?.summary?.totalRevenue?.toLocaleString() || 0} <span className="text-xs font-bold text-slate-400 uppercase ml-1">{t('Sum')}</span></p>
          </div>
          <div className="mt-6 h-1 w-full bg-emerald-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-2/3 animate-in slide-in-from-left duration-1000" />
          </div>
        </div>

        <div className="premium-card p-10 flex flex-col justify-between group">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-4 rounded-[1.5rem] bg-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                <TrendingUpIcon className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('ReportNetProfit')}</span>
            </div>
            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{data?.summary?.totalProfit?.toLocaleString() || 0} <span className="text-xs font-bold text-slate-400 uppercase ml-1">{t('Sum')}</span></p>
          </div>
          <div className="mt-6 h-1 w-full bg-emerald-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/2 animate-in slide-in-from-left duration-1000" />
          </div>
        </div>

        <div className="premium-card p-10 flex flex-col justify-between group">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-4 rounded-[1.5rem] bg-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                <ChartBarIcon className="h-6 w-6 text-indigo-500" />
              </div>
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('ReportSaleCount')}</span>
            </div>
            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{data?.summary?.saleCount || 0}</p>
          </div>
          <div className="mt-6 h-1 w-full bg-indigo-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-3/4 animate-in slide-in-from-left duration-1000" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Stats Chart */}
        <div className="premium-card p-6 md:p-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
                <TrendingUpIcon className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
              </div>
              {t('ReportByProduct')}
            </h2>
          </div>
          <div className="h-80 w-full">
            {!loading && data?.productStats && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data?.productStats?.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 800}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 800}} 
                  />
                  <Tooltip 
                     cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', radius: 16}}
                     contentStyle={{
                       backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                       borderRadius: '24px',
                       border: 'none',
                       boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                       padding: '20px',
                       fontWeight: 900
                     }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[10, 10, 0, 0]} name={t('ReportRevenue')} barSize={24} />
                  <Bar dataKey="profit" fill="#10b981" radius={[10, 10, 0, 0]} name={t('ReportProfit')} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {loading && (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/5 rounded-[2rem] animate-pulse">
                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('Loading')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="premium-card overflow-hidden flex flex-col">
          <div className="px-12 py-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
             <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('ReportAnalysis')}</h2>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('ReportByProductSub')}</p>
             </div>
             <button className="btn-secondary px-6 py-3">
                <DownloadIcon className="h-4 w-4 text-indigo-500" /> 
                <span className="text-[10px] font-black uppercase tracking-widest">{t('ReportCSVExport')}</span>
             </button>
          </div>
          <div className="overflow-x-auto max-h-[440px] custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] sticky top-0 z-10">
                <tr>
                  <th className="px-10 py-6">{t('Product')}</th>
                  <th className="px-10 py-6">{t('Quantity')}</th>
                  <th className="px-10 py-6">{t('ReportRevenue')}</th>
                  <th className="px-10 py-6">{t('ReportProfit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {data?.productStats?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6 text-sm font-black text-slate-900 dark:text-white tracking-tight">{p.name}</td>
                    <td className="px-10 py-6">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {p.qty}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-sm font-black text-slate-900 dark:text-white tabular-nums">{p.revenue.toLocaleString()}</td>
                    <td className="px-10 py-6 text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">+{p.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
