import React, { useEffect, useState } from 'react';
import { matchesAPI } from '../services/api';

export default function StatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    matchesAPI.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { label: 'Lost Reports', value: stats.totalLost, color: 'text-lost' },
    { label: 'Found Reports', value: stats.totalFound, color: 'text-found' },
    { label: 'ML Matches', value: stats.totalMatches, color: 'text-accent' },
    { label: 'Reunited', value: stats.resolvedMatches, color: 'text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-700 rounded-2xl overflow-hidden">
      {items.map(({ label, value, color }) => (
        <div key={label} className="bg-ink-800 px-6 py-5 text-center">
          <div className={`font-display font-bold text-3xl ${color}`}>{value ?? '—'}</div>
          <div className="text-xs text-ink-400 mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
