import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';
import { authAPI } from '../utils/api';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authAPI.login(formData.email, formData.password);
      } else {
        res = await authAPI.register(formData.email, formData.password, formData.name);
      }

      if (res.success) {
        if (!isLogin) {
          setSuccessMessage('Account created. Signing you in now.');
        }
        onLogin(res.data.user, res.data.accessToken);
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      const responseError = err.response?.data?.error || err.response?.data?.message;
      if (err.response?.status === 429) {
        setError(responseError || 'Too many attempts. Please wait before trying again.');
      } else if (err.response?.status === 401) {
        setError('Invalid credentials. Check your email and password.');
      } else if (err.response?.status === 403) {
        setError('Your session is no longer valid. Please sign in again.');
      } else {
        setError(responseError || err.message || 'Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          TrustLens
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Explainable AI Banking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-10 border"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-10 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-10 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;