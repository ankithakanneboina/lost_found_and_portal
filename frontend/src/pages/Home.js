import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Zap, Shield, Bell, ArrowRight } from 'lucide-react';
import StatsBar from '../components/StatsBar';

const Feature = ({ icon: Icon, title, desc, delay }) => (
  <div className="animate-fade-up bg-ink-800 border border-ink-700 rounded-2xl p-6 hover:border-accent/40 transition-colors"
    style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
      <Icon size={20} className="text-accent" />
    </div>
    <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-ink-300 leading-relaxed">{desc}</p>
  </div>
);

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <div className="text-center mb-16 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-medium mb-6">
          <Zap size={12} />
          ML-powered matching engine
        </div>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-none mb-6">
          Lost something?<br />
          <span className="gradient-text">We'll find it.</span>
        </h1>
        <p className="text-lg text-ink-300 max-w-xl mx-auto mb-10 leading-relaxed">
          Report lost or found items and let our machine learning engine
          automatically match them — with real-time notifications.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/report-lost"
            className="flex items-center gap-2 px-6 py-3 bg-lost rounded-xl text-white font-medium hover:bg-lost-dark transition-all hover:shadow-lg hover:shadow-lost/25">
            <Plus size={16} /> Report Lost Item
          </Link>
          <Link to="/report-found"
            className="flex items-center gap-2 px-6 py-3 bg-found rounded-xl text-white font-medium hover:bg-found-dark transition-all hover:shadow-lg hover:shadow-found/25">
            <Plus size={16} /> Report Found Item
          </Link>
          <Link to="/browse"
            className="flex items-center gap-2 px-6 py-3 border border-ink-600 rounded-xl text-ink-200 font-medium hover:border-accent/50 hover:text-white transition-colors">
            <Search size={16} /> Browse All
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-16 animate-fade-up" style={{ animationDelay: '150ms', opacity: 0 }}>
        <StatsBar />
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="font-display font-bold text-3xl text-white text-center mb-3">How It Works</h2>
        <p className="text-ink-400 text-center mb-10">Three steps to reunite items with their owners</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: '01', title: 'Report', desc: 'Submit a lost or found item with photos, description, location and contact details.' },
            { n: '02', title: 'ML Matching', desc: 'Our CNN extracts image features and NLP analyses text. Cosine similarity finds the best matches.' },
            { n: '03', title: 'Notify & Reunite', desc: 'Real-time Socket.IO notifications alert owners instantly. Claim and connect.' },
          ].map(({ n, title, desc }, i) => (
            <div key={n} className="relative bg-ink-800 border border-ink-700 rounded-2xl p-6 animate-fade-up"
              style={{ animationDelay: `${i * 100 + 200}ms`, opacity: 0 }}>
              <div className="font-display font-black text-6xl text-ink-700 mb-4 leading-none">{n}</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
              <p className="text-sm text-ink-300 leading-relaxed">{desc}</p>
              {i < 2 && <ArrowRight size={18} className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-ink-600 z-10 bg-ink-900 rounded-full p-0.5" />}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="font-display font-bold text-3xl text-white text-center mb-3">Key Features</h2>
        <p className="text-ink-400 text-center mb-10">Built with a full ML pipeline</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon={Zap} title="Image Matching" desc="MobileNetV2 CNN extracts 1280-dim feature vectors. Cosine similarity compares them instantly." delay={0} />
          <Feature icon={Search} title="Text NLP" desc="TF-IDF + Sentence Transformers compare item names, descriptions, and categories semantically." delay={100} />
          <Feature icon={Bell} title="Real-time Alerts" desc="Socket.IO pushes notifications the moment a match is detected. No polling required." delay={200} />
          <Feature icon={Shield} title="JWT Auth" desc="Secure registration, login, and role-based access with bcrypt-hashed passwords." delay={300} />
        </div>
      </div>
    </div>
  );
}
