import React, { useState, useMemo } from 'react';
import { 
  Wallet, ArrowDown, ArrowUp, QrCode, 
  ArrowDownLeft, ArrowUpRight, Search, ShieldCheck, 
  CreditCard, Building2, Smartphone, CheckCircle2, 
  Copy, Check, AlertCircle, ChevronRight, RefreshCw, 
  Sparkles, Send, Download, Filter, HelpCircle, X, Coins, Gift, Award, BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WalletTransaction } from '../types';
import { ReferralAnalyticsSection } from './wallet/ReferralAnalyticsSection';
import { CreatorEarningsDashboard } from './wallet/CreatorEarningsDashboard';
import { VirtualCoinsSection } from './wallet/VirtualCoinsSection';

export const WalletView: React.FC = () => {
  const { 
    currentUser, 
    walletBalance, 
    walletCurrency, 
    setWalletCurrency, 
    walletTransactions, 
    depositFunds, 
    withdrawFunds, 
    exchangeRateNGN,
    userCoins,
    addToast
  } = useApp();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'cash' | 'coins' | 'creator' | 'referrals'>('cash');

  // Sub-modal states
  const [activeSubModal, setActiveSubModal] = useState<'none' | 'deposit' | 'withdraw' | 'qr'>('none');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'received'>('all');
  const [searchTxQuery, setSearchTxQuery] = useState('');
  const [copiedWalletId, setCopiedWalletId] = useState(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [depositMethod, setDepositMethod] = useState<'card' | 'bank' | 'ussd' | 'apple_pay'>('card');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('25');
  const [withdrawBank, setWithdrawBank] = useState<string>('Access Bank');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState<string>('0123456789');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  // Formatted main display balance
  const displayedBalance = useMemo(() => {
    if (walletCurrency === 'NGN') {
      const ngnVal = walletBalance * exchangeRateNGN;
      return `₦${ngnVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [walletBalance, walletCurrency, exchangeRateNGN]);

  // Secondary sub-balance equivalent
  const secondaryEquivalent = useMemo(() => {
    if (walletCurrency === 'NGN') {
      return `≈ $${walletBalance.toFixed(2)} USD`;
    }
    const ngnVal = walletBalance * exchangeRateNGN;
    return `≈ ₦${ngnVal.toLocaleString('en-US', { maximumFractionDigits: 0 })} NGN`;
  }, [walletBalance, walletCurrency, exchangeRateNGN]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return walletTransactions.filter((tx) => {
      const matchesFilter = transactionFilter === 'all' || tx.type === transactionFilter;
      const matchesQuery = 
        tx.title.toLowerCase().includes(searchTxQuery.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTxQuery.toLowerCase())) ||
        (tx.reference && tx.reference.toLowerCase().includes(searchTxQuery.toLowerCase()));
      return matchesFilter && matchesQuery;
    });
  }, [walletTransactions, transactionFilter, searchTxQuery]);

  const handleCopyWalletId = () => {
    const walletId = `NEMDAN-${currentUser?.id?.slice(0, 8)?.toUpperCase() || 'PAY-8921'}`;
    navigator.clipboard?.writeText(walletId);
    setCopiedWalletId(true);
    addToast('Copied to Clipboard', `Wallet Tag: ${walletId}`, 'success');
    setTimeout(() => setCopiedWalletId(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(depositAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Invalid Amount', 'Please enter a valid deposit amount.', 'error');
      return;
    }

    setIsProcessingDeposit(true);
    setTimeout(async () => {
      const channelLabel = 
        depositMethod === 'card' ? 'Debit/Credit Card' :
        depositMethod === 'bank' ? 'Direct Bank Wire' :
        depositMethod === 'ussd' ? 'USSD / Mobile Money' : 'Digital Wallet';

      const success = await depositFunds(parsedAmount, channelLabel, `Instant Wallet Top-up (${channelLabel})`);
      setIsProcessingDeposit(false);
      if (success) {
        setActiveSubModal('none');
        setDepositAmount('50');
      }
    }, 600);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Invalid Amount', 'Please enter a valid withdrawal amount.', 'error');
      return;
    }

    if (parsedAmount > walletBalance) {
      addToast('Insufficient Funds', `You only have $${walletBalance.toFixed(2)} available.`, 'error');
      return;
    }

    setIsProcessingWithdraw(true);
    setTimeout(async () => {
      const destination = `${withdrawBank} (••••${withdrawAccountNumber.slice(-4) || '4019'})`;
      const success = await withdrawFunds(parsedAmount, destination, `Payout to ${destination}`);
      setIsProcessingWithdraw(false);
      if (success) {
        setActiveSubModal('none');
        setWithdrawAmount('25');
      }
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 space-y-6 animate-in fade-in duration-150">
      
      {/* Navigation Pills Bar for Wallet Modules */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('cash')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cash'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4 text-blue-500" />
          <span>Cash Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('coins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'coins'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Virtual Coins ({userCoins.toLocaleString()})</span>
        </button>

        <button
          onClick={() => setActiveTab('creator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'creator'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>👑</span>
          <span>Creator Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'referrals'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Gift className="w-4 h-4 text-emerald-300" />
          <span>Referral & Analytics</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'referrals' && <ReferralAnalyticsSection />}
      {activeTab === 'creator' && <CreatorEarningsDashboard />}
      {activeTab === 'coins' && <VirtualCoinsSection />}

      {activeTab === 'cash' && (
        <>
          {/* Main Cash Wallet Card */}
          <div 
            id="wallet-view-card"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 border border-blue-500/30 shadow-2xl"
          >
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser?.name || 'User'}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                />
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                    <span>Welcome to NEMDAN Pay</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </h2>
                  <p className="text-xs text-blue-200/80">
                    Unified Multi-Currency Wallet & Escrow
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubModal('qr')}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-colors cursor-pointer border border-white/20 backdrop-blur-md"
                title="View Wallet QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200/80 mb-1">
                  Total Available Balance
                </p>
                <div className="text-4xl sm:text-5xl font-black tracking-tight">
                  {displayedBalance}
                </div>
                <p className="text-xs text-blue-200/90 font-semibold mt-1">
                  {secondaryEquivalent}
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
                <button
                  type="button"
                  onClick={() => setWalletCurrency('USD')}
                  className={`px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
                    walletCurrency === 'USD'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletCurrency('NGN')}
                  className={`px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
                    walletCurrency === 'NGN'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NGN (₦)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
              <button
                id="wallet-view-deposit-btn"
                onClick={() => setActiveSubModal('deposit')}
                className="py-4 px-5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Deposit</span>
              </button>

              <button
                id="wallet-view-withdraw-btn"
                onClick={() => setActiveSubModal('withdraw')}
                className="py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Withdraw</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/70 relative z-10">
              <span>Account Pay Tag: <strong className="text-white">@{currentUser?.username || 'user'}</strong></span>
              <button 
                onClick={handleCopyWalletId}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {copiedWalletId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWalletId ? 'Tag Copied' : 'Copy Pay ID'}</span>
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Recent Activity Feed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time ledger of incoming, outgoing and referral rewards
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'deposit', 'withdrawal', 'received'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTransactionFilter(f)}
                    className={`px-3 py-1.5 rounded-full font-bold capitalize transition-all cursor-pointer ${
                      transactionFilter === f
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by transaction type, recipient, or reference ID..."
                value={searchTxQuery}
                onChange={(e) => setSearchTxQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Wallet className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No activity to show</p>
                  <p className="text-xs text-slate-500 mt-1">Transactions will appear here automatically</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isNegative = tx.amount < 0;
                  const absAmount = Math.abs(tx.amount);
                  
                  const formattedValue = walletCurrency === 'NGN'
                    ? `₦${(absAmount * exchangeRateNGN).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    : `$${absAmount.toFixed(2)}`;

                  return (
                    <div
                      key={tx.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : tx.type === 'received'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {tx.type === 'deposit' && <ArrowDown className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'received' && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'withdrawal' && <ArrowUp className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'sent' && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'tip' && <Sparkles className="w-5 h-5 stroke-[2.5]" />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {tx.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {tx.description || tx.relativeTime}
                          </p>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            Ref: {tx.reference} • {tx.channel || 'Standard'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-base font-black ${
                          isNegative 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {isNegative ? `-${formattedValue}` : `+${formattedValue}`}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                          {tx.relativeTime}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Sub-modals for Deposit, Withdraw, QR */}
      {activeSubModal === 'deposit' && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setActiveSubModal('none')}
        >
          <div className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDown className="w-5 h-5 text-blue-400" />
                Deposit Funds to NEMDAN Wallet
              </h3>
              <button 
                onClick={() => setActiveSubModal('none')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Deposit Amount ({walletCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    {walletCurrency === 'USD' ? '$' : '₦'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xl font-black text-white outline-hidden focus:border-blue-500"
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('card')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                      depositMethod === 'card'
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>Card (Debit/Credit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('bank')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                      depositMethod === 'bank'
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl text-slate-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted with 256-Bit SSL Protection.</span>
              </div>

              <button
                type="submit"
                disabled={isProcessingDeposit}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingDeposit ? 'Processing...' : `Confirm Deposit (${walletCurrency === 'USD' ? `$${depositAmount}` : `₦${depositAmount}`})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSubModal === 'withdraw' && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setActiveSubModal('none')}
        >
          <div className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-indigo-400" />
                Withdraw from NEMDAN Wallet
              </h3>
              <button 
                onClick={() => setActiveSubModal('none')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Withdrawal Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  max={walletBalance}
                  step="any"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xl font-black text-white outline-hidden focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available: ${walletBalance.toFixed(2)} USD
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bank / Payout Destination
                </label>
                <input
                  type="text"
                  required
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Number / ID
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccountNumber}
                  onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingWithdraw}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingWithdraw ? 'Processing...' : `Confirm Withdrawal ($${withdrawAmount})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSubModal === 'qr' && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setActiveSubModal('none')}
        >
          <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Your NEMDAN Pay Tag QR</h3>
              <button 
                onClick={() => setActiveSubModal('none')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl inline-block mx-auto shadow-inner">
              <div className="w-44 h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4">
                <QrCode className="w-24 h-24 text-blue-400" />
                <span className="text-[10px] font-mono mt-2 text-slate-300">@{currentUser?.username || 'user'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Scan this QR with any NEMDAN scanner to send instant zero-fee payments.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
