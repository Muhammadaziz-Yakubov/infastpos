import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  SearchIcon,
  FilterIcon,
  ExclamationCircleIcon,
  TagIcon,
  XIcon,
  CubeIcon
} from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const Products = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    buyPrice: '',
    sellPrice: '',
    quantity: 0,
    unit: 'dona',
    lowStockAlert: 5,
    image: ''
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error(t('LoadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await api.post('/categories', { name: newCategoryName });
      toast.success(t('CategorySuccess'));
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error(t('SaleError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('DeleteConfirm'))) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(t('DeleteSuccess'));
      fetchData();
    } catch (error) {
      toast.error(t('SaleError'));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(t('DeleteConfirm'))) return;
    try {
      await api.delete('/products', { data: { ids: selectedIds } });
      toast.success(t('DeleteSuccess'));
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      toast.error(t('SaleError'));
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        category: product.category?._id || '',
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        quantity: product.quantity,
        unit: product.unit,
        lowStockAlert: product.lowStockAlert,
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        category: '',
        buyPrice: '',
        sellPrice: '',
        quantity: 0,
        unit: 'dona',
        lowStockAlert: 5,
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error(t('SelectCategoryError'));
    
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        toast.success(t('UpdateSuccess'));
      } else {
        await api.post('/products', formData);
        toast.success(t('CreateSuccess'));
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('SaleError'));
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode?.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || p.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-premium">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="page-header-title">{t('Products')}</h1>
          <p className="page-header-desc">{t('ProductListDesc')}</p>
        </div>
        <div className="flex gap-4">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <TrashIcon className="h-5 w-5" />
              <span>{t('Delete')} ({selectedIds.length})</span>
            </button>
          )}
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn-secondary"
          >
            <TagIcon className="h-5 w-5 text-indigo-500" />
            <span>{t('AddCategory')}</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5" />
            <span>{t('AddProduct')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <SearchIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t('SearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-14"
          />
        </div>
        <div className="flex items-center space-x-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl min-w-[260px] border border-transparent focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          <FilterIcon className="h-5 w-5 text-slate-400" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm font-black text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
          >
            <option value="all">{t('AllCategories')}</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id} className="bg-white dark:bg-slate-900">{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Product')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Category')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('SellPrice')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Amount')}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">{t('Actions')}</th>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
                    {t('NoProducts')}
                  </td>
                </tr>
              ) : filteredProducts.map((p) => (
                <tr key={p._id} className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group ${selectedIds.includes(p._id) ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                  <td className="px-10 py-6">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}
                      className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-5">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
                        {p.image ? <img src={p.image} className="h-full w-full object-cover" alt="" /> : <CubeIcon className="h-8 w-8 m-4 text-slate-200 dark:text-slate-700" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white tracking-tight text-base">{p.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono mt-1 uppercase tracking-wider">{p.barcode || t('NoBarcode')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/5">
                      {p.category?.name || t('Uncategorized')}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 dark:text-white text-lg">{p.sellPrice.toLocaleString()} <span className="text-[11px] font-bold text-slate-400 uppercase ml-1">{t('Sum')}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter opacity-60">{t('BuyPrice')}: {p.buyPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-3">
                      <span className={`px-5 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${p.quantity <= p.lowStockAlert ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 shadow-sm shadow-rose-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                        {p.quantity} {p.unit}
                      </span>
                      {p.quantity <= p.lowStockAlert && (
                        <ExclamationCircleIcon className="h-6 w-6 text-rose-500 animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right space-x-3">
                    <button onClick={() => handleOpenModal(p)} className="p-3.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all shadow-sm hover:shadow-indigo-600/5">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-3.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all shadow-sm hover:shadow-rose-600/5">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/10 zoom-in-95 animate-in duration-300">
            <div className="px-12 py-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingProduct ? t('EditProduct') : t('AddProduct')}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{t('ProductDetails')}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm hover:rotate-90">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('Product')}</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Coca Cola 0.5L"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('Barcode')}</label>
                <input 
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  className="input-field"
                  placeholder="8690..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('Category')}</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field appearance-none cursor-pointer"
                  >
                    <option value="">{t('AllCategories')}</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-white dark:bg-slate-900">{c.name}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FilterIcon className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('BuyPrice')}</label>
                <input 
                  type="number"
                  required
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
                  className="input-field"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('SellPrice')}</label>
                <input 
                  type="number"
                  required
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({...formData, sellPrice: e.target.value})}
                  className="input-field"
                  placeholder="7000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('InitialQty')}</label>
                <input 
                  type="number"
                  value={formData.quantity}
                  disabled={editingProduct}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="input-field disabled:opacity-50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('Unit')}</label>
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="dona" className="bg-white dark:bg-slate-900">dona</option>
                  <option value="kg" className="bg-white dark:bg-slate-900">kg</option>
                  <option value="litr" className="bg-white dark:bg-slate-900">litr</option>
                  <option value="metr" className="bg-white dark:bg-slate-900">metr</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('ImageURL')}</label>
                <input 
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="col-span-2 pt-8 flex justify-end gap-5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-4.5 text-slate-400 dark:text-slate-500 font-black uppercase text-[11px] tracking-[0.2em] hover:text-slate-700 dark:hover:text-white transition-all"
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-16 py-4.5"
                >
                  {t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 zoom-in-95 animate-in duration-300">
            <div className="px-12 py-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('AddCategory')}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all shadow-sm"><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddCategory} className="p-12 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t('CategoryName')}</label>
                <input 
                  required
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input-field"
                  placeholder="Drinks"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="btn-primary w-full py-5"
                >
                  {t('Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
