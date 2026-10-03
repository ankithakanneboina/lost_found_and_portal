import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Browse from './pages/Browse';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-ink-900 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (user?.role === 'admin') ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a30',
                color: '#e8e8f0',
                border: '1px solid #2a2a48',
                fontFamily: "'DM Sans', sans-serif",
              },
              success: { iconTheme: { primary: '#00c896', secondary: '#1a1a30' } },
              error: { iconTheme: { primary: '#ff4757', secondary: '#1a1a30' } },
            }}
          />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
