import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, UserCircleIcon, KeyIcon, BanIcon, CheckCircleIcon, XIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const Employees = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'cashier'
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      toast.success(t('EmployeeSuccess'));
      setIsModalOpen(false);
      setFormData({ name: '', username: '', password: '', role: 'cashier' });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || t('SaleError'));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/employees/${id}`, { isActive: !currentStatus });
      toast.success(t('StatusUpdated'));
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || t('SaleError'));
    }
  };

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="page-header-title">{t('Employees')}</h1>
          <p className="page-header-desc">{t('EmployeesDesc')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{t('AddEmployee')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-4">
             <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('Loading')}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full py-40 text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
            {t('NoResults')}
          </div>
        ) : employees.map((emp) => (
          <div key={emp._id} className="premium-card p-6 md:p-10 flex flex-col group hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 md:space-x-6 min-w-0">
                <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.25rem] md:rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-600/5">
                  <UserCircleIcon className="h-8 w-8 md:h-12 md:w-12" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg md:text-xl tracking-tight leading-tight truncate">{emp.name}</h3>
                  <p className="text-[10px] md:text-xs font-black text-indigo-500 mt-1 uppercase tracking-widest opacity-80 truncate">@{emp.username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
               <div className="flex flex-col gap-2">
                  <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border ${
                    emp.role === 'store_owner' ? 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 'bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                  }`}>
                    {emp.role === 'store_owner' ? t('OwnerRole') : t('CashierRole')}
                  </span>
                  {emp.isActive ? (
                    <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mt-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" /> {t('Active')}
                    </div>
                  ) : (
                    <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 dark:text-rose-400 mt-1">
                      <div className="h-2 w-2 rounded-full bg-rose-500 mr-2" /> {t('Blocked')}
                    </div>
                  )}
               </div>
               {emp.role !== 'store_owner' && (
                 <button 
                  onClick={() => toggleStatus(emp._id, emp.isActive)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-sm ${
                    emp.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                  }`}
                 >
                   {emp.isActive ? t('Block') : t('Unblock')}
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* New Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 zoom-in-95 animate-in duration-300">
            <div className="px-12 py-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('NewEmployee')}</h2>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('AddEmployeeSub')}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm hover:rotate-90">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('FullName')}</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('LoginLabel')}</label>
                <input required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input-field" placeholder="cashier1" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('PasswordLabel')}</label>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" placeholder="••••••••" />
              </div>
              <div className="pt-6">
                <button type="submit" className="btn-primary w-full py-5">
                  {t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
