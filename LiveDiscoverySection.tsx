import React, { useState, useMemo } from 'react';
import { 
  Radio, Play, Users, Eye, Search, Filter, Sparkles, 
  Flame, Plus, RefreshCw, Trophy, Coins, Clock, Zap, CheckCircle2, Video
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LiveStream } from '../../types';
import { CoinRechargeModal } from './CoinRechargeModal';

const CATEGORIES = [
  { id: 'all', label: 'All Streams', icon: '✨' },
  { id: 'gaming', label: 'Gaming & Esports', icon: '🎮' },
  { id: 'music', label: 'Music & DJ', icon: '🎵' },
  { id: 'chat', label: 'Just Chatting', icon: '💬' },
  { id: 'coding', label: 'Coding & Tech', icon: '💻' },
  { id: 'crypto', label: 'Crypto & Web3', icon: '⚡' },
  { id: 'shopping', label: 'Live Shopping', icon: '🛍️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'trading', label: 'Trading & Finance', icon: '📈' },
  { id: 'fitness', label: 'Fitness & Health', icon: '💪' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌴' }
];

export const LiveDiscoverySection: React.FC = () => {
  const { 
    liveStreams, 
    setActiveLiveStream, 
    setShowGoLiveModal, 
    refreshLiveStreams,
    userCoins
  } = useApp() as any;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'ended'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshLiveStreams();
    setIsRefreshing(false);
  };

  const filteredStreams = useMemo(() => {
    return (liveStreams || []).filter((s: LiveStream) => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesSearch = !searchQuery.trim() || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [liveStreams, selectedCategory, statusFilter, searchQuery]);

  const activeLiveList = useMemo(() => {
    return filteredStreams.filter((s: LiveStream) => s.status === 'live');
  }, [filteredStreams]);

  const replayList = useMemo(() => {
    return filteredStreams.filter((s: LiveStream) => s.status === 'ended');
  }, [filteredStreams]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>NEMDAN LIVE 🌐</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Connect, Stream & Gift in Real-Time
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Watch immersive vertical live streams, send animated 3D gifts, support creators with coin tips, and broadcast to the global community.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* User Coin Balance Badge */}
            <button
              onClick={() => setShowRechargeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 hover:bg-amber-500/25 text-amber-300 font-extrabold text-xs transition-all cursor-pointer shadow-lg"
            >
              <span>🪙</span>
              <span>{userCoins.toLocaleString()} Coins</span>
              <Plus className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
            </button>

            {/* Go Live Broadcast CTA */}
            <button
              id="go-live-cta-btn"
              onClick={() => setShowGoLiveModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:brightness-110 text-white font-black text-xs shadow-xl shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
            >
              <Radio className="w-4 h-4" />
              <span>Start Broadcasting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              selectedCategory === cat.id
                ? 'bg-rose-600 text-white shadow-rose-600/30 scale-102'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Status Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search streams, hosts, tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {(['all', 'live', 'ended'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All' : st === 'live' ? '🔴 Live Now' : '📼 Replays'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 🔴 ACTIVE LIVE STREAMS SECTION */}
      {activeLiveList.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>LIVE NOW</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {activeLiveList.length} Active
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeLiveList.map((stream: LiveStream) => (
              <div
                key={stream.id}
                onClick={() => setActiveLiveStream(stream)}
                className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl cursor-pointer hover:border-rose-500/50 hover:shadow-rose-500/10 transition-all duration-300 flex flex-col"
                style={{ aspectRatio: '9/14' }}
              >
                {/* Background Thumbnail Poster */}
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90 pointer-events-none" />

                {/* Card Top Pill Badges */}
                <div className="relative z-10 p-3 flex items-start justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-black shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>LIVE</span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-bold shadow-md">
                    <Users className="w-3 h-3 text-rose-400" />
                    <span>{(stream.viewerCount || stream.viewersCount || 1).toLocaleString()}</span>
                  </div>
                </div>

                {/* Center Hover Play Cue */}
                <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Card Bottom Details */}
                <div className="relative z-10 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={stream.hostAvatar}
                      alt={stream.hostName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-rose-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1 truncate">
                        <span>{stream.hostName}</span>
                        {stream.hostVerified && <CheckCircle2 className="w-3 h-3 text-sky-400 fill-current" />}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        @{stream.hostUsername}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-white line-clamp-2 leading-snug">
                    {stream.title}
                  </h3>

                  {stream.tags && stream.tags.length > 0 && (
                    <div className="flex items-center gap-1 overflow-hidden pt-1">
                      {stream.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white/80 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 📼 SAVED REPLAYS (VODs) */}
      {replayList.length > 0 && (
        <section className="space-y-3.5 pt-2">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            <span>Saved Broadcast Replays</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {replayList.length} Replays
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {replayList.map((stream: LiveStream) => (
              <div
                key={stream.id}
                onClick={() => setActiveLiveStream(stream)}
                className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                style={{ aspectRatio: '9/14' }}
              >
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90 pointer-events-none" />

                <div className="relative z-10 p-3 flex items-start justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-black shadow-md">
                    <span>📼 REPLAY</span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-bold shadow-md">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{stream.startedAt}</span>
                  </div>
                </div>

                <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="relative z-10 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={stream.hostAvatar}
                      alt={stream.hostName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {stream.hostName}
                      </div>
                      <div className="text-[10px] text-slate-300">
                        @{stream.hostUsername}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-white line-clamp-2 leading-snug">
                    {stream.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredStreams.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center text-2xl">
            📡
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No live streams found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active streams matched your search or category filter. Try changing your filters or start your own broadcast!
          </p>
          <button
            onClick={() => setShowGoLiveModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-rose-500 transition-all"
          >
            Start Broadcasting Now
          </button>
        </div>
      )}

      {/* Coin Recharge Modal */}
      <CoinRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />

    </div>
  );
};
