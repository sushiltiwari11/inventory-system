import { useState, useEffect } from 'react';
import api from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  // Fetch all required data on load
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
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add an item to the current local cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert("Please select a product");
    
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;
    
    if (quantity > product.quantity) {
        return alert(`Only ${product.quantity} in stock!`);
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

  // Submit the final order to FastAPI
  const handleSubmitOrder = async () => {
    if (!selectedCustomerId) return alert("Please select a customer");
    if (cart.length === 0) return alert("Cart is empty!");

    try {
      // The exact payload expected by your backend schema
      await api.post('/orders', {
        customer_id: parseInt(selectedCustomerId),
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      });

      alert("Order placed successfully!");
      setCart([]);
      setSelectedCustomerId('');
      fetchData(); // Refresh everything to show updated stock and new order
    } catch (err) {
      console.error("Error creating order:", err);
      alert(err.response?.data?.detail || "Failed to place order.");
    }
  };

  if (loading) return <div className="p-6">Loading orders...</div>;

  // Calculate cart total for display
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* NEW ORDER FORM */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4 text-purple-600">Create New Order</h3>
          
          {/* Step 1: Select Customer */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">1. Select Customer</label>
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white">
              <option value="">-- Choose a Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} (ID: {c.id})</option>)}
            </select>
          </div>

          <hr className="my-4" />

          {/* Step 2: Add Products to Cart */}
          <label className="block text-sm font-medium text-gray-700 mb-2">2. Add Products</label>
          <form onSubmit={handleAddToCart} className="flex gap-2 mb-4">
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-grow rounded-md border border-gray-300 p-2 bg-white">
              <option value="">-- Choose Product --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price} - {p.quantity} left)</option>)}
            </select>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              className="w-20 rounded-md border border-gray-300 p-2" />
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">Add</button>
          </form>

          {/* Cart Display */}
          {cart.length > 0 && (
            <div className="bg-white p-4 rounded border border-gray-200 mb-4">
              <h4 className="font-bold text-sm text-gray-600 mb-2">Current Cart:</h4>
              <ul className="space-y-1 mb-2">
                {cart.map((item, idx) => (
                  <li key={idx} className="text-sm flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="font-bold text-right pt-2 border-t">Total: ${cartTotal.toFixed(2)}</div>
            </div>
          )}

          {/* Step 3: Submit */}
          <button onClick={handleSubmitOrder} disabled={cart.length === 0 || !selectedCustomerId}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 transition duration-200">
            Submit Final Order
          </button>
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-fit">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No orders placed yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Cust #{order.customer_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                      ${order.total_amount ? order.total_amount.toFixed(2) : "0.00"}
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