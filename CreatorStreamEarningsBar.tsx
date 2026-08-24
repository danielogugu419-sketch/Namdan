import React from 'react';
import { DollarSign, Coins, Gift, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CreatorStreamEarningsBarProps {
  totalCoins: number;
  totalGifts: number;
  onOpenWithdrawal?: () => void;
}

export const CreatorStreamEarningsBar: React.FC<CreatorStreamEarningsBarProps> = ({
  totalCoins,
  totalGifts,
  onOpenWithdrawal
}) => {
  const { creatorEarnings } = useApp();
  
  // Platform commission is default 30%, creator gets 70% ($0.007 per coin)
  const estimatedStreamEarnings = (totalCoins * 0.007).toFixed(2);
  const totalBalance = creatorEarnings?.withdrawableBalanceUSD?.toFixed(2) || '0.00';

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-3.5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
          👑
        </div>
        <div>
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Host Earnings & Gifting Stats</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px]">Live</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-300 mt-0.5 flex-wrap">
            <span>🪙 {totalCoins.toLocaleString()} Coins</span>
            <span>•</span>
            <span>🎁 {totalGifts.toLocaleString()} Gifts</span>
            <span>•</span>
            <span className="text-emerald-400 font-extrabold">+${estimatedStreamEarnings} USD Earned</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
        <div className="text-left sm:text-right">
          <div className="text-[10px] text-slate-400">Available Payout</div>
          <div className="text-sm font-black text-white">${totalBalance}</div>
        </div>

        {onOpenWithdrawal && (
          <button
            onClick={onOpenWithdrawal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-md"
          >
            <span>Request Payout</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
