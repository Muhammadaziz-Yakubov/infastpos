import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PlusCircleIcon, 
  MinusCircleIcon, 
  SearchIcon,
  ClipboardListIcon,
  XIcon
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const Inventory = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('in'); // 'in' or 'out'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setProducts(data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error(t('EnterAmount'));

    try {
      const endpoint = modalType === 'in' ? '/inventory/in' : '/inventory/out';
      await api.post(endpoint, {
        productId: selectedProduct._id,
        quantity: Number(amount)
      });
      toast.success(t('StockUpdateSuccess'));
      setIsModalOpen(false);
      setAmount('');
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || t('SaleError'));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery)
  );

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="page-header-title">{t('Stocktaking')}</h1>
          <p className="page-header-desc">{t('InventoryDesc')}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="premium-card p-4">
        <div className="relative">
          <SearchIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t('SearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-14 shadow-sm"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Product')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Barcode')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Category')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Stock')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">{t('Actions')}</th>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
                    {t('NoResults')}
                  </td>
                </tr>
              ) : filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 dark:text-white tracking-tight text-base">{p.name}</p>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">{p.barcode || '-'}</td>
                  <td className="px-10 py-6 text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]">
                    <span className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                      {p.category?.name || '-'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-5 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${p.quantity <= p.lowStockAlert ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 shadow-sm shadow-rose-500/10' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'}`}>
                      {p.quantity} {p.unit}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right space-x-3">
                    <button 
                      onClick={() => { setSelectedProduct(p); setModalType('in'); setIsModalOpen(true); }}
                      className="p-3.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all shadow-sm group-hover:scale-110"
                      title={t('StockIn')}
                    >
                      <PlusCircleIcon className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={() => { setSelectedProduct(p); setModalType('out'); setIsModalOpen(true); }}
                      className="p-3.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-2xl transition-all shadow-sm group-hover:scale-110"
                      title={t('StockOut')}
                    >
                      <MinusCircleIcon className="h-6 w-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 zoom-in-95 animate-in duration-300">
            <div className={`px-12 py-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center ${modalType === 'in' ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : 'bg-amber-50/50 dark:bg-amber-500/10'}`}>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {modalType === 'in' ? t('StockIn') : t('StockOut')}
                </h2>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('InventoryActions')}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm hover:rotate-90">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-12 space-y-10">
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 premium-shadow">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{t('Product')}:</p>
                <p className="font-black text-xl text-slate-900 dark:text-white leading-tight">{selectedProduct?.name}</p>
                <p className="text-[11px] font-black text-indigo-500 uppercase mt-4 tracking-widest flex items-center gap-2">
                  <ClipboardListIcon className="h-4 w-4" />
                  {t('CurrentStock')}: {selectedProduct?.quantity} {selectedProduct?.unit}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">{t('EnterAmount')} ({selectedProduct?.unit})</label>
                <input 
                  type="number"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-6 py-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none text-4xl font-black text-slate-900 dark:text-white transition-all text-center tabular-nums"
                  placeholder="0"
                />
              </div>

              <button 
                type="submit"
                className={`w-full py-5 rounded-[2rem] font-black text-white shadow-2xl transition-all uppercase tracking-[0.25em] text-[12px] active:scale-[0.98] ${
                  modalType === 'in' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                }`}
              >
                {t('SaveStock')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
