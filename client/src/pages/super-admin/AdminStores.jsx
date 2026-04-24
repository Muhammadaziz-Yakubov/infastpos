import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, CreditCardIcon, XIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { format } from 'date-fns';

const AdminStores = () => {
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    logo: ''
  });

  const [subData, setSubData] = useState({
    plan: 'monthly'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storesRes, settingsRes] = await Promise.all([
        api.get('/admin/stores'),
        api.get('/admin/settings')
      ]);
      setStores(storesRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name || '',
      ownerName: store.owner?.name || '',
      username: store.owner?.username || '',
      password: '', // Leave empty for security
      phone: store.owner?.phone || '',
      address: store.address || '',
      logo: store.logo || ''
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedStore(null);
    setFormData({
      name: '',
      ownerName: '',
      username: '',
      password: '',
      phone: '',
      address: '',
      logo: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/admin/stores/${selectedStore._id}`, formData);
        toast.success(t('UpdateSuccess'));
      } else {
        await api.post('/admin/stores', formData);
        toast.success(t('CreateSuccess'));
      }
      closeModal();
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || t('SaleError'));
    }
  };

  const handleActivateSub = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/stores/${selectedStore._id}/subscription`, subData);
      toast.success(t('ActivateSuccess'));
      setIsSubModalOpen(false);
      fetchStores();
    } catch (error) {
      toast.error(t('SaleError'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('DeleteConfirm'))) {
      try {
        await api.delete(`/admin/stores/${id}`);
        toast.success(t('DeleteSuccess'));
        fetchStores();
      } catch (error) {
        toast.error(error.response?.data?.message || t('SaleError'));
      }
    }
  };

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('StoreManagement')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{t('StoreManagementDesc')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] font-bold text-sm"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{t('NewStore')}</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 premium-shadow">
        <div className="relative">
          <SearchIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder={t('SearchStorePlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden premium-shadow">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Store')}</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Owner')}</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Status')}</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('ExpiryDate')}</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('Loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest">
                    {t('NoResults')}
                  </td>
                </tr>
              ) : filteredStores.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black border border-indigo-100 dark:border-indigo-500/20 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                        {s.logo ? <img src={s.logo} className="h-full w-full object-cover" alt="" /> : s.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-900 dark:text-white tracking-tight">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600 dark:text-gray-400">{s.owner?.name || '-'}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      s.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                      s.subscriptionStatus === 'expired' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 
                      'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {s.subscriptionStatus === 'active' ? t('Active') : s.subscriptionStatus === 'expired' ? t('Expired') : t('Trial')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600 dark:text-gray-400">
                    {s.subscriptionExpiry ? format(new Date(s.subscriptionExpiry), 'dd.MM.yyyy') : '-'}
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button 
                      onClick={() => { setSelectedStore(s); setIsSubModalOpen(true); }}
                      className="p-3 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all"
                      title={t('UpdateSubscription')}
                    >
                      <CreditCardIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleEdit(s)}
                      className="p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(s._id)}
                      className="p-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
                      title={t('Delete')}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/10 zoom-in-95 animate-in duration-200">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {isEditMode ? t('EditStore') : t('AddStore')}
              </h2>
              <button onClick={closeModal} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors shadow-sm">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('StoreName')}</label>
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white font-bold transition-all" placeholder="Store Name" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('OwnerName')}</label>
                  <input required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:white font-bold transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('Phone')}</label>
                  <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white font-bold transition-all" placeholder="+998..." />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('Login')}</label>
                  <input required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white font-bold transition-all" placeholder="admin" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('Password')}</label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white font-bold transition-all" placeholder="••••••••" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{t('Address')}</label>
                  <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white font-bold transition-all" placeholder="Address..." />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-8 py-3.5 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-700 dark:hover:text-white transition-colors">{t('Cancel')}</button>
                <button type="submit" className="px-12 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all uppercase text-[10px] tracking-widest">
                  {isEditMode ? t('Update') : t('Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 zoom-in-95 animate-in duration-200">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('ActivateSubscription')}</h2>
              <button onClick={() => setIsSubModalOpen(false)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors shadow-sm"><XIcon className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleActivateSub} className="p-10 space-y-8">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">{t('Store')}</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{selectedStore?.name}</p>
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">{t('SelectPlan')}</label>
                <div className="grid grid-cols-1 gap-4">
                  <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${subData.plan === 'monthly' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}>
                    <div className="flex items-center">
                      <input type="radio" name="plan" value="monthly" checked={subData.plan === 'monthly'} onChange={(e) => setSubData({plan: e.target.value})} className="hidden" />
                      <div>
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('MonthlyPlan')}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">30 {t('Days')}</p>
                      </div>
                    </div>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{settings?.monthlyPrice?.toLocaleString()} {t('Sum')}</span>
                  </label>
                  <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${subData.plan === 'quarterly' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}>
                    <div className="flex items-center">
                      <input type="radio" name="plan" value="quarterly" checked={subData.plan === 'quarterly'} onChange={(e) => setSubData({plan: e.target.value})} className="hidden" />
                      <div>
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('QuarterlyPlan')}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">90 {t('Days')}</p>
                      </div>
                    </div>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{settings?.threeMonthPrice?.toLocaleString()} {t('Sum')}</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all uppercase tracking-widest text-[11px]">
                {t('Activate')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
