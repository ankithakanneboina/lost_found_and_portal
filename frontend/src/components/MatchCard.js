import React from 'react';
import { Zap, Image, FileText, CheckCircle } from 'lucide-react';
import { itemsAPI } from '../services/api';

function ScoreBar({ label, value, color, icon: Icon }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-ink-400">
          <Icon size={11} />
          {label}
        </span>
        <span className={`font-mono font-medium ${color}`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full score-bar ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MatchCard({ match, onClaim }) {
  const { lostItem, foundItem, imageSimilarity, textSimilarity, finalScore, status } = match;
  const pct = Math.round(finalScore * 100);

  const scoreColor = pct >= 80 ? 'text-found' : pct >= 65 ? 'text-yellow-400' : 'text-orange-400';
  const scoreBg = pct >= 80 ? 'bg-found/10 border-found/30' : pct >= 65 ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-orange-400/10 border-orange-400/30';

  return (
    <div className={`bg-ink-800 border rounded-2xl overflow-hidden ${
      status === 'claimed' ? 'border-found/40' : 'border-ink-700'
    }`}>
      {/* Score header */}
      <div className={`px-4 py-3 border-b border-ink-700 flex items-center justify-between ${scoreBg}`}>
        <div className="flex items-center gap-2">
          <Zap size={16} className={scoreColor} />
          <span className="font-display font-bold text-white text-sm">ML Match</span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'claimed' && (
            <span className="flex items-center gap-1 text-xs text-found">
              <CheckCircle size={12} /> Claimed
            </span>
          )}
          <span className={`font-mono font-bold text-xl ${scoreColor}`}>{pct}%</span>
        </div>
      </div>

      {/* Items comparison */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Lost item */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-lost/80 uppercase tracking-wide">Lost Item</div>
          {lostItem ? (
            <div className="bg-ink-700/50 rounded-xl p-3">
              {lostItem.image && (
                <img src={itemsAPI.getImageUrl(lostItem.image)} alt=""
                  className="w-full h-20 object-cover rounded-lg mb-2" />
              )}
              <p className="text-sm font-medium text-white truncate">{lostItem.itemName}</p>
              <p className="text-xs text-ink-400 truncate">{lostItem.location}</p>
            </div>
          ) : <div className="bg-ink-700/50 rounded-xl p-3 text-xs text-ink-500">Not found</div>}
        </div>

        {/* Found item */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-found/80 uppercase tracking-wide">Found Item</div>
          {foundItem ? (
            <div className="bg-ink-700/50 rounded-xl p-3">
              {foundItem.image && (
                <img src={itemsAPI.getImageUrl(foundItem.image)} alt=""
                  className="w-full h-20 object-cover rounded-lg mb-2" />
              )}
              <p className="text-sm font-medium text-white truncate">{foundItem.itemName}</p>
              <p className="text-xs text-ink-400 truncate">{foundItem.location}</p>
            </div>
          ) : <div className="bg-ink-700/50 rounded-xl p-3 text-xs text-ink-500">Not found</div>}
        </div>
      </div>

      {/* ML Score breakdown */}
      <div className="px-4 pb-3 space-y-2">
        <ScoreBar label="Image Similarity" value={imageSimilarity || 0} color="text-blue-400" icon={Image} />
        <ScoreBar label="Text Similarity" value={textSimilarity || 0} color="text-purple-400" icon={FileText} />
        <ScoreBar label="Final Score" value={finalScore || 0} color={scoreColor} icon={Zap} />
      </div>

      {/* Actions */}
      {status !== 'claimed' && onClaim && (
        <div className="px-4 pb-4">
          <button onClick={() => onClaim(match._id)}
            className="w-full py-2 bg-accent hover:bg-accent-light rounded-xl text-white text-sm font-medium transition-colors">
            Submit Claim Request
          </button>
        </div>
      )}
    </div>
  );
}
