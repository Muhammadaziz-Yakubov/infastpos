import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  CreditCardIcon, 
  CubeIcon, 
  ChartBarIcon, 
  CogIcon,
  LogoutIcon,
  HomeIcon,
  UserGroupIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const languages = [
  { code: 'uz', label: "O'zbekcha", flag: 'https://flagcdn.com/w40/uz.png' },
  { code: 'ru', label: 'Русский', flag: 'https://flagcdn.com/w40/ru.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
];

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage } = useUIStore();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    setLangOpen(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const navItems = {
    super_admin: [
      { name: t('Dashboard'), path: '/admin/dashboard', icon: HomeIcon },
      { name: t('Stores'), path: '/admin/stores', icon: ShoppingBagIcon },
      { name: t('Subscriptions'), path: '/admin/subscriptions', icon: CreditCardIcon },
      { name: t('Settings'), path: '/admin/settings', icon: CogIcon },
    ],
    store_owner: [
      { name: t('Dashboard'), path: '/store/dashboard', icon: HomeIcon },
      { name: t('Products'), path: '/store/products', icon: CubeIcon },
      { name: t('Inventory'), path: '/store/inventory', icon: ShoppingBagIcon },
      { name: t('Sales'), path: '/store/sales', icon: ChartBarIcon },
      { name: t('Debtors'), path: '/store/debtors', icon: UserGroupIcon },
      { name: t('Employees'), path: '/store/employees', icon: UserGroupIcon },
      { name: t('Reports'), path: '/store/reports', icon: ChartBarIcon },
      { name: t('Settings'), path: '/store/account', icon: CogIcon },
    ],
    cashier: [
      { name: t('Sale'), path: '/cashier/pos', icon: ShoppingBagIcon },
      { name: t('Warehouse'), path: '/store/products', icon: CubeIcon },
      { name: t('Stocktaking'), path: '/store/inventory', icon: ChartBarIcon },
      { name: t('Debtors'), path: '/store/debtors', icon: UserGroupIcon },
      { name: t('Cashbox'), path: '/cashier/sales-history', icon: CreditCardIcon },
    ]
  };

  const items = navItems[user?.role] || [];

  const isPOS = location.pathname === '/cashier/pos';

  const SidebarContent = ({ collapsed = false, isMobile = false }) => (
    <div className="flex flex-col h-full">
      <div className={`p-8 pb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-left duration-500 min-w-0 flex-1">
            <div className="h-12 w-12 bg-indigo-600 rounded-[1.25rem] flex-shrink-0 flex items-center justify-center shadow-2xl shadow-indigo-600/40 rotate-3 group-hover:rotate-0 transition-transform">
              <ShoppingBagIcon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none break-words line-clamp-2">
              {user?.storeName || (user?.role === 'super_admin' ? 'InFast Admin' : 'InFast POS')}
            </h1>
          </div>
        )}
        {!isMobile && (
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-indigo-600 transition-all shadow-sm active:scale-90"
          >
            {collapsed ? <MenuIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
          </button>
        )}
        {isMobile && (
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {!collapsed && (
        <div className="px-10 animate-in fade-in duration-500">
          <div className="flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em]">{t('AutomationSubtitle')}</p>
          </div>
        </div>
      )}
      
      <nav className={`flex-1 px-6 space-y-2 mt-12 overflow-y-auto custom-scrollbar ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.name : ''}
            className={`flex items-center rounded-[1.5rem] transition-all duration-500 group relative ${
              collapsed ? 'justify-center p-4 w-14' : 'space-x-4 px-5 py-4 w-full'
            } ${
              location.pathname === item.path 
                ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 translate-x-1" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <item.icon className={`h-6 w-6 transition-all duration-500 ${location.pathname === item.path ? "text-white scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-slate-200 group-hover:scale-110"}`} />
            {!collapsed && <span className="font-black text-[14px] tracking-tight truncate">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className={`bg-slate-100 dark:bg-slate-800/40 rounded-[2.5rem] p-3 space-y-2 border border-slate-200/50 dark:border-white/5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          <button 
            onClick={toggleTheme}
            className={`flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-2xl transition-all group ${collapsed ? 'p-4' : 'justify-between w-full px-5 py-3.5'}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-500/10 text-amber-400'}`}>
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </div>
              {!collapsed && <span className="font-black text-[13px] tracking-tight">{theme === 'light' ? t('Dark') : t('Light')}</span>}
            </div>
          </button>

          <div className="relative" ref={isMobile ? null : langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-2xl transition-all group ${collapsed ? 'p-4' : 'justify-between w-full px-5 py-3.5'}`}
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                  <img src={currentLang.flag} alt="" className="h-4 w-6 object-cover shadow-sm" />
                </div>
                {!collapsed && <span className="font-black text-[13px] tracking-tight">{currentLang.label}</span>}
              </div>
            </button>
            {langOpen && (
              <div className={`absolute bottom-full mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl shadow-black/20 overflow-hidden z-50 ${collapsed ? 'left-full ml-4 w-48' : 'left-0 right-0'}`}>
                <div className="p-2 space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center space-x-4 w-full px-4 py-4 text-[13px] font-black transition-all rounded-2xl ${i18n.language === lang.code ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                      <img src={lang.flag} alt="" className="h-4 w-6 rounded-sm object-cover shadow-sm" />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={`flex items-center text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-600/10 rounded-2xl transition-all group ${collapsed ? 'p-4' : 'space-x-4 px-5 py-3.5 w-full'}`}
          >
            <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center group-hover:bg-rose-100 transition-all">
              <LogoutIcon className="h-5 w-5 text-slate-400 group-hover:text-rose-600" />
            </div>
            {!collapsed && <span className="font-black text-[13px] tracking-tight">{t('Logout')}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-white/5 shadow-2xl transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'w-24' : 'w-72'}`}>
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-72 h-full bg-white dark:bg-slate-900 animate-in slide-in-from-left duration-300 flex flex-col shadow-2xl">
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-slate-900 dark:text-white truncate max-w-[150px]">
              {user?.storeName || 'InFast'}
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </header>

        <main className={`flex-1 overflow-y-auto ${isPOS ? 'p-0' : 'p-4 md:p-10'} bg-slate-50 dark:bg-slate-950 transition-colors duration-500 custom-scrollbar`}>
          <div className={isPOS ? "h-full" : "max-w-7xl mx-auto"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
