import React from 'react';
import { 
  Users, Film, MessageSquare, ShoppingBag, 
  Sparkles, ShieldCheck, Flag, PhoneCall, 
  CheckCircle2, ArrowRight, Shield, Globe, 
  Zap, Lock, Play, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUsers } from '../server/db';

export const LandingPage: React.FC = () => {
  const { setShowAuthModal, setAuthMode, switchDemoUser } = useApp() as any;

  const features = [
    {
      icon: Users,
      title: 'Global Social Feed & Stories',
      desc: 'Share rich photo galleries, 24-hour disappearing Stories, custom polls, background status updates, and interactive multi-reactions.'
    },
    {
      icon: Film,
      title: 'High-Impact Fullscreen Reels',
      desc: 'Discover vertical short videos, trending audio soundtracks, creator tips, and immersive micro-documentaries with snappy mobile performance.'
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Messenger & Voice Calls',
      desc: 'Instant 1-on-1 and group chats with voice notes, photo sharing, typing indicators, read receipts, and peer-to-peer WebRTC video calling.'
    },
    {
      icon: ShoppingBag,
      title: 'Marketplace with Cash on Delivery',
      desc: 'Buy and sell locally or globally with zero financial friction. Safe Cash on Delivery model ensures inspect-first, pay-after confidence.'
    },
    {
      icon: Sparkles,
      title: 'Creator Studio & Monetization',
      desc: 'Empowering digital artists, educators, and journalists with in-depth reach analytics, audience metrics, and creator revenue opportunities.'
    },
    {
      icon: ShieldCheck,
      title: 'AI Content Moderation & Privacy',
      desc: 'Powered by Gemini AI intelligent text and media safety scanners that flag potential risks to human administrators for transparent safety.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              NEMDAN Global Social Network V1.0 Live
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
              The Global Space to <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Connect, Create & Trade
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
              Experience an authentic, high-speed social ecosystem. From vibrant News Feeds and immersive 24h Stories to full-screen Reels, real-time Messenger, and our Cash-on-Delivery Marketplace.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                id="hero-get-started-btn"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-login-btn"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                Log In to NEMDAN
              </button>
            </div>

            {/* Quick Demo Launch Pills */}
            <div className="pt-8">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Or Explore with a 1-Click Demo Profile</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {initialUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => switchDemoUser(user.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-xs font-medium shadow-2xs transition-all cursor-pointer"
                  >
                    <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{user.name.split(' ')[0]} ({user.role.replace('_', ' ')})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built for Real Human Connection</h2>
          <p className="text-slate-600 text-base">
            Every feature in NEMDAN is crafted to be responsive, respectful of privacy, and empowering for communities worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deep Feature Spotlight (Marketplace & Realtime) */}
      <section className="py-16 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Trusted Local Commerce
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Marketplace with Verified <br />
                <span className="text-blue-400">Cash on Delivery (COD)</span>
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                NEMDAN protects buyers and sellers with localized Cash on Delivery transactions. Buyers can inspect ceramics, electronics, cameras, or fashion items before exchanging cash, eliminating scam anxiety.
              </p>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Transparent seller ratings & verification badges</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Instant 1-click in-app Messenger direct to seller</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Flexible delivery options: Local Pickup & NEMDAN Express</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-slate-400 font-mono">nemdan.global/marketplace</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=150&auto=format&fit=crop&q=80"
                    alt="Ceramics"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Handcrafted Nordic Ceramic Vase</p>
                    <p className="text-xs text-blue-400 font-bold mt-0.5">$65.00 USD</p>
                    <p className="text-[11px] text-slate-400">Payment: Cash on Delivery</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-green-900/60 text-green-300 text-xs font-semibold border border-green-700/50">
                    COD Active
                  </span>
                </div>
                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/40 text-xs text-blue-200">
                  ⚡ Order confirmed! Seller will dispatch with NEMDAN Delivery courier. You pay upon doorstep receipt.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              N
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">NEMDAN Social Platform</p>
              <p className="text-xs text-slate-500">© 2026 NEMDAN Global. All rights reserved.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#terms" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#terms" className="hover:text-blue-600">Community Standards</a>
            <a href="#terms" className="hover:text-blue-600">Marketplace Safety</a>
            <a href="#terms" className="hover:text-blue-600">Creator Guidelines</a>
            <a href="#terms" className="hover:text-blue-600">Help & Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
