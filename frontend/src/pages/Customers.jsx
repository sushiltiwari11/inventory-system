import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Mail, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) { toast.error("Failed to load customers"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', { full_name: formData.full_name, email: formData.email, phone: formData.phone });
      toast.success("Customer added!");
      setFormData({ full_name: '', email: '', phone: '' });
      setIsDrawerOpen(false);
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to add customer"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch(err) { toast.error("Failed to delete"); }
  };

  const filteredCustomers = customers.filter(c => c.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Customer Directory</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-64 shadow-sm" 
            />
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus size={18} /> Add Customer
          </button>
        </div>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div key={customer.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4 mb-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg bg-indigo-100 text-indigo-700">
                {getInitials(customer.full_name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">{customer.full_name}</h3>
                <p className="text-sm text-slate-500 mb-1">{customer.email}</p>
                <p className="text-xs text-slate-400">{customer.phone}</p>
              </div>
              <button onClick={() => handleDelete(customer.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div onClick={() => setIsDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Add New Customer</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-6 flex-1 overflow-y-auto space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200">
                    Save Customer
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