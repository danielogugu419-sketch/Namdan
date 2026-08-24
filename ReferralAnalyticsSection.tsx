import React, { useState } from 'react';
import { 
  Users, Gift, Award, TrendingUp, Copy, Check, 
  Share2, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, BarChart3, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReferralConversion } from '../../types';

export const ReferralAnalyticsSection: React.FC = () => {
  const { currentUser, referralStats, referralConversions, addToast, walletCurrency, exchangeRateNGN } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const referralCode = currentUser?.referralCode || `NEMDAN_${currentUser?.id?.slice(0, 6)?.toUpperCase() || '789X'}`;
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedLink(true);
    addToast('Referral Link Copied!', 'Share with friends to earn ₦500 per valid registration.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    addToast('Referral Code Copied!', `Code: ${referralCode}`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Monthly / Weekly Growth Chart Data for Bar Graph
  const growthData = [
    { label: 'Week 1', conversions: 3, earned: 1500, heightPct: 45 },
    { label: 'Week 2', conversions: 5, earned: 2500, heightPct: 70 },
    { label: 'Week 3', conversions: 4, earned: 2000, heightPct: 60 },
    { label: 'Week 4', conversions: 8, earned: 4000, heightPct: 100 },
    { label: 'Current', conversions: 2, earned: 1000, heightPct: 35 }
  ];

  const totalConversions = referralStats?.totalConversions || referralConversions.length || 12;
  const pendingRewardsNGN = referralStats?.pendingRewardsNGN || 1500;
  const earnedRewardsNGN = referralStats?.earnedRewardsNGN || 6000;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Referral Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 border border-emerald-500/30 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-black uppercase tracking-wider shadow-inner">
            <Gift className="w-3.5 h-3.5 text-emerald-300" />
            NEMDAN Referral Program
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Invite Friends & Earn ₦500 per Signup
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Give your friends a ₦200 welcome bonus when they join with your link, and receive ₦500 directly in your wallet once they complete registration!
          </p>

          {/* Referral Link & Code Inputs */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {/* Link Box */}
            <div className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Your Referral Link</span>
                <span className="text-xs font-mono font-bold text-white truncate block">
                  {referralLink}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Code Box */}
            <div className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">Referral Code</span>
                <span className="text-sm font-mono font-black text-amber-300 truncate block">
                  {referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row (3-Pill Stat Block) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Conversions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Total Referrals</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalConversions}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active network</span>
          </p>
        </div>

        {/* Total Earned */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Total Paid Rewards</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₦{earnedRewardsNGN.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Credited directly to wallet
          </p>
        </div>

        {/* Pending Rewards */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Pending Validation</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ₦{pendingRewardsNGN.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Pending anti-fraud check
          </p>
        </div>

      </div>

      {/* Analytics Growth Chart (Bar Graph) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>Referral Performance & Growth Analytics</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Weekly conversion volume and earned bonus payouts
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            {(['7d', '30d', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  timeRange === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Bar Chart Visualization */}
        <div className="pt-4 pb-2">
          <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2">
            {growthData.map(item => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-center bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-1 rounded-lg shadow-md pointer-events-none whitespace-nowrap mb-1">
                  ₦{item.earned.toLocaleString()} ({item.conversions} users)
                </div>

                {/* Animated Bar */}
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col justify-end p-1 h-full">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                    style={{ height: `${item.heightPct}%` }}
                  >
                    <span className="hidden sm:inline">+{item.conversions}</span>
                  </div>
                </div>

                {/* X-axis Label */}
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Anti-Fraud Notice */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-extrabold block">Anti-Fraud Protection Active</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400/90">
              Referral bonuses are automatically credited when new users register with verified devices and pass eligibility checks.
            </span>
          </div>
        </div>
      </div>

      {/* Referral History / Conversions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Recent Referral Conversions
        </h3>

        <div className="space-y-2.5">
          {referralConversions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              No referrals yet. Share your unique link above to start earning!
            </div>
          ) : (
            referralConversions.map((c: ReferralConversion) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {(c.refereeName || c.referredUserName || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.refereeName || c.referredUserName || 'New Member'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registered {new Date(c.createdAt).toLocaleDateString()} • {c.eligibilityStatus || (c.status === 'rewarded' || c.status === 'eligible' ? 'Verified & Eligible' : 'Pending Verification')}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                    +₦{(c.referrerReward || c.referrerRewardNGN || 500).toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                    c.status === 'rewarded' || c.status === 'credited' || c.status === 'eligible'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
