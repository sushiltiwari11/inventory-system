import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Import Layout and Pages
import Layout from './components/Layout'; // Make sure you saved the Layout code in this folder!
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

// We separate the Routes into their own component so `useLocation` can hook into the Router
function AnimatedRoutes({ isAuthenticated, setAuth }) {
  const location = useLocation();

  return (
    // AnimatePresence listens for route changes and triggers the exit/enter animations
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* PUBLIC ROUTE: Login */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login setAuth={setAuth} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* PROTECTED ROUTES: Wrapped in the Layout (Sidebar/Header) */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Layout setAuth={setAuth} /> 
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* These pages render inside the <Outlet /> of Layout.jsx */}
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
        </Route>

        {/* Catch-all: If they type a random URL, send them to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for the token the second the app opens
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  // Prevent a white flash while checking local storage
  if (isCheckingAuth) return null; 

  return (
    <Router>
      <AnimatedRoutes isAuthenticated={isAuthenticated} setAuth={setIsAuthenticated} />
      
      {/* Global Toast Notifications (Success/Error popups) */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
        }} 
      />
    </Router>
  );
}