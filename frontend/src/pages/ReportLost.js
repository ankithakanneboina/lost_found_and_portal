import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, MapPin, Calendar, Phone, Tag, FileText, Zap } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useItemForm } from '../hooks/useItemForm';
import ImageDropzone from '../components/ImageDropzone';

export default function ReportLost() {
  const navigate = useNavigate();
  const { form, handleChange, setImage, loading, setLoading, categories, buildFormData } = useItemForm('lost');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.category) { toast.error('Item name and category are required'); return; }
    setLoading(true);
    try {
      await itemsAPI.reportLost(buildFormData());
      toast.success('Lost item reported! ML matching running in background…');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-lost/20 flex items-center justify-center">
            <AlertCircle size={20} className="text-lost" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Report a Lost Item</h1>
            <p className="text-sm text-ink-400">Fill in details so our ML engine can find matches</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-semibold text-white text-sm uppercase tracking-wider text-ink-400">Item Details</h2>

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <FileText size={13} /> Item Name <span className="text-accent">*</span>
              </label>
              <input name="itemName" value={form.itemName} onChange={handleChange} required
                placeholder="e.g. Black leather wallet"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-lost/50 transition-colors" />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <Tag size={13} /> Category <span className="text-accent">*</span>
              </label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white input-ring focus:border-lost/50 transition-colors">
                <option value="">Select category…</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <FileText size={13} /> Description
              </label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="Describe distinguishing features, colour, brand, serial number…"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-lost/50 transition-colors resize-none" />
              <p className="text-xs text-ink-500 mt-1">More detail = better ML matching accuracy</p>
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                  <MapPin size={13} /> Location Lost
                </label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Central Park, NY"
                  className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-lost/50 transition-colors" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                  <Calendar size={13} /> Date Lost
                </label>
                <input type="date" name="dateLost" value={form.dateLost} onChange={handleChange}
                  className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white input-ring focus:border-lost/50 transition-colors" />
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <Phone size={13} /> Contact Information
              </label>
              <input name="contact" value={form.contact} onChange={handleChange}
                placeholder="Phone or email"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-lost/50 transition-colors" />
            </div>
          </div>

          {/* Image upload */}
          <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6">
            <h2 className="font-display font-semibold text-ink-400 text-sm uppercase tracking-wider mb-4">Item Photo</h2>
            <ImageDropzone onFileSelect={setImage} label="" />
            <div className="flex items-start gap-2 mt-3 p-3 bg-accent/10 rounded-xl">
              <Zap size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-accent/80">
                Uploading a photo enables <strong>CNN image matching</strong>. Our MobileNetV2 model extracts
                feature vectors and uses cosine similarity to find visually similar items.
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-lost hover:bg-lost-dark rounded-xl text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base">
            {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <AlertCircle size={18} />}
            {loading ? 'Submitting & Running ML Matching…' : 'Report Lost Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
