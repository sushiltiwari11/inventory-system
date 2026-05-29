import { useState, useEffect } from 'react';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Updated state to match the backend model exactly
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    sku: ''
  });

  // Fetch products when the page loads
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle typing in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit the new product to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. Send the exact payload the FastAPI schema expects
      await api.post('/products', {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        sku: formData.sku
      });
      
      // Clear the form
      setFormData({ name: '', description: '', price: '', quantity: '', sku: '' });
      
      // Refresh the table
      fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      // Give a slightly more helpful alert if it fails (like a duplicate SKU)
      alert(err.response?.data?.detail || "Failed to create product. Check console for details.");
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Products</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD PRODUCT FORM */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Add New Product</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              
              {/* Added SKU Input */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">SKU (Unique ID)</label>
                <input required type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., PRD-001"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} 
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} 
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input required type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange} 
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>
            
            <button type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
              Save Product
            </button>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No products found. Add one!</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Updated to check product.quantity instead of product.stock */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.quantity} in stock
                      </span>
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