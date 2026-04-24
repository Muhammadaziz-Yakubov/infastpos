import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  SearchIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  PrinterIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XIcon,
  ArrowsExpandIcon,
  LogoutIcon,
  UserIcon
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import useCartStore from '../../store/cartStore';

import { format } from 'date-fns';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { db, savePendingSale } from '../../db/db';

const POS = () => {
  const { t } = useTranslation();
  const { theme } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [lastSale, setLastSale] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const { isOnline, syncing, syncData } = useOfflineSync();
  
  // Debt related states
  const [isDebt, setIsDebt] = useState(false);
  const [isDebtorModalOpen, setIsDebtorModalOpen] = useState(false);
  const [debtorInfo, setDebtorInfo] = useState({ name: '', phone: '' });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(0);

  const searchInputRef = useRef(null);
  const categoryRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - categoryRef.current.offsetLeft);
    setScrollLeft(categoryRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - categoryRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    categoryRef.current.scrollLeft = scrollLeft - walk;
  };

  const {
    cart, addItem, updateQuantity, removeItem,
    clearCart, getTotals, paymentMethod, setPaymentMethod,
  } = useCartStore();

  const { totalAmount } = getTotals();

  useEffect(() => {
    fetchData();
    searchInputRef.current?.focus();
    const handleKeyDown = (e) => {
      // Barcode Scanner Logic (usually fast typing + Enter)
      const currentTime = Date.now();
      
      // If time between keys is small (< 50ms), it's likely a scanner
      const isFastTyping = currentTime - lastKeyTime.current < 50;
      
      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length > 3) { // Minimum barcode length
          const code = barcodeBuffer.current;
          const exactMatch = products.find((p) => p.barcode === code);
          if (exactMatch) {
            handleAddToCart(exactMatch);
            toast.success(`${exactMatch.name} ${t('AddedToCart') || 'savatga qo\'shildi'}`);
            barcodeBuffer.current = '';
            setSearchQuery(''); // Clear search if any
            return;
          }
        }
        barcodeBuffer.current = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
        // Only collect if not in an input field (unless it's the search input)
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        const isSearchInput = e.target === searchInputRef.current;
        
        if (!isInput || isSearchInput) {
          if (!isFastTyping) barcodeBuffer.current = ''; // Reset if slow
          barcodeBuffer.current += e.key;
        }
      }
      
      lastKeyTime.current = currentTime;

      // Regular Hotkeys
      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); handleSale(); }
      if (e.key === 'Escape') { clearCart(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, paymentMethod, printReceipt, isDebt]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } else {
        const localProducts = await db.products.toArray();
        const localCategories = await db.categories.toArray();
        setProducts(localProducts);
        setCategories(localCategories);
      }
    } catch {
      toast.error(t('LoadingError') || "Ma'lumotlarni yuklashda xatolik");
      // Fallback to local even if online request failed
      const localProducts = await db.products.toArray();
      const localCategories = await db.categories.toArray();
      setProducts(localProducts);
      setCategories(localCategories);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleAddToCart = (product) => {
    const cartItem = cart.find((item) => item.productId === product._id);
    const currentQtyInCart = cartItem ? cartItem.quantity : 0;
    if (product.quantity <= currentQtyInCart) {
      return toast.error(t('LowStockAlert', { count: product.quantity }) || `Omborda faqat ${product.quantity} dona qolgan!`);
    }
    addItem(product);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery);
    const matchesCategory =
      selectedCategory === 'all' || p.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSale = async () => {
    if (cart.length === 0) return toast.error(t('CartEmpty') || "Savatcha bo'sh");
    if (isDebt) {
      setIsDebtorModalOpen(true);
      return;
    }
    executeSale();
  };

  const executeSale = async (debtData = null) => {
    setLoading(true);
    const saleData = { 
      items: cart, 
      totalAmount, 
      discount: 0, 
      finalAmount: totalAmount, 
      paymentMethod: isDebt ? 'debt' : paymentMethod,
      isDebt: isDebt,
      debtorInfo: debtData,
      createdAt: new Date()
    };

    try {
      if (isOnline) {
        const { data } = await api.post('/sales', saleData);
        if (printReceipt) { setLastSale(data); setIsReceiptModalOpen(true); }
        else toast.success(t('SaleSuccess') || 'Sotuv yakunlandi');
      } else {
        // Offline Save
        const offlineSaleId = await savePendingSale(saleData);
        const offlineSale = { ...saleData, _id: offlineSaleId, receiptNumber: `OFF-${offlineSaleId}` };
        if (printReceipt) { setLastSale(offlineSale); setIsReceiptModalOpen(true); }
        else toast.success(t('OfflineSaved'));
      }
      
      clearCart();
      fetchData();
      setIsDebtorModalOpen(false);
      setIsDebt(false);
      setDebtorInfo({ name: '', phone: '' });
    } catch (error) {
      if (!isOnline) {
        // Backup save if online call failed but we didn't know we were offline
        const offlineSaleId = await savePendingSale(saleData);
        const offlineSale = { ...saleData, _id: offlineSaleId, receiptNumber: `OFF-${offlineSaleId}` };
        if (printReceipt) { setLastSale(offlineSale); setIsReceiptModalOpen(true); }
        toast.success('Xatolik tufayli offline saqlandi');
        clearCart();
        fetchData();
      } else {
        toast.error(error.response?.data?.message || t('SaleError') || 'Xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDebtSale = (e) => {
    e.preventDefault();
    if (!debtorInfo.name || !debtorInfo.phone) {
      return toast.error("Ism va telefon raqamini kiriting");
    }
    executeSale(debtorInfo);
  };

  const handleBarcodeSearch = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      const exactMatch = products.find((p) => p.barcode === searchQuery);
      if (exactMatch) { handleAddToCart(exactMatch); setSearchQuery(''); }
    }
  };

  const paymentLabels = {
    cash: t('Cash'),
    card: t('Card'),
    mixed: t('Mixed'),
    debt: t('Debt')
  };

  // QR Code generator helper
  const getQrCodeUrl = (sale) => {
    if (!sale) return '';
    const url = `${window.location.origin}/receipt/${sale._id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-premium">

      {/* ── TOP BAR ── */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="hidden sm:flex flex-col">
            <p className="page-header-desc">{t('Cashier')}</p>
            <p className="text-sm md:text-lg font-black text-slate-800 dark:text-white leading-none">{user?.name || t('Cashier')}</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
            <span className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {isOnline ? t('Online') : t('Offline')}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="lg:hidden btn-primary px-4 py-2 text-[10px] md:text-[11px]"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            <span>{t('Order')} ({cart.length})</span>
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-2.5 md:p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all"
          >
            <ArrowsExpandIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden px-4 md:px-6 pb-4 md:pb-6 gap-6 relative">
        {/* ── LEFT: Products ── */}
        <div className="flex-1 flex flex-col overflow-hidden gap-6 min-w-0">

          {/* Search bar */}
          <div className="relative flex-shrink-0">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('SearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeSearch}
              className="input-field pl-14 py-5 shadow-sm"
            />
          </div>

          {/* Category tabs */}
          <div 
            ref={categoryRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-2 flex-shrink-0 overflow-x-auto no-scrollbar pb-1 ${isDown ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          >
            {[{ _id: 'all', name: t('All') }, ...categories].map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all flex-shrink-0 border ${selectedCategory === cat._id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-1 pr-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300 dark:text-slate-800">
                <ShoppingBagIcon className="h-20 w-20 mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">{t('NoProducts')}</p>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
                {filteredProducts.map((product) => {
                  const inStock = product.quantity > 0;
                  const cartItem = cart.find((i) => i.productId === product._id);
                  const qtyInCart = cartItem ? cartItem.quantity : 0;

                  return (
                    <div
                      key={product._id}
                      onClick={() => inStock && handleAddToCart(product)}
                      className={`premium-card group flex flex-col overflow-hidden
                      ${inStock ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.98]' : 'opacity-50 grayscale cursor-not-allowed'}
                      ${qtyInCart > 0 ? 'border-indigo-500 dark:border-indigo-500 ring-4 ring-indigo-500/10' : ''}
                    `}
                    >
                      {/* Image */}
                      <div className="relative flex-shrink-0 bg-slate-50 dark:bg-white/5 h-[170px]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-800">
                            <ShoppingBagIcon className="h-16 w-16" />
                          </div>
                        )}

                        {qtyInCart > 0 && (
                          <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[12px] font-black h-8 w-8 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-slate-900">
                            {qtyInCart}
                          </div>
                        )}
                        {!inStock && (
                          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 uppercase tracking-widest">
                              {t('OutOfStock')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col gap-3">
                        <p className="text-[14px] font-black text-slate-800 dark:text-slate-100 leading-snug h-[2.8rem] overflow-hidden line-clamp-2">
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-black text-indigo-600">
                            {product.sellPrice.toLocaleString()}
                            <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">{t('Sum')}</span>
                          </span>
                          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-xl">
                            {product.quantity} {product.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className={`
          flex flex-col flex-shrink-0 shadow-2xl overflow-hidden
          fixed inset-0 z-[100] bg-white dark:bg-slate-950 lg:bg-transparent lg:dark:bg-transparent lg:static lg:w-[380px] xl:w-[420px] lg:shadow-none lg:z-0 lg:flex
          transition-transform duration-500 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="premium-card h-full flex flex-col shadow-2xl lg:shadow-none border-none lg:border">
            {/* Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between flex-shrink-0 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                   <XIcon className="h-6 w-6 text-slate-500" />
                </button>
                <div>
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('Order')}</h2>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                  {cart.length === 0 ? t('CartEmpty') : `${cart.length} ${t('Items')}`}
                </p>
                </div>
              </div>
              <button
                onClick={clearCart}
                className="p-2.5 md:p-3 text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-200 dark:text-slate-800 pb-12">
                <div className="h-24 w-24 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <ShoppingBagIcon className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">{t('AddProducts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-5 p-4 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 group transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:shadow-indigo-600/5">
                    {/* Thumb */}
                    <div className="flex-shrink-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm w-16 h-16">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-800"><ShoppingBagIcon className="h-8 w-8" /></div>
                      }
                    </div>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-black text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                      <p className="text-[12px] font-bold text-indigo-600 mt-1">{item.sellPrice.toLocaleString()} {t('Sum')}</p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-2 py-1.5 flex-shrink-0 shadow-sm">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-[13px] font-black text-slate-900 dark:text-white w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const p = products.find((prod) => prod._id === item.productId);
                            if (p && p.quantity > item.quantity) updateQuantity(item.productId, 1);
                            else toast.error(t('NoMoreStock'));
                          }}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-green-500 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-[10px] font-black text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors uppercase tracking-widest">
                        {t('Remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="px-8 py-8 border-t border-slate-100 dark:border-white/5 space-y-6 flex-shrink-0 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('TotalAmount')}</span>
              <div className="text-right">
                <span className="text-4xl font-black text-indigo-600 tabular-nums">{totalAmount.toLocaleString()}</span>
                <span className="text-[11px] font-black text-slate-400 ml-1 uppercase">{t('Sum')}</span>
              </div>
            </div>

            {/* Print toggle */}
            <div className="flex items-center justify-between py-4 px-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3">
                <PrinterIcon className="h-5 w-5 text-indigo-500" />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest">{t('PrintReceipt')}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={printReceipt} onChange={() => setPrintReceipt(!printReceipt)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
              </label>
            </div>

            {/* Payment */}
            <div className="grid grid-cols-3 gap-3">
              {['cash', 'card', 'mixed'].map((method) => (
                <button
                  key={method}
                  disabled={isDebt}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border shadow-sm ${paymentMethod === method && !isDebt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/30'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30'
                    }`}
                >
                  {paymentLabels[method]}
                </button>
              ))}
            </div>

            {/* Debt Toggle */}
            <div className="flex items-center justify-between py-4 px-5 bg-rose-50 dark:bg-rose-500/5 rounded-[1.5rem] border border-rose-100 dark:border-rose-500/10 shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-rose-500" />
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest">{t('DebtSale')}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isDebt} onChange={() => setIsDebt(!isDebt)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
              </label>
            </div>

            {/* Sale button */}
            <button
              disabled={loading || cart.length === 0}
              onClick={handleSale}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-[0.2em]"
            >
              <CheckCircleIcon className="h-7 w-7" />
              <span>{loading ? t('Loading') : t('ConfirmSale')}</span>
            </button>

            <p className="text-center text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.25em]">ESC — {t('ClearCart')}</p>
          </div>
        </div>
      </div>

        {/* ── Receipt Modal ── */}
        {isReceiptModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
              <div id="receipt-content" className="p-12 font-mono text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                <div className="text-center mb-8">
                  <p className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white uppercase">{(user?.storeName || user?.storeId?.name || 'InFast POS')}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 mt-2 uppercase tracking-[0.25em]">{t('OfficialReceipt')}</p>
                  <div className="border-t-2 border-dashed border-slate-100 dark:border-white/5 mt-8" />
                </div>
                <div className="space-y-3 mb-8 uppercase font-bold">
                  <div className="flex justify-between items-center"><span className="text-slate-400 dark:text-slate-600">{t('ReceiptNumber')}</span><span className="text-slate-900 dark:text-white">#{lastSale?.receiptNumber}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 dark:text-slate-600">{t('Date')}</span><span className="text-slate-900 dark:text-white">{lastSale?.createdAt && format(new Date(lastSale.createdAt), 'dd.MM.yyyy HH:mm')}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 dark:text-slate-600">{t('Payment')}</span><span className="text-slate-900 dark:text-white">{paymentLabels[lastSale?.paymentMethod]}</span></div>
                </div>
                <div className="border-t-2 border-dashed border-slate-100 dark:border-white/5 mb-8" />
                <div className="space-y-5 mb-8">
                  {lastSale?.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{item.quantity} x {item.sellPrice.toLocaleString()}</p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-dashed border-slate-100 dark:border-white/5 mb-6" />
                <div className="flex justify-between items-center font-black text-slate-900 dark:text-white text-base">
                  <span className="uppercase tracking-tighter">{t('Total')}</span>
                  <span className="text-2xl">{lastSale?.finalAmount.toLocaleString()} {t('Sum')}</span>
                </div>

                {/* QR Code Section */}
                <div className="mt-12 flex flex-col items-center justify-center space-y-5 p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem]">
                  <img
                    src={getQrCodeUrl(lastSale)}
                    alt="QR Code"
                    className="h-36 w-36 object-contain mix-blend-multiply dark:invert"
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('ThankYou')}</p>
                </div>
              </div>
              <div className="px-10 pb-10 flex gap-4">
                <button onClick={() => setIsReceiptModalOpen(false)} className="flex-1 py-4 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all">{t('Close')}</button>
                <button onClick={() => window.print()} className="btn-primary flex-1 py-4 text-[11px]"><PrinterIcon className="h-5 w-5" />{t('Print')}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Debtor Info Modal ── */}
        {isDebtorModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
              <div className="p-12">
                <div className="flex items-center gap-5 mb-10">
                  <div className="h-14 w-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-rose-500/30">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('CustomerDetails')}</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('ProcessDebt')}</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmDebtSale} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{t('EnterCustomerName')}</label>
                    <input
                      required
                      autoFocus
                      value={debtorInfo.name}
                      onChange={(e) => setDebtorInfo({ ...debtorInfo, name: e.target.value })}
                      className="input-field"
                      placeholder={t('ExampleName')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{t('EnterCustomerPhone')}</label>
                    <input
                      required
                      type="tel"
                      value={debtorInfo.phone}
                      onChange={(e) => setDebtorInfo({ ...debtorInfo, phone: e.target.value })}
                      className="input-field"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setIsDebtorModalOpen(false)} className="flex-1 py-4 bg-slate-50 dark:bg-white/5 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">{t('Cancel')}</button>
                    <button type="submit" className="btn-primary flex-[1.5] py-4 bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 border-none">{t('FinishSale')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: fixed; left: 0; top: 0; width: 80mm; padding: 0; margin: 0; background: white !important; color: black !important; }
          #receipt-content img { filter: none !important; mix-blend-mode: normal !important; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default POS;
