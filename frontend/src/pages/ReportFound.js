import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, MapPin, Calendar, Phone, Tag, FileText, Zap } from 'lucide-react';
import { itemsAPI } from '../services/api';
import { useItemForm } from '../hooks/useItemForm';
import ImageDropzone from '../components/ImageDropzone';

export default function ReportFound() {
  const navigate = useNavigate();
  const { form, handleChange, setImage, loading, setLoading, categories, buildFormData } = useItemForm('found');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.category) { toast.error('Item name and category are required'); return; }
    setLoading(true);
    try {
      await itemsAPI.reportFound(buildFormData());
      toast.success('Found item reported! Searching for owner via ML…');
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
          <div className="w-10 h-10 rounded-xl bg-found/20 flex items-center justify-center">
            <CheckCircle size={20} className="text-found" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Report a Found Item</h1>
            <p className="text-sm text-ink-400">Help return this item to its owner</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-semibold text-ink-400 text-sm uppercase tracking-wider">Item Details</h2>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <FileText size={13} /> Item Name <span className="text-accent">*</span>
              </label>
              <input name="itemName" value={form.itemName} onChange={handleChange} required
                placeholder="e.g. Blue iPhone 14"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-found/50 transition-colors" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <Tag size={13} /> Category <span className="text-accent">*</span>
              </label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white input-ring focus:border-found/50 transition-colors">
                <option value="">Select category…</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <FileText size={13} /> Description
              </label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="Describe the item in detail — brand, colour, markings, condition…"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-found/50 transition-colors resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                  <MapPin size={13} /> Where Found
                </label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Times Square, NYC"
                  className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-found/50 transition-colors" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                  <Calendar size={13} /> Date Found
                </label>
                <input type="date" name="dateFound" value={form.dateFound} onChange={handleChange}
                  className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white input-ring focus:border-found/50 transition-colors" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink-200 mb-1.5">
                <Phone size={13} /> Your Contact
              </label>
              <input name="contact" value={form.contact} onChange={handleChange}
                placeholder="Phone or email"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-500 input-ring focus:border-found/50 transition-colors" />
            </div>
          </div>

          <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6">
            <h2 className="font-display font-semibold text-ink-400 text-sm uppercase tracking-wider mb-4">Item Photo</h2>
            <ImageDropzone onFileSelect={setImage} label="" />
            <div className="flex items-start gap-2 mt-3 p-3 bg-found/10 rounded-xl">
              <Zap size={14} className="text-found mt-0.5 flex-shrink-0" />
              <p className="text-xs text-found/80">
                A clear photo dramatically improves ML match accuracy. The system will immediately
                compare this image against all active lost items using <strong>cosine similarity</strong>.
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-found hover:bg-found-dark rounded-xl text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base">
            {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle size={18} />}
            {loading ? 'Submitting & Searching for Owner…' : 'Report Found Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
