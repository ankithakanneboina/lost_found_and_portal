import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-ink-800 border border-ink-700 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <LogIn size={24} className="text-accent" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
            <p className="text-ink-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-200 mb-1.5">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-200 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-ink-500 input-ring focus:border-accent/50 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-light rounded-xl text-white font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
