import { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch individually with fallback empty arrays so missing endpoints don't crash the UI!
        const productsRes = await api.get('/products').catch(() => ({ data: [] }));
        const customersRes = await api.get('/customers').catch(() => ({ data: [] }));
        const ordersRes = await api.get('/orders').catch(() => ({ data: [] }));

        setStats({
          products: productsRes.data.length || 0,
          customers: customersRes.data.length || 0,
          orders: ordersRes.data.length || 0
        });
      } catch (err) {
        console.error("API Error:", err);
        setError("Could not connect to the backend server. Is FastAPI running?");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard data...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Products</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.products}</p>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.customers}</p>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.orders}</p>
        </div>
      </div>
    </div>
  );
}