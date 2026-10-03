import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { GitMerge, RefreshCw } from 'lucide-react';
import { matchesAPI } from '../services/api';
import MatchCard from '../components/MatchCard';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data } = await matchesAPI.getMyMatches();
      setMatches(data);
    } catch { toast.error('Failed to load matches'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, []);

  const handleClaim = async (matchId) => {
    try {
      await matchesAPI.claimMatch(matchId);
      toast.success('Claim submitted! The other party will be notified.');
      fetchMatches();
    } catch { toast.error('Failed to submit claim'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <GitMerge size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">ML Matches</h1>
            <p className="text-sm text-ink-400">Items matched by our machine learning engine</p>
          </div>
        </div>
        <button onClick={fetchMatches}
          className="flex items-center gap-2 px-4 py-2 bg-ink-800 border border-ink-700 rounded-xl text-sm text-ink-300 hover:bg-ink-700 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ML info banner */}
      <div className="mb-6 p-4 bg-accent/10 border border-accent/25 rounded-2xl flex items-start gap-3">
        <GitMerge size={18} className="text-accent mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-white font-medium">How ML Matching Works</p>
          <p className="text-xs text-ink-300 mt-1">
            Matches are scored using <strong>MobileNetV2 image features</strong> (55% weight) + 
            <strong> TF-IDF text similarity</strong> (45% weight). Pairs scoring ≥60% are shown here.
            Real-time Socket.IO alerts notify you instantly when a new match is found.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2].map(i => (
            <div key={i} className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden animate-pulse h-80" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-ink-800 border border-ink-700 rounded-2xl">
          <GitMerge size={40} className="mx-auto mb-3 text-ink-600" />
          <p className="font-display font-semibold text-ink-300 text-lg">No matches yet</p>
          <p className="text-sm text-ink-500 mt-2">
            Post more items or wait for someone to report a matching item.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((match, i) => (
            <div key={match._id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
              <MatchCard match={match} onClaim={handleClaim} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
