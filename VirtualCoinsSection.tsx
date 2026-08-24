import React, { useState } from 'react';
import { Coins, Plus, Sparkles, Zap, ShieldCheck, Check, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoinRechargeModal } from '../live/CoinRechargeModal';

export const VirtualCoinsSection: React.FC = () => {
  const { userCoins, coinPackages, virtualGifts, buyCoins, addToast } = useApp();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Coin Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-900 text-white p-6 sm:p-8 border border-amber-400/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/20 text-yellow-200 text-xs font-black uppercase tracking-wider">
              <span>🪙</span>
              <span>Virtual Coins Wallet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Power Up Live Streams with Coins
            </h2>
            <p className="text-xs sm:text-sm text-yellow-100/90 max-w-lg">
              Virtual Coins can be used to send TikTok-style animated gifts to creators in any live stream with real-time screen animations and combos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center md:text-right space-y-2 shrink-0">
            <span className="text-xs text-yellow-300 uppercase font-bold tracking-wider block">Your Coin Balance</span>
            <div className="text-3xl sm:text-4xl font-black text-white flex items-center justify-center md:justify-end gap-2">
              <span>🪙</span>
              <span>{userCoins.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-yellow-50 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buy More Coins</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured Coin Packages */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Instant Coin Packages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a package to top-up your coin wallet instantly
            </p>
          </div>

          <button
            onClick={() => setShowRechargeModal(true)}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Custom Amount →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {coinPackages.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => setShowRechargeModal(true)}
              className="relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              {pkg.badge && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                  {pkg.badge}
                </span>
              )}

              <div className="flex items-center gap-2.5">
                <span className="text-3xl group-hover:scale-110 transition-transform">🪙</span>
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {pkg.coins.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Coins
                  </div>
                </div>
              </div>

              {pkg.bonusCoins && pkg.bonusCoins > 0 ? (
                <div className="mt-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                  +{pkg.bonusCoins} Bonus Coins Free
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-transparent select-none">-</div>
              )}

              <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                  ${pkg.priceUSD.toFixed(2)}
                </span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  Buy Now →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Virtual Gift Catalog */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <span>Animated Gift Store Catalog</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {virtualGifts.map(g => (
            <div
              key={g.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-between"
            >
              <span className="text-3xl mb-1 hover:scale-125 transition-transform">{g.icon}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">{g.name}</span>
              <span className="text-[11px] font-black text-amber-500 mt-1">🪙 {g.coins}</span>
            </div>
          ))}
        </div>
      </div>

      <CoinRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />

    </div>
  );
};
