import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  UserIcon,
  CreditCardIcon,
  PrinterIcon
} from '@heroicons/react/outline';
import { format } from 'date-fns';
import api from '../../api/axios';

const PublicReceipt = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const { data } = await api.get(`/sales/${id}`);
        setSale(data);
      } catch (error) {
        console.error("Error fetching receipt:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Chek topilmadi</h1>
          <p className="text-slate-500">Kechirasiz, ushbu chek mavjud emas yoki o'chirilgan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-6 font-sans transition-colors duration-500">
      <div className="max-w-lg mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-emerald-500 rounded-[2rem] shadow-xl shadow-emerald-500/20 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Xarid uchun rahmat!</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">To'lovingiz muvaffaqiyatli qabul qilindi</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {/* Header Info */}
          <div className="p-10 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Do'kon</p>
                <h2 className="text-xl font-black text-indigo-600 dark:text-indigo-400">{sale.storeId?.name || 'InFast POS'}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Chek raqami</p>
                <p className="font-black text-slate-900 dark:text-white tracking-tight">#{sale.receiptNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sana</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{format(new Date(sale.createdAt), 'dd.MM.yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kassir</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{sale.cashierId?.name || 'Admin'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="p-10 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.1em]">Mahsulotlar</h3>
            <div className="space-y-4">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.quantity} x {item.sellPrice.toLocaleString()} so'm</p>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white">{item.total.toLocaleString()} so'm</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-slate-400 font-bold">To'lov usuli</p>
                <p className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">{sale.paymentMethod === 'cash' ? 'Naqd' : 'Karta'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Jami</p>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{sale.finalAmount.toLocaleString()} <span className="text-sm">so'm</span></p>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="p-8 bg-indigo-600 text-center">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em]">Powered by</p>
            <h4 className="text-xl font-black text-white tracking-tighter mt-1">InFast <span className="text-indigo-300">POS</span></h4>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex gap-4 animate-in fade-in duration-700 delay-500">
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-black py-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 flex items-center justify-center space-x-3 transition-all hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .bg-slate-50, .dark:bg-slate-950 { background: white !important; }
          button { display: none !important; }
          .rounded-[3rem] { border-radius: 1rem !important; }
          .shadow-2xl { shadow: none !important; border: 1px solid #eee; }
        }
      `}</style>
    </div>
  );
};

export default PublicReceipt;
