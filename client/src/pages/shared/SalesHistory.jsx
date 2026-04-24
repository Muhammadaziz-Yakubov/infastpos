import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { SearchIcon, EyeIcon, PrinterIcon, CalendarIcon, XIcon, ShoppingBagIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { format } from 'date-fns';
import { db } from '../../db/db';

const SalesHistory = () => {
  const { t } = useTranslation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const [onlineSales, offlineSales] = await Promise.all([
        api.get('/sales').then(res => res.data).catch(() => []),
        db.pendingSales.where('synced').equals(0).toArray()
      ]);
      
      // Map offline sales to match the format
      const formattedOfflineSales = offlineSales.map(s => ({
        ...s,
        _id: s.id,
        receiptNumber: `OFF-${s.id}`,
        isOffline: true,
        cashierId: { name: t('Cashier') }
      }));

      setSales([...formattedOfflineSales, ...onlineSales]);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const filteredSales = sales.filter(s => 
    s.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cashierId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // QR Code generator helper
  const getQrCodeUrl = (sale) => {
    const url = `${window.location.origin}/receipt/${sale._id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div>
          <h1 className="page-header-title">{t('SalesHistory')}</h1>
          <p className="page-header-desc">{t('SalesHistoryDesc')}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="premium-card p-4">
        <div className="relative">
          <SearchIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t('SearchSalePlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-14"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6">{t('Receipt')} #</th>
                <th className="px-10 py-6">{t('Date')}</th>
                <th className="px-10 py-6">{t('Cashier')}</th>
                <th className="px-10 py-6">{t('PaymentMethod')}</th>
                <th className="px-10 py-6">{t('Total')}</th>
                <th className="px-10 py-6 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('Loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
                    {t('NoSalesFound')}
                  </td>
                </tr>
              ) : filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6 font-black text-slate-900 dark:text-white tracking-tight">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold opacity-50">#</span>
                      {sale.receiptNumber}
                      {sale.isOffline && (
                        <span className="px-3 py-1 bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400 text-[9px] rounded-lg font-black uppercase tracking-widest border border-rose-100/50 dark:border-rose-500/20">
                          {t('Offline')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-slate-500 dark:text-slate-400 tabular-nums">
                    {format(new Date(sale.createdAt), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-200/50 dark:border-white/5 shadow-sm">
                      {sale.cashierId?.name || t('Admin')}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                     <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${
                       sale.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                       sale.paymentMethod === 'card' ? 'bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 
                       'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                     }`}>
                       {sale.paymentMethod === 'cash' ? t('Cash') : sale.paymentMethod === 'card' ? t('Card') : t('Mixed')}
                     </span>
                  </td>
                  <td className="px-10 py-6 font-black text-indigo-600 dark:text-indigo-400 text-lg tabular-nums">
                    {sale.finalAmount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-normal">{t('Sum')}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleViewSale(sale)}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-indigo-600 rounded-2xl transition-all shadow-sm active:scale-90"
                        title={t('Close')}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleViewSale(sale)}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-indigo-600 rounded-2xl transition-all shadow-sm active:scale-90"
                        title={t('Print')}
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt View Modal */}
      {isModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 zoom-in-95 animate-in duration-300">
            <div id="receipt-print-content" className="p-12 font-mono text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="text-center mb-10">
                <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 mx-auto mb-6 rotate-3">
                  <ShoppingBagIcon className="h-9 w-9" />
                </div>
                <p className="font-black text-2xl tracking-tight text-slate-900 dark:text-white uppercase leading-tight">{selectedSale.storeId?.name || 'InFast POS'}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-[0.3em]">{t('OfficialReceipt')}</p>
                <div className="border-t-2 border-dashed border-slate-100 dark:border-white/10 mt-10" />
              </div>
              <div className="space-y-3 mb-10 uppercase text-[10px]">
                <div className="flex justify-between items-center"><span className="text-slate-400 font-black tracking-widest">{t('ReceiptNumber')}</span><span className="font-black text-slate-900 dark:text-white">#{selectedSale.receiptNumber}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-black tracking-widest">{t('Date')}</span><span className="font-black text-slate-900 dark:text-white">{format(new Date(selectedSale.createdAt), 'dd.MM.yyyy HH:mm')}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-black tracking-widest">{t('Cashier')}</span><span className="font-black text-slate-900 dark:text-white">{selectedSale.cashierId?.name || 'Admin'}</span></div>
              </div>
              <div className="border-t-2 border-dashed border-slate-100 dark:border-white/10 mb-10" />
              <div className="space-y-6 mb-10">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{item.name}</p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 tracking-widest">{item.quantity} x {item.sellPrice.toLocaleString()}</p>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-sm tabular-nums">{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-dashed border-slate-100 dark:border-white/10 mb-8" />
              <div className="flex justify-between items-center font-black text-slate-900 dark:text-white">
                <span className="uppercase tracking-[0.2em] text-xs">{t('Total')}</span>
                <span className="text-3xl tracking-tight tabular-nums">{selectedSale.finalAmount.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-normal">{t('Sum')}</span></span>
              </div>
              
              {/* QR Code Section */}
              <div className="mt-12 flex flex-col items-center justify-center space-y-6 p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                <img 
                  src={getQrCodeUrl(selectedSale)} 
                  alt="QR Code" 
                  className="h-32 w-32 object-contain mix-blend-multiply dark:invert shadow-sm"
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('ThankYou')}</p>
              </div>
            </div>
            <div className="px-10 pb-12 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-5">{t('Close')}</button>
              <button onClick={() => window.print()} className="btn-primary flex-1 py-5">
                <PrinterIcon className="h-5 w-5" />
                <span>{t('Print')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print-content, #receipt-print-content * { visibility: visible; }
          #receipt-print-content { position: fixed; left: 0; top: 0; width: 80mm; padding: 5mm; background: white !important; color: black !important; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default SalesHistory;
