import { useState } from 'react';

export default function Login({ setAuth }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLoginMode ? '/login' : '/register';
      
      // FastAPI requires Form Data for login, but JSON for register!
      const fetchOptions = isLoginMode 
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password }),
          }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          };

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, fetchOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || (isLoginMode ? 'Login failed' : 'Registration failed'));
      }

      // Save the VIP pass and unlock the app
      localStorage.setItem('token', data.access_token);
      setAuth(true);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {isLoginMode ? 'Sign In to Inventory' : 'Create an Account'}
        </h2>
        
        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700"
          >
            {isLoginMode ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLoginMode ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}