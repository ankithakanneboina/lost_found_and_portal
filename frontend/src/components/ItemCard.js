import React from 'react';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { itemsAPI } from '../services/api';

const categoryColors = {
  Electronics: 'bg-blue-500/20 text-blue-300',
  'Wallet/Purse': 'bg-yellow-500/20 text-yellow-300',
  Keys: 'bg-orange-500/20 text-orange-300',
  Documents: 'bg-purple-500/20 text-purple-300',
  Jewelry: 'bg-pink-500/20 text-pink-300',
  Phone: 'bg-cyan-500/20 text-cyan-300',
  Bags: 'bg-teal-500/20 text-teal-300',
  Other: 'bg-ink-500/20 text-ink-300',
};

export default function ItemCard({ item, type, onResolve }) {
  const isLost = type === 'lost';
  const imageUrl = itemsAPI.getImageUrl(item.image);
  const dateLabel = isLost ? item.dateLost : item.dateFound;
  const catColor = categoryColors[item.category] || categoryColors['Other'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { return format(new Date(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
  };

  return (
    <div className="item-card bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden group">
      {/* Image */}
      <div className="relative h-40 bg-ink-700 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">📦</span>
          </div>
        )}
        {/* Type badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold font-display uppercase tracking-wide ${
          isLost ? 'bg-lost/90 text-white' : 'bg-found/90 text-white'
        }`}>
          {isLost ? '🔴 Lost' : '🟢 Found'}
        </div>
        {/* Status badge */}
        {item.status === 'resolved' && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-ink-900/90 text-xs text-ink-300">
            Resolved
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-white text-base truncate mb-1">{item.itemName}</h3>
        {item.description && (
          <p className="text-sm text-ink-300 line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <Tag size={11} />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor}`}>{item.category}</span>
          </div>
          {item.location && (
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <MapPin size={11} />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {dateLabel && (
            <div className="flex items-center gap-2 text-xs text-ink-400">
              <Calendar size={11} />
              <span>{formatDate(dateLabel)}</span>
            </div>
          )}
        </div>

        {/* Contact + resolve */}
        <div className="mt-3 pt-3 border-t border-ink-700 flex items-center justify-between gap-2">
          {item.contact && (
            <a href={`tel:${item.contact}`}
              className="text-xs text-accent hover:text-accent-light truncate">
              📞 {item.contact}
            </a>
          )}
          {onResolve && item.status === 'active' && (
            <button onClick={() => onResolve(item._id)}
              className="ml-auto text-xs px-3 py-1 bg-found/20 text-found rounded-lg hover:bg-found/30 transition-colors whitespace-nowrap">
              Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
