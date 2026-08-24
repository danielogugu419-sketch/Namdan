import React, { useState } from 'react';
import { 
  Gift, Coins, DollarSign, Plus, Trash2, Edit3, 
  Check, X, CheckCircle2, XCircle, Clock, ShieldCheck, 
  Percent, ArrowUpRight, Sparkles, RefreshCw, Save
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VirtualGiftItem, CoinPackage, WithdrawalRequest } from '../../types';

export const AdminGiftingAndReferralPanel: React.FC = () => {
  const { 
    virtualGifts, 
    coinPackages, 
    creatorEarnings, 
    addToast 
  } = useApp();

  // Local editable states
  const [giftsList, setGiftsList] = useState<VirtualGiftItem[]>(virtualGifts || []);
  const [packagesList, setPackagesList] = useState<CoinPackage[]>(coinPackages || []);
  const [platformCommissionPct, setPlatformCommissionPct] = useState<number>(30);
  const [referrerRewardNGN, setReferrerRewardNGN] = useState<number>(500);
  const [refereeRewardNGN, setRefereeRewardNGN] = useState<number>(200);
  const [antiFraudEnabled, setAntiFraudEnabled] = useState<boolean>(true);

  // New gift modal / state
  const [showAddGift, setShowAddGift] = useState(false);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftIcon, setNewGiftIcon] = useState('🎁');
  const [newGiftCoins, setNewGiftCoins] = useState(50);
  const [newGiftAnimation, setNewGiftAnimation] = useState<'heart_burst' | 'rose_shower' | 'rocket_launch' | 'diamond_sparkle' | 'lion_roar' | 'crown_shine' | 'super_galaxy'>('heart_burst');

  // Withdrawal requests review
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([
    {
      id: 'wdr_101',
      creatorId: 'usr_sarah',
      creatorName: 'Sarah Jenkins',
      amountUSD: 145.00,
      paymentMethod: 'bank_transfer',
      accountDetails: {
        accountName: 'Sarah Jenkins',
        accountNumber: '0238491029',
        bankName: 'Access Bank'
      },
      status: 'pending',
      requestedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'wdr_102',
      creatorId: 'usr_emmanuel',
      creatorName: 'Emmanuel Okafor',
      amountUSD: 70.00,
      paymentMethod: 'paypal',
      accountDetails: {
        accountNumber: 'emmanuel.dev@gmail.com'
      },
      status: 'pending',
      requestedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ]);

  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName.trim()) return;

    const newGift: VirtualGiftItem = {
      id: `gift_custom_${Date.now()}`,
      name: newGiftName.trim(),
      icon: newGiftIcon,
      coinPrice: Number(newGiftCoins),
      coins: Number(newGiftCoins),
      category: 'special',
      animation: newGiftAnimation,
      soundEffect: 'gift_fanfare'
    };

    setGiftsList(prev => [...prev, newGift]);
    setShowAddGift(false);
    setNewGiftName('');
    addToast('Gift Created', `Added ${newGift.name} to the live gift catalog.`, 'success');
  };

  const handleDeleteGift = (id: string) => {
    setGiftsList(prev => prev.filter(g => g.id !== id));
    addToast('Gift Removed', 'Gift has been removed from catalog.', 'info');
  };

  const handleWithdrawalDecision = (id: string, decision: 'approved' | 'rejected') => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: decision, processedAt: new Date().toISOString() } : w));
    addToast(
      decision === 'approved' ? 'Payout Approved' : 'Payout Rejected',
      `Withdrawal ${id} was marked as ${decision.toUpperCase()}. Funds dispatched.`,
      decision === 'approved' ? 'success' : 'warning'
    );
  };

  const handleSaveSettings = () => {
    addToast(
      'Settings Updated',
      `Commission set to ${platformCommissionPct}%. Referral reward set to ₦${referrerRewardNGN}/₦${refereeRewardNGN}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Platform Monetization & Commission Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-600" />
              <span>Platform Commission & Referral Rewards Controls</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure system-wide live streaming take rates and referral reward amounts
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Commission % */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Platform Live Gifting Take Rate (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="90"
                value={platformCommissionPct}
                onChange={e => setPlatformCommissionPct(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-base"
              />
              <span className="text-xs font-bold text-slate-500">
                (Creator receives {100 - platformCommissionPct}%)
              </span>
            </div>
          </div>

          {/* Referrer Reward NGN */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Referrer Reward per Signup (₦ NGN)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="50"
                value={referrerRewardNGN}
                onChange={e => setReferrerRewardNGN(Number(e.target.value))}
                className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-emerald-600 text-base"
              />
              <span className="text-xs text-slate-500">Credited to Inviter</span>
            </div>
          </div>

          {/* Referee Reward NGN */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              New User Welcome Bonus (₦ NGN)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="50"
                value={refereeRewardNGN}
                onChange={e => setRefereeRewardNGN(Number(e.target.value))}
                className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-blue-600 text-base"
              />
              <span className="text-xs text-slate-500">Credited to New User</span>
            </div>
          </div>
        </div>

        {/* Anti Fraud Switch */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-xs font-black text-emerald-900 block">
                Automatic Anti-Fraud & Sybil Protection
              </span>
              <span className="text-[11px] text-emerald-700">
                Enforce device fingerprinting, duplicate IP check, and phone eligibility before crediting referral wallet balances.
              </span>
            </div>
          </div>

          <input
            type="checkbox"
            checked={antiFraudEnabled}
            onChange={e => setAntiFraudEnabled(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Creator Withdrawal Requests Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Pending Creator Withdrawal Requests ({withdrawals.filter(w => w.status === 'pending').length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Review and approve payouts requested by live stream hosts
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {withdrawals.map(w => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {w.creatorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{w.creatorName}</span>
                    <span className="text-xs font-mono text-slate-400">({w.id})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Destination: <strong className="text-slate-700">{w.accountDetails?.bankName || w.paymentMethod}</strong> • {w.accountDetails?.accountNumber}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Requested: {new Date(w.requestedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right mr-2">
                  <span className="text-lg font-black text-slate-900 block">${w.amountUSD.toFixed(2)} USD</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    w.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {w.status}
                  </span>
                </div>

                {w.status === 'pending' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleWithdrawalDecision(w.id, 'approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleWithdrawalDecision(w.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Gifts Management */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-600" />
              <span>Live Streaming Virtual Gift Catalog ({giftsList.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Create, edit, delete, and set pricing for live animated gifts
            </p>
          </div>

          <button
            onClick={() => setShowAddGift(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create New Gift</span>
          </button>
        </div>

        {/* Gift Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {giftsList.map(g => (
            <div
              key={g.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-between text-center relative group"
            >
              <button
                onClick={() => handleDeleteGift(g.id)}
                className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Delete Gift"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <span className="text-4xl mb-1">{g.icon}</span>
              <span className="text-xs font-bold text-slate-900 truncate w-full">{g.name}</span>
              <span className="text-xs font-black text-amber-600 mt-1">🪙 {g.coins} Coins</span>
              <span className="text-[10px] text-slate-400 capitalize mt-0.5">{g.animation.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Gift Modal */}
      {showAddGift && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-600" />
                <span>Create Live Stream Gift</span>
              </h3>
              <button onClick={() => setShowAddGift(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateGift} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Gift Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shooting Star"
                  value={newGiftName}
                  onChange={e => setNewGiftName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Gift Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    value={newGiftIcon}
                    onChange={e => setNewGiftIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xl text-center"
                  />
                </div>

                <div>
                  <label className="block mb-1">Coin Price (🪙)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newGiftCoins}
                    onChange={e => setNewGiftCoins(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-amber-600 font-black text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Animation Type</label>
                <select
                  value={newGiftAnimation}
                  onChange={e => setNewGiftAnimation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                >
                  <option value="heart_burst">Heart Burst</option>
                  <option value="rose_shower">Rose Shower</option>
                  <option value="rocket_launch">Rocket Launch</option>
                  <option value="diamond_sparkle">Diamond Sparkle</option>
                  <option value="lion_roar">Lion Roar (Full Screen)</option>
                  <option value="crown_shine">Crown Shine</option>
                  <option value="super_galaxy">Super Galaxy</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
              >
                Publish Gift to Live Store
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
