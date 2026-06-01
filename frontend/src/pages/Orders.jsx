import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ShoppingCart, Trash2, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer & Cart State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      const [ordersRes, custRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error("Failed to load order data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Cart Logic
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedProductId) return toast.error("Please select a product");
    
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;
    
    if (quantity > product.quantity) {
        return toast.error(`Only ${product.quantity} left in stock!`);
    }

    setCart([...cart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: parseInt(quantity) 
    }]);
    
    setSelectedProductId('');
    setQuantity(1);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomerId) return toast.error("Please select a customer");
    if (cart.length === 0) return toast.error("Cart is empty!");

    try {
      await api.post('/orders', {
        customer_id: parseInt(selectedCustomerId),
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      });

      toast.success("Order placed successfully!");
      setCart([]);
      setSelectedCustomerId('');
      setIsDrawerOpen(false);
      fetchData(); // Refresh everything to update inventory numbers
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to place order.");
    }
  };

  // Helper to find customer name
  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.full_name : `Customer #${id}`;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate a user-specific Display ID
  const chronologicalOrders = [...orders].sort((a, b) => a.id - b.id);
  
  const formattedOrders = orders.map(order => {
    const userOrderNumber = chronologicalOrders.findIndex(o => o.id === order.id) + 1;
    return { ...order, display_id: userOrderNumber };
  });

  // Filter based on the newly mapped orders
  const filteredOrders = formattedOrders.filter(o => 
    o.display_id.toString().includes(searchTerm) || 
    getCustomerName(o.customer_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-64 shadow-sm" 
            />
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={18} /> Create Order
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No orders found. Create your first order!</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* FIXED: Now rendering order.display_id */}
                    <td className="px-6 py-4 font-bold text-slate-900">#{order.display_id}</td>
                    
                    <td className="px-6 py-4 text-slate-600 font-medium flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {getCustomerName(order.customer_id).charAt(0).toUpperCase()}
                      </div>
                      {getCustomerName(order.customer_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-100 text-emerald-700 border-emerald-200">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-right">
                      ${order.total_amount ? order.total_amount.toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide-in Drawer for Creating Orders */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div onClick={() => setIsDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShoppingCart size={20} className="text-indigo-600"/> Point of Sale</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Step 1: Customer */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Select Customer</label>
                  <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all">
                    <option value="">-- Choose a Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>

                {/* Step 2: Product Selection */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Add to Cart</label>
                  <form onSubmit={handleAddToCart} className="flex gap-2">
                    <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-sm">
                      <option value="">-- Product --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                    </select>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20 p-2.5 bg-white border border-slate-200 rounded-lg text-center outline-none" />
                    <button type="submit" className="bg-slate-800 text-white px-4 rounded-lg font-medium hover:bg-slate-700 transition-colors">Add</button>
                  </form>
                </div>

                {/* Cart Display */}
                {cart.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Receipt size={14}/> Current Order</label>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <ul className="divide-y divide-slate-100">
                        {cart.map((item, idx) => (
                          <li key={idx} className="p-3 flex justify-between items-center hover:bg-slate-50">
                            <div>
                              <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                              <span className="text-xs text-slate-500 block">Qty: {item.quantity} x ${item.price}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                              <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-slate-600 uppercase text-xs tracking-wider">Total</span>
                        <span className="text-xl font-black text-indigo-700">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <button 
                  onClick={handleSubmitOrder} 
                  disabled={cart.length === 0 || !selectedCustomerId}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-2"
                >
                  Confirm & Place Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}