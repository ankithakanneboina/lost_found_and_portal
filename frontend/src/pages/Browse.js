import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';

const CATEGORIES = ['', 'Electronics', 'Wallet/Purse', 'Keys', 'Documents', 'Jewelry', 'Clothing', 'Bags/Backpacks', 'Pets', 'Glasses', 'Phone', 'Toys', 'Books', 'Other'];

export default function Browse() {
  const [tab, setTab] = useState('lost');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const fn = tab === 'lost' ? itemsAPI.getLostItems : itemsAPI.getFoundItems;
      const { data } = await fn({ page, per_page: 12, search, category });
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
    } catch { } finally {
      setLoading(false);
    }
  }, [tab, page, search, category]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [tab, search, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Browse Items</h1>
        <p className="text-ink-400 text-sm">Search through all reported lost and found items</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Tab */}
        <div className="flex bg-ink-800 border border-ink-700 rounded-xl p-1 w-fit">
          {['lost', 'found'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? t === 'lost' ? 'bg-lost text-white' : 'bg-found text-white'
                  : 'text-ink-400 hover:text-white'
              }`}>
              {t === 'lost' ? '🔴 Lost' : '🟢 Found'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items, locations…"
            className="w-full pl-9 pr-4 py-2.5 bg-ink-800 border border-ink-700 rounded-xl text-sm text-white placeholder-ink-500 input-ring focus:border-accent/50 transition-colors" />
        </div>

        {/* Category */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="pl-8 pr-4 py-2.5 bg-ink-800 border border-ink-700 rounded-xl text-sm text-white input-ring focus:border-accent/50 transition-colors appearance-none">
            <option value="">All categories</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button onClick={fetchItems} className="p-2.5 bg-ink-800 border border-ink-700 rounded-xl hover:bg-ink-700 transition-colors">
          <RefreshCw size={15} className={`text-ink-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-ink-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-ink-700 rounded-lg w-3/4" />
                <div className="h-3 bg-ink-700 rounded-lg w-full" />
                <div className="h-3 bg-ink-700 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-ink-500">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-ink-400">No items found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={item._id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
              <ItemCard item={item} type={tab} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-300 hover:bg-ink-700 disabled:opacity-40 transition-colors">
            Previous
          </button>
          <span className="text-sm text-ink-400 px-2">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-300 hover:bg-ink-700 disabled:opacity-40 transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
