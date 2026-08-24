import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, Eye, DollarSign, 
  Users, Award, Film, BarChart3, Clock, 
  ArrowUpRight, CheckCircle2, Zap 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const CreatorDashboardView: React.FC = () => {
  const { currentUser, reels } = useApp() as any;
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      api.getCreatorStats(currentUser.id).then(res => setStats(res));
    }
  }, [currentUser]);

  const defaultStats = {
    followersCount: 12450,
    totalViews: 843200,
    totalLikes: 94500,
    estimatedEarnings: 1280.50,
    monthlyGrowth: '+24.8%'
  };

  const currentStats = {
    followersCount: typeof stats?.followersCount === 'number' ? stats.followersCount : (typeof stats?.followers === 'number' ? stats.followers : defaultStats.followersCount),
    totalViews: typeof stats?.totalViews === 'number' ? stats.totalViews : (typeof stats?.monthlyViews === 'number' ? stats.monthlyViews : defaultStats.totalViews),
    totalLikes: typeof stats?.totalLikes === 'number' ? stats.totalLikes : defaultStats.totalLikes,
    estimatedEarnings: typeof stats?.estimatedEarnings === 'number' ? stats.estimatedEarnings : defaultStats.estimatedEarnings,
    monthlyGrowth: stats?.monthlyGrowth || defaultStats.monthlyGrowth
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      
      {/* Creator Studio Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>NEMDAN Creator Studio Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {currentUser?.name}</h1>
          <p className="text-xs sm:text-sm text-purple-200">
            Track video monetization, reel analytics, audience retention, and global reach.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-right">
            <p className="text-[11px] text-purple-200 uppercase tracking-wider font-bold">Estimated Earnings</p>
            <p className="text-2xl font-black text-white">${(currentStats.estimatedEarnings ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Video Views</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{(currentStats.totalViews ?? 0).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs font-bold text-green-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% from last 30 days</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reactions</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{(currentStats.totalLikes ?? 0).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs font-bold text-green-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.1% engagement</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Follower Base</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{(currentStats.followersCount ?? 0).toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Monthly Growth: {currentStats.monthlyGrowth}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Creator Tier</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">NEMDAN Pro</p>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>Full Monetization Unlocked</span>
          </div>
        </div>

      </div>

      {/* Top Performing Reels Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Reels Performance Table</h3>
            <p className="text-xs text-slate-500">Audience metrics and view velocity</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Realtime Analytics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Reel Title</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Reactions</th>
                <th className="pb-3">Comments</th>
                <th className="pb-3">Audio Soundtrack</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reels.map((reel: any, idx: number) => (
                <tr key={reel.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-slate-900 max-w-xs truncate">
                    {reel.caption.slice(0, 45)}...
                  </td>
                  <td className="py-3 font-mono font-bold">{(12500 * (idx + 1)).toLocaleString()}</td>
                  <td className="py-3 font-mono">{(reel.reactions?.length || 45) * 12}</td>
                  <td className="py-3 font-mono">{reel.commentsCount || 18}</td>
                  <td className="py-3 text-slate-500 truncate max-w-[150px]">{reel.audioTrack}</td>
                  <td className="py-3">
                    <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Monetized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
