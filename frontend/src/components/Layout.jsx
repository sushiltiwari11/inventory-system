import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Bell, Search, Menu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Layout({ setAuth }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // <-- New State for Profile Menu

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/customers', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar (Unchanged) */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '256px' : '80px' }}
        className="bg-[#1a1f36] text-slate-300 flex flex-col transition-all duration-300 z-20 hidden md:flex"
      >
        <div className="h-16 flex items-center px-6 font-bold text-white tracking-wider border-b border-white/10 whitespace-nowrap overflow-hidden">
          {isSidebarOpen ? 'INVENTORY.IO' : 'IO'}
        </div>
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.name} to={item.path} className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 hover:text-white'}`}>
                <Icon size={20} className={`min-w-[20px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {isSidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-indigo-600 transition-colors group">
              <Bell size={20} className="group-hover:animate-bounce" />
            </button>
            
            {/* Fix: Working Profile Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold cursor-pointer hover:scale-105 transition-transform"
              >
                JD
              </div>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50"
                  >
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut size={16} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}