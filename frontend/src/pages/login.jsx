import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('api/auth/login', {
        email,
        password,
      });

      const token = response?.data?.token;
      const userRole = response?.data?.user?.role ?? response?.data?.role;

      if (token && userRole) {
        const normalizedRole = String(userRole).trim().toUpperCase();
        localStorage.setItem('ems_token', token);
        localStorage.setItem('ems_user_role', normalizedRole);

        navigate('/dashboard', { replace: true });
        return;
      }

      setError(response?.data?.message || 'Login did not return the expected user data.');
    } catch (err) {
      console.error('Login component execution failed:', err);
      setError(err?.response?.data?.message || 'Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-2">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">EMS Portal Login</h2>
          <p className="text-sm text-gray-500 mt-1">Employee Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
              <input type="checkbox" className="rounded text-indigo-600 mr-2 focus:ring-indigo-500" />
              Remember Me
            </label>
            <a href="#forgot" className="text-indigo-600 hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-100 disabled:bg-indigo-400"
          >
            {loading ? 'Connecting...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;