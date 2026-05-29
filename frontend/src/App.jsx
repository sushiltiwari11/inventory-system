// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <span className="font-bold text-xl tracking-wider">INV SYS</span>
                <div className="flex space-x-4">
                  <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded-md font-medium transition-colors">Dashboard</Link>
                  <Link to="/products" className="hover:bg-blue-700 px-3 py-2 rounded-md font-medium transition-colors">Products</Link>
                  <Link to="/customers" className="hover:bg-blue-700 px-3 py-2 rounded-md font-medium transition-colors">Customers</Link>
                  <Link to="/orders" className="hover:bg-blue-700 px-3 py-2 rounded-md font-medium transition-colors">Orders</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow max-w-7xl mx-auto w-full sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6 min-h-[500px]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;