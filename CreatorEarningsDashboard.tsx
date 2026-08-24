import React, { useState } from 'react';
import { 
  DollarSign, Coins, Gift, ArrowUpRight, Clock, CheckCircle2, 
  XCircle, AlertCircle, Building2, CreditCard, ShieldCheck, Sparkles, Send 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WithdrawalRequest } from '../../types';

export const CreatorEarningsDashboard: React.FC = () => {
  const { currentUser, creatorEarnings, requestCreatorWithdrawal, addToast } = useApp();
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState<string>('50.00');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paypal' | 'crypto'>('bank_transfer');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('Access Bank / GTBank');
  const [accountName, setAccountName] = useState(currentUser?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withdrawableBalance = creatorEarnings?.withdrawableBalanceUSD || 0;
  const totalCoinsReceived = creatorEarnings?.totalCoinsReceived || 0;
  const totalGiftsReceived = creatorEarnings?.totalGiftsReceived || 0;
  const totalEarnedUSD = creatorEarnings?.totalEarnedUSD || 0;

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(withdrawAmountUSD);
    if (isNaN(parsed) || parsed < 10) {
      addToast('Minimum Payout', 'The minimum creator withdrawal amount is $10.00 USD.', 'warning');
      return;
    }
    if (parsed > withdrawableBalance) {
      addToast('Insufficient Balance', `You can only withdraw up to $${withdrawableBalance.toFixed(2)}.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await requestCreatorWithdrawal(parsed, paymentMethod, {
        accountName,
        accountNumber,
        bankName
      });
      if (success) {
        setShowWithdrawModal(false);
        setAccountNumber('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Creator Earnings Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 text-white p-6 sm:p-8 border border-purple-500/30 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-black uppercase tracking-wider">
              <span>👑</span>
              <span>Creator Monetization Central</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Live Stream Gifting Earnings
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-lg">
              Virtual gifts sent during your live streams are automatically converted to cash earnings after platform commission.
            </p>
          </div>

          {/* Withdrawable Balance & Action */}
          <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center md:text-right space-y-2 shrink-0">
            <span className="text-xs text-purple-300 uppercase font-bold tracking-wider block">Withdrawable Balance</span>
            <div className="text-3xl sm:text-4xl font-black text-white">
              ${withdrawableBalance.toFixed(2)} USD
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Total Stream Coins</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">
            🪙 {totalCoinsReceived.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Total coins received from viewers</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Virtual Gifts Received</span>
            <Gift className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            🎁 {totalGiftsReceived.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Roses, Diamonds, Lions & Crowns</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Lifetime Creator Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalEarnedUSD.toFixed(2)} USD
          </div>
          <p className="text-[11px] text-slate-400">70% net creator revenue share</p>
        </div>

      </div>

      {/* Withdrawal History & Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
          <span>Payout & Withdrawal History</span>
          <span className="text-xs text-slate-400 font-medium">Admin Approval System</span>
        </h3>

        <div className="space-y-3">
          {(!creatorEarnings?.withdrawalHistory || creatorEarnings.withdrawalHistory.length === 0) ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
              No withdrawal requests submitted yet.
            </div>
          ) : (
            creatorEarnings.withdrawalHistory.map((item: WithdrawalRequest) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'approved' || item.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : item.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.status === 'approved' || item.status === 'paid' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : item.status === 'rejected' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5 animate-spin" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Payout to {item.accountDetails?.bankName || item.paymentMethod}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Requested {new Date(item.requestedAt).toLocaleDateString()} • {item.accountDetails?.accountNumber || '••••4019'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900 dark:text-white block">
                    ${item.amountUSD.toFixed(2)} USD
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    item.status === 'approved' || item.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : item.status === 'rejected'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payout Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                <span>Request Creator Payout</span>
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                  Withdrawal Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="10"
                  max={withdrawableBalance}
                  step="any"
                  required
                  value={withdrawAmountUSD}
                  onChange={e => setWithdrawAmountUSD(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available: ${withdrawableBalance.toFixed(2)} USD (Min: $10.00)
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                  Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {(['bank_transfer', 'paypal', 'crypto'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === method
                          ? 'border-emerald-500 bg-emerald-500/20 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {method === 'bank_transfer' ? 'Bank Wire' : method === 'paypal' ? 'PayPal' : 'USDT Crypto'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                  Destination Account / Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account Number or PayPal Email"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Withdrawals are reviewed and approved by platform administrators within 24 hours.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Withdrawal Request'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
