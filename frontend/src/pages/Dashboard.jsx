import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../api';

// Animation variants
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // Real Data States
  const [kpis, setKpis] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, custRes, prodRes] = await Promise.all([
          api.get('/orders').catch(() => ({ data: [] })),
          api.get('/customers').catch(() => ({ data: [] })),
          api.get('/products').catch(() => ({ data: [] }))
        ]);

        const orders = ordersRes.data;
        const customers = custRes.data;
        const products = prodRes.data;

        // 1. Calculate KPIs
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        setKpis({
          revenue: totalRevenue,
          orders: orders.length,
          products: products.length,
          customers: customers.length
        });

        // 2. Identify Low Stock (< 10 items)
        setLowStockProducts(products.filter(p => p.quantity < 10).slice(0, 5));

        // 3. Process Recent Orders (Top 5 most recent)
        const sortedOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);
        const mappedOrders = sortedOrders.map(o => {
          const cust = customers.find(c => c.id === o.customer_id);
          return {
            id: `#ORD-${o.id.toString().padStart(4, '0')}`,
            name: cust ? cust.full_name : `Customer ${o.customer_id}`,
            amount: o.total_amount,
            status: 'Completed', // Hardcoded as backend has no status field yet
            color: 'bg-emerald-100 text-emerald-700'
          };
        });
        setRecentOrders(mappedOrders);

        // 4. Calculate Revenue Chart Data (Grouped by Date)
        const revMap = {};
        orders.forEach(o => {
          const date = o.created_at 
            ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Today';
          revMap[date] = (revMap[date] || 0) + (o.total_amount || 0);
        });
        
        let revChart = Object.keys(revMap).map(date => ({ name: date, value: revMap[date] }));
        if (revChart.length === 0) revChart = [{ name: 'No Data', value: 0 }]; // Fallback for blank slates
        setRevenueData(revChart);

        // 5. Calculate Top Selling Products for Bar Chart
        const productSales = {};
        orders.forEach(o => {
          (o.items || []).forEach(item => {
            productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
          });
        });
        
        const topChart = Object.keys(productSales)
          .map(id => {
            const prod = products.find(p => p.id === parseInt(id));
            return { name: prod ? prod.name.substring(0, 15) : `ID: ${id}`, sales: productSales[id] };
          })
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 4); // Top 4 products
        
        setTopProductsData(topChart.length > 0 ? topChart : [{ name: 'No Sales', sales: 0 }]);

      } catch (err) {
        console.error("Dashboard calculation error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 font-medium text-slate-500 animate-pulse">Calculating Dashboard Analytics...</div>;

  // Placeholder for Pie Chart since backend doesn't have order statuses yet
  const orderStatusData = [
    { name: 'Completed', value: kpis.orders || 1, color: '#10b981' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Live Dashboard</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-sm shadow-indigo-200">
          Download Report
        </button>
      </div>

      {/* KPI Cards (Wired to Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Revenue" value={kpis.revenue} prefix="$" icon={DollarSign} trend="Live" color="text-indigo-600" bg="bg-indigo-50" />
        <KpiCard title="Total Orders" value={kpis.orders} icon={ShoppingCart} trend="Live" color="text-blue-600" bg="bg-blue-50" />
        <KpiCard title="Active Products" value={kpis.products} icon={Package} trend="Live" color="text-amber-600" bg="bg-amber-50" />
        <KpiCard title="Total Customers" value={kpis.customers} icon={Users} trend="Live" color="text-green-600" bg="bg-green-50" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Over Time</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Selling Products Bar Chart */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Selling Items</h2>
          <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} width={90} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Tables and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-400">No orders placed yet.</td></tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{order.id}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{order.name}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">${order.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${order.color}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="text-red-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Low Stock Alerts</h2>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {lowStockProducts.length === 0 ? (
              <div className="text-center p-4 bg-emerald-50 text-emerald-600 rounded-xl font-medium text-sm border border-emerald-100">
                Inventory is looking healthy! All products have 10+ items in stock.
              </div>
            ) : (
              lowStockProducts.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100 hover:bg-red-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                    <p className="text-xs text-red-600 font-bold mt-1 uppercase tracking-wider">{item.quantity} Remaining</p>
                  </div>
                  <button className="text-xs bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all">
                    Reorder
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// KPI Card Component (Without CountUp crash bug!)
function KpiCard({ title, value, prefix = "", icon: Icon, trend, color, bg }) {
  return (
    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600`}>
          <TrendingUp size={14} />
          {trend}
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-semibold mb-1">{title}</h3>
      <div className="text-3xl font-black text-slate-800 tracking-tight">
        {prefix}{Number(value).toLocaleString()}
      </div>
    </motion.div>
  );
}