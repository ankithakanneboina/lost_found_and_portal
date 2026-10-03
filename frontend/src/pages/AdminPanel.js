import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, Trash2, Users, RefreshCw, BarChart3 } from 'lucide-react';
import { adminAPI } from '../services/api';
import { itemsAPI } from '../services/api';
import { format } from 'date-fns';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 text-center">
      <div className={`font-display font-bold text-3xl ${color}`}>{value ?? '—'}</div>
      <div className="text-xs text-ink-400 mt-1">{label}</div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const loadLost = async () => {
    setLoading(true);
    try { const { data } = await adminAPI.getLostItems(); setLostItems(data); }
    catch { } finally { setLoading(false); }
  };

  const loadFound = async () => {
    setLoading(true);
    try { const { data } = await adminAPI.getFoundItems(); setFoundItems(data); }
    catch { } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try { const { data } = await adminAPI.getUsers(); setUsers(data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'lost') loadLost();
    else if (tab === 'found') loadFound();
    else if (tab === 'users') loadUsers();
  }, [tab]);

  const deleteLost = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await adminAPI.deleteLostItem(id);
      toast.success('Deleted');
      setLostItems(prev => prev.filter(i => i._id !== id));
    } catch { toast.error('Failed'); }
  };

  const deleteFound = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await adminAPI.deleteFoundItem(id);
      toast.success('Deleted');
      setFoundItems(prev => prev.filter(i => i._id !== id));
    } catch { toast.error('Failed'); }
  };

  const formatDate = (d) => {
    try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d || '—'; }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'lost', label: 'Lost Items', icon: ShieldCheck },
    { id: 'found', label: 'Found Items', icon: ShieldCheck },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
          <ShieldCheck size={18} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Admin Panel</h1>
          <p className="text-sm text-ink-400">Manage all reports and users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === id ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : 'bg-ink-800 border border-ink-700 text-ink-400 hover:text-white'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
        <button onClick={() => {
          if (tab === 'dashboard') loadDashboard();
          else if (tab === 'lost') loadLost();
          else if (tab === 'found') loadFound();
          else if (tab === 'users') loadUsers();
        }} className="ml-auto p-2 bg-ink-800 border border-ink-700 rounded-xl hover:bg-ink-700 transition-colors">
          <RefreshCw size={14} className={`text-ink-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && stats && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Users" value={stats.users} color="text-white" />
            <StatCard label="Lost Items" value={stats.lostItems} color="text-lost" />
            <StatCard label="Found Items" value={stats.foundItems} color="text-found" />
            <StatCard label="Total Matches" value={stats.matches} color="text-accent" />
            <StatCard label="Resolved" value={stats.resolvedMatches} color="text-yellow-400" />
            <StatCard label="ML Engine" value="ON" color="text-green-400" />
          </div>

          <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-white mb-4">Recent Lost Items</h3>
            <div className="space-y-2">
              {(stats.recentActivity || []).map(item => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-ink-700/50 last:border-0">
                  <div>
                    <span className="text-sm text-white">{item.itemName}</span>
                    <span className="text-xs text-ink-500 ml-2">{item.category}</span>
                  </div>
                  <span className="text-xs text-ink-500">{formatDate(item.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lost Items Table */}
      {tab === 'lost' && (
        <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden animate-fade-up">
          <div className="px-5 py-3 border-b border-ink-700 flex items-center justify-between">
            <span className="font-display font-semibold text-white text-sm">Lost Items ({lostItems.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-xs text-ink-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Image</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {lostItems.map(item => (
                  <tr key={item._id} className="border-b border-ink-700/50 hover:bg-ink-700/30 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{item.itemName}</td>
                    <td className="px-4 py-3 text-ink-300">{item.category}</td>
                    <td className="px-4 py-3 text-ink-400 max-w-[120px] truncate">{item.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active' ? 'bg-found/20 text-found' : 'bg-ink-700 text-ink-400'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-400 text-xs">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      {item.image ? (
                        <img src={itemsAPI.getImageUrl(item.image)} alt="" className="w-8 h-8 rounded-lg object-cover mx-auto" />
                      ) : <span className="text-ink-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => deleteLost(item._id)}
                        className="p-1.5 text-ink-500 hover:text-lost hover:bg-lost/15 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lostItems.length === 0 && !loading && (
              <div className="text-center py-10 text-ink-500 text-sm">No lost items found</div>
            )}
          </div>
        </div>
      )}

      {/* Found Items Table */}
      {tab === 'found' && (
        <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden animate-fade-up">
          <div className="px-5 py-3 border-b border-ink-700">
            <span className="font-display font-semibold text-white text-sm">Found Items ({foundItems.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-xs text-ink-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Image</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {foundItems.map(item => (
                  <tr key={item._id} className="border-b border-ink-700/50 hover:bg-ink-700/30 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{item.itemName}</td>
                    <td className="px-4 py-3 text-ink-300">{item.category}</td>
                    <td className="px-4 py-3 text-ink-400 max-w-[120px] truncate">{item.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active' ? 'bg-found/20 text-found' : 'bg-ink-700 text-ink-400'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-400 text-xs">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      {item.image ? (
                        <img src={itemsAPI.getImageUrl(item.image)} alt="" className="w-8 h-8 rounded-lg object-cover mx-auto" />
                      ) : <span className="text-ink-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => deleteFound(item._id)}
                        className="p-1.5 text-ink-500 hover:text-lost hover:bg-lost/15 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {foundItems.length === 0 && !loading && (
              <div className="text-center py-10 text-ink-500 text-sm">No found items</div>
            )}
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden animate-fade-up">
          <div className="px-5 py-3 border-b border-ink-700">
            <span className="font-display font-semibold text-white text-sm">Users ({users.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-xs text-ink-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-ink-700/50 hover:bg-ink-700/30 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-ink-300">{u.email}</td>
                    <td className="px-4 py-3 text-ink-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-ink-700 text-ink-400'
                      }`}>{u.role || 'user'}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-400 text-xs">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div className="text-center py-10 text-ink-500 text-sm">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
