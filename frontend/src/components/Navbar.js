import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, X, Search, LogOut, LayoutDashboard, ShieldCheck, GitMerge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifs } from '../context/NotifContext';
import { formatDistanceToNow } from 'date-fns';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifs();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-accent ${
        isActive(to) ? 'text-accent' : 'text-ink-200'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-ink-900/90 backdrop-blur-md border-b border-ink-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Search size={16} className="text-accent" />
          </div>
          <span className="font-display font-bold text-lg text-white">
            Lost<span className="text-accent">&</span>Found
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/browse', 'Browse Items')}
          {user && navLink('/report-lost', 'Report Lost')}
          {user && navLink('/report-found', 'Report Found')}
          {user && navLink('/matches', 'Matches')}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }}
                  className="relative p-2 rounded-lg hover:bg-ink-700 transition-colors"
                >
                  <Bell size={18} className="text-ink-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full text-xs flex items-center justify-center text-white font-bold badge-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-ink-800 border border-ink-600 rounded-xl shadow-2xl overflow-hidden animate-fade-up">
                    <div className="px-4 py-3 border-b border-ink-700 flex justify-between items-center">
                      <span className="font-display font-semibold text-sm text-white">Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={() => {}} className="text-xs text-ink-400 hover:text-accent">Clear all</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-ink-400 text-sm">
                          <Bell size={24} className="mx-auto mb-2 opacity-30" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 border-b border-ink-700/50 hover:bg-ink-700/40 transition-colors cursor-pointer ${!n.read ? 'bg-accent/5' : ''}`}
                            onClick={() => navigate('/matches')}>
                            <div className="flex items-start gap-2">
                              <span className="text-lg">🎯</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium">{n.message}</p>
                                <p className="text-xs text-ink-400 mt-0.5">
                                  {n.lostItem?.name} ↔ {n.foundItem?.name}
                                </p>
                                <p className="text-xs text-ink-500 mt-1">
                                  {n.timestamp && formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-accent mt-1 flex-shrink-0" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard / Admin */}
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-700 hover:bg-ink-600 transition-colors text-sm text-white">
                {user.role === 'admin' ? <ShieldCheck size={14} /> : <LayoutDashboard size={14} />}
                <span className="font-medium">{user.name?.split(' ')[0]}</span>
              </Link>

              <button onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-lost/20 hover:text-lost transition-colors text-sm text-ink-300">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm text-ink-200 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm bg-accent hover:bg-accent-light rounded-lg text-white font-medium transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-ink-700 transition-colors">
            {menuOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink-800 border-t border-ink-700 px-4 py-4 space-y-3 animate-fade-up">
          {navLink('/browse', 'Browse Items')}
          {user && navLink('/report-lost', 'Report Lost')}
          {user && navLink('/report-found', 'Report Found')}
          {user && navLink('/matches', 'Matches')}
          {user && navLink('/dashboard', 'Dashboard')}
          {user?.role === 'admin' && navLink('/admin', 'Admin Panel')}
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-lost/80 hover:text-lost">
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border border-ink-600 rounded-lg text-sm text-ink-200">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-accent rounded-lg text-sm text-white font-medium">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
