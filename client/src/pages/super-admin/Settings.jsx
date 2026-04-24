import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CurrencyDollarIcon, 
  ClockIcon, 
  SaveIcon,
  CogIcon
} from '@heroicons/react/outline';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';

const AdminSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    monthlyPrice: 200000,
    threeMonthPrice: 550000,
    trialDays: 7
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      if (data) setSettings(data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Sozlamalar saqlandi');
    } catch (error) {
      toast.error(t('SaleError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse font-black uppercase tracking-widest text-slate-400">{t('Loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-premium">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-header-title">{t('Settings')}</h1>
          <p className="page-header-desc">{t('AdminSettingsDesc') || 'Obuna narxlari va trial muddatini boshqarish'}</p>
        </div>
        <div className="h-16 w-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 rotate-3">
          <CogIcon className="h-9 w-9" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Price */}
          <div className="premium-card p-10 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                <CurrencyDollarIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('MonthlyPlan')}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('MonthlyPlanDesc')}</p>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Narx (so'm)</label>
              <input 
                type="number"
                required
                value={settings.monthlyPrice}
                onChange={(e) => setSettings({...settings, monthlyPrice: Number(e.target.value)})}
                className="w-full px-6 py-6 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none text-3xl font-black text-slate-900 dark:text-white transition-all tabular-nums"
                placeholder="200,000"
              />
            </div>
          </div>

          {/* 3 Month Price */}
          <div className="premium-card p-10 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                <CurrencyDollarIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('ThreeMonthPlan')}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('ThreeMonthPlanDesc')}</p>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Narx (so'm)</label>
              <input 
                type="number"
                required
                value={settings.threeMonthPrice}
                onChange={(e) => setSettings({...settings, threeMonthPrice: Number(e.target.value)})}
                className="w-full px-6 py-6 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none text-3xl font-black text-slate-900 dark:text-white transition-all tabular-nums"
                placeholder="550,000"
              />
            </div>
          </div>

          {/* Trial Days */}
          <div className="premium-card p-10 space-y-6 col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                <ClockIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('TrialPeriod') || 'Trial Muddat'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('TrialPeriodDesc') || 'Yangi do\'konlar uchun bepul kunlar'}</p>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">{t('DaysCount') || 'Kunlar soni'}</label>
              <input 
                type="number"
                required
                value={settings.trialDays}
                onChange={(e) => setSettings({...settings, trialDays: Number(e.target.value)})}
                className="w-full px-6 py-6 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none text-3xl font-black text-slate-900 dark:text-white transition-all tabular-nums"
                placeholder="7"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit"
            disabled={saving}
            className="btn-primary px-16 py-6 text-base shadow-2xl shadow-indigo-600/30 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {saving ? 'Saqlanmoqda...' : (
              <>
                <SaveIcon className="h-6 w-6" />
                <span>{t('SaveSettings') || 'Sozlamalarni Saqlash'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
