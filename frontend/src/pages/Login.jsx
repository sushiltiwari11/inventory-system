import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Box, Lock, Mail } from 'lucide-react';
import api from '../api'; // Make sure this points to your Axios api.js file

export default function Login({ setAuth }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      
      if (isLoginMode) {
        // FastAPI Login requires Form Data
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        response = await api.post('/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      } else {
        // FastAPI Register requires JSON
        response = await api.post('/register', { 
          username: username, 
          password: password 
        });
      }

      // Save token and trigger exit animation
      localStorage.setItem('token', response.data.access_token);
      setIsExiting(true);
      
      // Wait for exit animation to finish before updating App state
      setTimeout(() => setAuth(true), 600); 

    } catch (err) {
      setError(err.response?.data?.detail || (isLoginMode ? 'Login failed' : 'Registration failed'));
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="flex h-screen w-full bg-slate-50"
        >
          {/* Left Panel: Decorative Gradient/Illustration */}
          <div className="hidden lg:flex w-1/2 bg-[#1a1f36] relative overflow-hidden items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0" />
            <motion.div 
              animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="z-10 text-center"
            >
              <Box size={120} className="text-indigo-400 mx-auto mb-8 opacity-80" />
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Inventory.io</h1>
              <p className="text-indigo-200 text-lg max-w-md mx-auto">
                Modern warehouse and order management built for scale.
              </p>
            </motion.div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          </div>

          {/* Right Panel: Glassy Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
            <div className="absolute top-10 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10"
            >
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {isLoginMode ? 'Welcome back' : 'Create an Account'}
                </h2>
                <p className="text-slate-500">
                  {isLoginMode ? 'Please enter your details to sign in.' : 'Fill in your details to get started.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="email" 
                    required 
                    placeholder="Email address (Username)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="password" 
                    required 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {isLoginMode && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                      Remember me
                    </label>
                    <a href="#" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">Forgot password?</a>
                  </div>
                )}

                <button 
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 flex justify-center items-center h-12"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLoginMode ? 'Sign In' : 'Register')}
                </button>
              </form>

              {/* The missing toggle! */}
              <div className="mt-6 text-center text-sm">
                <span className="text-slate-500">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError('');
                  }}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                >
                  {isLoginMode ? 'Sign up' : 'Sign in'}
                </button>
              </div>

            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}