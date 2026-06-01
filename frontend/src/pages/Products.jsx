import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Grid, List, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: '', sku: '' });

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: formData.name, description: formData.description,
        price: parseFloat(formData.price), quantity: parseInt(formData.quantity, 10), sku: formData.sku
      });
      toast.success("Product created successfully!");
      setFormData({ name: '', description: '', price: '', quantity: '', sku: '' });
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create product");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch(err) { toast.error("Failed to delete"); }
  };

  // 1. Working Search Filter!
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-64 shadow-sm" 
            />
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-slate-800">{product.name}</h3>
                <p className="text-xs text-slate-400">SKU: {product.sku}</p>
              </div>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</p>
                <p className={`text-xs font-medium ${product.quantity < 10 ? 'text-red-500' : 'text-emerald-500'}`}>{product.quantity} in stock</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 2. Working Add Product Form Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div onClick={() => setIsDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-6 flex-1 overflow-y-auto space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                    <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                      <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                      <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200">
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}