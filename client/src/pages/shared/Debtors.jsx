import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  SearchIcon, 
  PhoneIcon, 
  CurrencyDollarIcon,
  ChevronRightIcon,
  UserIcon,
  XIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';      
import { format } from 'date-fns';

const Debtors = () => {
  const { t } = useTranslation();
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebtor, setSelectedDebtor] = useState(null);

  useEffect(() => {
    fetchDebtors();
  }, []);

  const fetchDebtors = async () => {
    try {
      const { data } = await api.get('/sales/debtors');
      setDebtors(data);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handlePayDebt = async (phone) => {
    if (!window.confirm('Qarzni yopishga aminmisiz?')) return;
    
    try {
      await api.post(`/sales/debtors/${encodeURIComponent(phone)}/pay`);
      toast.success('Qarz muvaffaqiyatli yopildi');
      setSelectedDebtor(null);
      fetchDebtors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Qarz yopishda xatolik yuz berdi');
    }
  };

  const filteredDebtors = debtors.filter(d => 
    d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.customerPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div>
          <h1 className="page-header-title">{t('Debtors')}</h1>
          <p className="page-header-desc">{t('DebtorsDesc')}</p>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 premium-card p-4">
          <div className="relative">
            <SearchIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder={t('SearchByCustomer')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-14"
            />
          </div>
        </div>
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 flex items-center justify-between shadow-2xl shadow-indigo-600/30 group hover:scale-[1.02] transition-all duration-500">
          <div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">{t('TotalDebt')}</p>
            <p className="text-2xl font-black text-white mt-2 tabular-nums">
              {debtors.reduce((acc, curr) => acc + curr.totalDebt, 0).toLocaleString()} <span className="text-xs font-bold text-indigo-100 uppercase ml-1">so'm</span>
            </p>
          </div>
          <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
            <CurrencyDollarIcon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Debtors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="premium-card h-64 animate-pulse" />
          ))
        ) : filteredDebtors.length === 0 ? (
          <div className="col-span-full py-40 text-center">
            <UserGroupIcon className="h-24 w-24 mx-auto text-slate-200 dark:text-slate-800 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-[0.25em]">{t('NoDebtorsFound')}</p>
          </div>
        ) : filteredDebtors.map((debtor) => (
          <div 
            key={debtor.customerPhone}
            className="premium-card p-6 md:p-10 flex flex-col group cursor-pointer hover:scale-[1.02] transition-all duration-500"
            onClick={() => setSelectedDebtor(debtor)}
          >
            <div className="flex items-start justify-between mb-6 md:mb-8">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-600/5">
                <UserIcon className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <div className="p-2 md:p-3 bg-slate-50 dark:bg-white/5 rounded-xl md:rounded-2xl text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-2">
                <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 truncate tracking-tight">{debtor.customerName}</h3>
            <div className="flex items-center text-indigo-500 font-black text-[10px] md:text-[11px] uppercase tracking-widest mb-6 md:mb-10">
              <PhoneIcon className="h-4 w-4 mr-2" />
              {debtor.customerPhone}
            </div>
            <div className="pt-6 md:pt-8 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 md:mb-2">{t('DebtAmount')}</p>
                <p className="text-xl md:text-2xl font-black text-rose-500 tabular-nums">{debtor.totalDebt.toLocaleString()} <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase ml-1">so'm</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 md:mb-2">{t('SalesCount')}</p>
                <p className="text-sm md:text-base font-black text-slate-700 dark:text-slate-300">{debtor.salesCount} ta</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Debtor Details Modal */}
      {selectedDebtor && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-white/10 zoom-in-95 animate-in duration-300">
            <div className="px-12 py-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center space-x-6">
                <div className="h-16 w-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{selectedDebtor.customerName}</h2>
                  <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-1">{selectedDebtor.customerPhone}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDebtor(null)} 
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm hover:rotate-90"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-12 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-6">
               <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-4">{t('DebtHistory')}</h4>
               <div className="grid gap-6">
                 {selectedDebtor.sales.map((sale, idx) => (
                   <div key={idx} className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex justify-between items-center group hover:bg-white dark:hover:bg-white/10 transition-all duration-300">
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          Chek #{sale.receiptNumber}
                        </p>
                        <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{format(new Date(sale.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-rose-500 tabular-nums">{sale.finalAmount.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase ml-1">so'm</span></p>
                         <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mt-1">{t('Unpaid')}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="p-12 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
               <div>
                  <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-2">{t('TotalDebtAmount')}</p>
                  <p className="text-4xl font-black text-rose-600 tracking-tight tabular-nums">{selectedDebtor.totalDebt.toLocaleString()} <span className="text-lg font-bold text-rose-600/60 uppercase ml-1">so'm</span></p>
               </div>
               <button 
                  onClick={() => handlePayDebt(selectedDebtor.customerPhone)}
                  className="btn-primary px-12 py-6 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
               >
                 <CheckCircleIcon className="h-6 w-6" />
                 <span>{t('CloseDebt')}</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debtors;
