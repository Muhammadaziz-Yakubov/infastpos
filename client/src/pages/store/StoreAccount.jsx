import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { differenceInDays, format } from 'date-fns';
import api from '../../api/axios';
import { CreditCardIcon, OfficeBuildingIcon, PhoneIcon, LocationMarkerIcon, ExternalLinkIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';

const StoreAccount = () => {
  const { t } = useTranslation();
  const [store, setStore] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storeRes, settingsRes] = await Promise.all([
        api.get('/store/profile'),
        api.get('/store/settings')
      ]);
      setStore(storeRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">{t('Loading')}</div>;

  const expiryDate = new Date(store?.subscriptionExpiry);
  const daysLeft = differenceInDays(expiryDate, new Date());
  const isExpired = store?.subscriptionStatus === 'expired' || daysLeft < 0;
  const isWarning = daysLeft >= 0 && daysLeft <= 3;

  const progress = Math.max(0, Math.min(100, (daysLeft / 30) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-premium">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="page-header-title">{t('Settings')}</h1>
          <p className="page-header-desc">{t('SettingsDesc')}</p>
        </div>
      </div>

      {/* Store Info Card */}
      <div className="premium-card p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex-shrink-0 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-500/20 overflow-hidden shadow-xl shadow-indigo-600/5">
            {store?.logo ? <img src={store.logo} alt="logo" className="h-full w-full object-cover" /> : <OfficeBuildingIcon className="h-12 w-12 md:h-16 md:w-16" />}
          </div>
          <div className="flex-1 text-center md:text-left min-w-0">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight truncate">{store?.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 mt-6 gap-3 md:gap-4">
              <div className="flex items-center space-x-3 px-4 py-2.5 md:px-5 md:py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-all hover:border-indigo-500/30 group">
                <PhoneIcon className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-300 text-sm md:text-base truncate">{store?.phone}</span>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2.5 md:px-5 md:py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 transition-all hover:border-indigo-500/30 group">
                <LocationMarkerIcon className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-300 text-sm md:text-base truncate">{store?.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="premium-card overflow-hidden relative">
        {isExpired && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="h-24 w-24 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-rose-500/40">
              <CreditCardIcon className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('SubscriptionExpired')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-sm font-medium">{t('RenewSubscriptionDesc')}</p>
            <a 
              href="https://t.me/mister_yakubov" 
              target="_blank" 
              rel="noreferrer"
              className="mt-8 btn-primary px-12"
            >
              <span>{t('BuyNow')}</span>
              <ExternalLinkIcon className="h-5 w-5" />
            </a>
          </div>
        )}

        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('SubscriptionStatus')}</h2>
              <p className="page-header-desc mt-1">{t('SubscriptionStatusDesc')}</p>
            </div>
            <span className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${isExpired ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 shadow-sm shadow-rose-500/10' : 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 shadow-sm shadow-green-500/10'}`}>
              {isExpired ? t('Expired') : t('Active')}
            </span>
          </div>

          {isWarning && (
            <div className="mb-8 p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-amber-800 dark:text-amber-400 text-sm font-black flex items-center gap-3">
              <ExclamationCircleIcon className="h-5 w-5" />
              {t('SubscriptionWarning', { days: daysLeft })}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-[0.2em]">
              <span className="text-slate-400 dark:text-slate-500">Tugash muddati</span>
              <span className="text-slate-900 dark:text-white text-base tracking-tight">{store?.subscriptionExpiry ? format(expiryDate, 'dd.MM.yyyy') : '-'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-4 overflow-hidden shadow-inner p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${isWarning ? 'bg-amber-500' : 'bg-indigo-600'} shadow-[0_0_15px_rgba(79,70,229,0.3)]`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-black text-right text-slate-400 uppercase tracking-widest">{daysLeft > 0 ? t('DaysLeft', { days: daysLeft }) : t('Expired')}</p>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-white/5 p-10 border-t border-slate-100 dark:border-white/5 grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-transparent hover:border-indigo-500/30 transition-all cursor-pointer group premium-shadow">
            <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight">{t('MonthlyPlan')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-widest">{t('MonthlyPlanDesc')}</p>
            <p className="text-3xl font-black text-indigo-600 mt-6 tracking-tight">{settings?.monthlyPrice?.toLocaleString()} <span className="text-xs uppercase font-bold text-slate-400 ml-1">{t('Sum')}</span></p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-indigo-500/20 hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden premium-shadow">
             <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-5 py-1.5 rounded-bl-[1.5rem] uppercase tracking-widest shadow-xl">{t('Popular')}</div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight">{t('ThreeMonthPlan')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-widest">{t('ThreeMonthPlanDesc')}</p>
            <p className="text-3xl font-black text-indigo-600 mt-6 tracking-tight">{settings?.threeMonthPrice?.toLocaleString()} <span className="text-xs uppercase font-bold text-slate-400 ml-1">{t('Sum')}</span></p>
            <p className="text-[11px] text-green-600 dark:text-green-400 font-black mt-2 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-lg inline-block">{t('SaveAmount', { amount: ((settings?.monthlyPrice * 3) - settings?.threeMonthPrice)?.toLocaleString() })}</p>
          </div>
        </div>

        <div className="p-10 pt-0 bg-slate-50/50 dark:bg-white/5 flex flex-col items-center">
            <a 
              href="https://t.me/mister_yakubov" 
              target="_blank" 
              rel="noreferrer"
              className="btn-primary w-full py-5"
            >
              <span>Sotib olish</span>
              <ExternalLinkIcon className="h-6 w-6" />
            </a>
            <p className="text-[10px] font-bold text-slate-400 mt-6 text-center italic uppercase tracking-[0.1em] max-w-md">
              {t('PaymentInstruction')}
            </p>
        </div>
      </div>
    </div>
  );
};

export default StoreAccount;
