import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import all your page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if they already have a token when they open the app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // If they aren't logged in, ONLY show the Login page
  if (!isAuthenticated) {
    return <Login setAuth={setIsAuthenticated} />;
  }

  // If they ARE logged in, show the main application with navigation
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between bg-gray-800 p-4 shadow-md text-white">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-blue-400">Inventory System</h1>
            
            {/* Page Links */}
            <div className="hidden md:flex space-x-4 font-medium">
              <Link to="/" className="hover:text-blue-300 transition">Dashboard</Link>
              <Link to="/products" className="hover:text-blue-300 transition">Products</Link>
              <Link to="/orders" className="hover:text-blue-300 transition">Orders</Link>
              <Link to="/customers" className="hover:text-blue-300 transition">Customers</Link>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="rounded-md bg-red-500 px-4 py-2 font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
        </nav>
        
        {/* Main Content Area */}
        <main className="p-6 mx-auto max-w-7xl">
           <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
           </Routes>
        </main>

      </div>
    </Router>
  );
}