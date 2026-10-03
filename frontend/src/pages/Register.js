import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '', required = true) => (
    <div>
      <label className="block text-sm font-medium text-ink-200 mb-1.5">{label}{required && <span className="text-accent ml-0.5">*</span>}</label>
      <input
        type={type} name={name} value={form[name]} onChange={handleChange}
        required={required} placeholder={placeholder}
        className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-accent/50 transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-ink-800 border border-ink-700 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-found/20 flex items-center justify-center mx-auto mb-4">
              <UserPlus size={24} className="text-found" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Create account</h1>
            <p className="text-ink-400 text-sm mt-1">Join the Lost & Found community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', 'Full Name', 'text', 'Jane Doe')}
            {field('email', 'Email', 'email', 'jane@example.com')}
            {field('password', 'Password', 'password', 'Min. 6 characters')}
            {field('phone', 'Phone Number', 'tel', '+1 555 000 0000', false)}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-found hover:bg-found-dark rounded-xl text-white font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
