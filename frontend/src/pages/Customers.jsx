import { useState, useEffect } from 'react';
import api from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Updated state to match the backend 'full_name' requirement
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. Send the exact payload FastAPI expects
      await api.post('/customers', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone
      });
      
      // Clear the form and refresh the list
      setFormData({ full_name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      console.error("Error creating customer:", err);
      alert(err.response?.data?.detail || "Failed to add customer. Are you sure this email is unique?");
    }
  };

  if (loading) return <div className="p-6">Loading customers...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Customers</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD CUSTOMER FORM */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Add New Customer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              {/* 3. Updated the input name attribute to 'full_name' */}
              <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
            </div>
            
            <button type="submit" 
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-200">
              Save Customer
            </button>
          </form>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No customers found. Add your first client!</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* 4. Display the correct field in the table */}
                      <div className="font-medium text-gray-900">{customer.full_name}</div>
                      <div className="text-sm text-gray-500">ID: #{customer.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone || 'No phone provided'}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}