import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, LayoutDashboard } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState({ lost: [], found: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('lost');

  useEffect(() => {
    itemsAPI.getMyItems()
      .then(({ data }) => setMyItems(data))
      .catch(() => toast.error('Failed to load items'))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id, type) => {
    try {
      if (type === 'lost') await itemsAPI.resolveLost(id);
      else await itemsAPI.resolveFound(id);
      toast.success('Marked as resolved!');
      // Refresh
      const { data } = await itemsAPI.getMyItems();
      setMyItems(data);
    } catch { toast.error('Failed to resolve'); }
  };

  const currentItems = myItems[tab] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">My Dashboard</h1>
            <p className="text-sm text-ink-400">Welcome, {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/report-lost" className="flex items-center gap-1.5 px-4 py-2 bg-lost/20 text-lost rounded-xl text-sm font-medium hover:bg-lost/30 transition-colors">
            <Plus size={14} /> Report Lost
          </Link>
          <Link to="/report-found" className="flex items-center gap-1.5 px-4 py-2 bg-found/20 text-found rounded-xl text-sm font-medium hover:bg-found/30 transition-colors">
            <Plus size={14} /> Report Found
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 text-center">
          <div className="font-display font-bold text-3xl text-lost">{myItems.lost?.length || 0}</div>
          <div className="text-xs text-ink-400 mt-1">Lost Reports</div>
        </div>
        <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 text-center">
          <div className="font-display font-bold text-3xl text-found">{myItems.found?.length || 0}</div>
          <div className="text-xs text-ink-400 mt-1">Found Reports</div>
        </div>
        <Link to="/matches" className="bg-ink-800 border border-accent/30 rounded-2xl p-5 text-center hover:bg-ink-700 transition-colors">
          <div className="font-display font-bold text-3xl text-accent">→</div>
          <div className="text-xs text-ink-400 mt-1">View Matches</div>
        </Link>
      </div>

      {/* Tab */}
      <div className="flex bg-ink-800 border border-ink-700 rounded-xl p-1 w-fit mb-6">
        {['lost', 'found'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? t === 'lost' ? 'bg-lost text-white' : 'bg-found text-white'
                : 'text-ink-400 hover:text-white'
            }`}>
            {t === 'lost' ? `🔴 Lost (${myItems.lost?.length || 0})` : `🟢 Found (${myItems.found?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-ink-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-ink-700 rounded-lg w-3/4" />
                <div className="h-3 bg-ink-700 rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-16 bg-ink-800 border border-ink-700 rounded-2xl">
          <div className="text-4xl mb-3">{tab === 'lost' ? '🔴' : '🟢'}</div>
          <p className="font-display font-semibold text-ink-300">No {tab} items reported yet</p>
          <Link to={tab === 'lost' ? '/report-lost' : '/report-found'}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-ink-700 hover:bg-ink-600 rounded-xl text-sm text-white transition-colors">
            <Plus size={14} /> Report one now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentItems.map((item, i) => (
            <div key={item._id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
              <ItemCard item={item} type={tab} onResolve={(id) => handleResolve(id, tab)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
