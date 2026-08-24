import React, { useState, useMemo } from 'react';
import { 
  X, Wallet, ArrowDown, ArrowUp, QrCode, 
  ArrowDownLeft, ArrowUpRight, Search, ShieldCheck, 
  CreditCard, Building2, Smartphone, CheckCircle2, 
  Copy, Check, AlertCircle, ChevronRight, RefreshCw, 
  Sparkles, Send, Download, Filter, HelpCircle, Coins, Gift, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WalletTransaction } from '../types';

export const WalletModal: React.FC = () => {
  const { 
    currentUser, 
    showWalletModal, 
    setShowWalletModal, 
    walletBalance, 
    walletCurrency, 
    setWalletCurrency, 
    walletTransactions, 
    depositFunds, 
    withdrawFunds, 
    exchangeRateNGN,
    userCoins,
    setCurrentTab,
    addToast
  } = useApp();

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
  const [withdrawAccountName, setWithdrawAccountName] = useState<string>('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  // Calculated displayed balance based on active currency
  // 1 USD = 1,550 NGN
  const displayedBalance = useMemo(() => {
    const bal = walletBalance || 0;
    const rate = exchangeRateNGN || 1550;
    if (walletCurrency === 'NGN') {
      const ngnVal = bal * rate;
      return `₦${(ngnVal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [walletBalance, walletCurrency, exchangeRateNGN]);

  // Secondary sub-balance equivalent for reference
  const secondaryEquivalent = useMemo(() => {
    const bal = walletBalance || 0;
    const rate = exchangeRateNGN || 1550;
    if (walletCurrency === 'NGN') {
      return `≈ $${bal.toFixed(2)} USD`;
    }
    const ngnVal = bal * rate;
    return `≈ ₦${(ngnVal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} NGN`;
  }, [walletBalance, walletCurrency, exchangeRateNGN]);

  // Filtered transactions list
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

  // Copy wallet address / account ID
  const handleCopyWalletId = () => {
    const walletId = `NEMDAN-${currentUser?.id?.slice(0, 8)?.toUpperCase() || 'PAY-8921'}`;
    navigator.clipboard?.writeText(walletId);
    setCopiedWalletId(true);
    addToast('Copied to Clipboard', `Wallet Tag: ${walletId}`, 'success');
    setTimeout(() => setCopiedWalletId(false), 2000);
  };

  // Submit Deposit handler
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(depositAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Invalid Amount', 'Please enter a valid deposit amount greater than $0.', 'error');
      return;
    }

    setIsProcessingDeposit(true);
    // Simulate brief payment gateway authorization
    setTimeout(async () => {
      const channelLabel = 
        depositMethod === 'card' ? 'Debit/Credit Card' :
        depositMethod === 'bank' ? 'Direct Bank Wire' :
        depositMethod === 'ussd' ? 'USSD / Mobile Money' : 'Apple / Google Pay';

      const success = await depositFunds(parsedAmount, channelLabel, `Instant Wallet Top-up (${channelLabel})`);
      setIsProcessingDeposit(false);
      if (success) {
        setActiveSubModal('none');
        setDepositAmount('50');
      }
    }, 600);
  };

  // Submit Withdrawal handler
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

  if (!showWalletModal) return null;

  return (
    <div 
      id="wallet-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowWalletModal(false);
          setActiveSubModal('none');
        }
      }}
    >
      <div 
        id="wallet-modal-container"
        className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        
        {/* ========================================================================= */}
        {/* 1. WALLET MODAL HEADER & GREETING (Requirement 2)                          */}
        {/* ========================================================================= */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Welcome to</p>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                NEMDAN Pay <ShieldCheck className="w-4 h-4 text-blue-400" />
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* QR Code Scanner / Share Trigger */}
            <button
              id="wallet-qr-btn"
              onClick={() => setActiveSubModal('qr')}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Show QR Code / Receive Tag"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Close Modal Button */}
            <button
              id="wallet-close-btn"
              onClick={() => {
                setShowWalletModal(false);
                setActiveSubModal('none');
              }}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Close Wallet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-4 flex-1">
          
          {/* ========================================================================= */}
          {/* 2. MAIN WALLET BALANCE CARD (Requirement 2)                               */}
          {/* ========================================================================= */}
          <div 
            id="wallet-main-balance-card"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-5 sm:p-6 border border-blue-500/30 shadow-xl"
          >
            {/* Ambient visual overlay accents */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Label & Currency Switcher Toggle */}
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2 text-blue-200">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Available Balance</span>
              </div>

              {/* 
                CURRENCY TOGGLE (USD / NGN SWITCH):
                - Allows switching between US Dollars ($) and Nigerian Naira (₦).
                - Converts balance and transactions dynamically using live exchange rate.
              */}
              <div 
                id="wallet-currency-switcher"
                className="bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 flex items-center gap-0.5"
              >
                <button
                  type="button"
                  onClick={() => setWalletCurrency('USD')}
                  className={`px-3 py-1 text-xs font-black rounded-full transition-all cursor-pointer ${
                    walletCurrency === 'USD'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletCurrency('NGN')}
                  className={`px-3 py-1 text-xs font-black rounded-full transition-all cursor-pointer ${
                    walletCurrency === 'NGN'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NGN (₦)
                </button>
              </div>
            </div>

            {/* Prominent Balance Display (e.g. "$0" or dynamic total) */}
            <div className="mt-4 mb-5 relative z-10">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                {displayedBalance}
              </h1>
              <p className="text-xs text-blue-200/80 font-medium mt-1">
                {secondaryEquivalent} • Real-time instant settlement
              </p>
            </div>

            {/* 
              QUICK ACTION BUTTONS (Deposit & Withdraw):
              - Deposit: Downward arrow with high-contrast button styling.
              - Withdraw: Upward arrow with transparent border styling.
            */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button
                id="wallet-deposit-action-btn"
                onClick={() => setActiveSubModal('deposit')}
                className="py-3 px-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Deposit</span>
              </button>

              <button
                id="wallet-withdraw-action-btn"
                onClick={() => setActiveSubModal('withdraw')}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Withdraw</span>
              </button>
            </div>

            {/* Card Footer Tag & Quick Copy */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200/70 relative z-10">
              <span>Tag: <strong className="text-white">@{currentUser?.username || 'user'}</strong></span>
              <button 
                onClick={handleCopyWalletId}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {copiedWalletId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWalletId ? 'Copied' : 'Copy Pay ID'}</span>
              </button>
            </div>
          </div>

          {/* Quick Gifting Coins & Referral Bonus Hub */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Coins Balance Box */}
            <div 
              onClick={() => {
                setShowWalletModal(false);
                setCurrentTab('wallet');
              }}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block leading-none">Coins Wallet</span>
                  <span className="text-xs font-black text-white">{userCoins.toLocaleString()} Coins</span>
                </div>
              </div>
              <span className="text-[10px] text-blue-400 font-bold">Top-up →</span>
            </div>

            {/* Referral Rewards Box */}
            <div 
              onClick={() => {
                setShowWalletModal(false);
                setCurrentTab('wallet');
              }}
              className="p-3 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block leading-none">Refer & Earn</span>
                  <span className="text-xs font-black text-white">₦500 / Signup</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-300 font-bold">Share →</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. ACTION PROMPT BANNER CARD (Requirement 3)                              */}
          {/* ========================================================================= */}
          {walletBalance === 0 && (
            <div 
              id="wallet-onboarding-prompt-card"
              className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex items-start justify-between gap-3 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Just one more thing...</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Deposit funds now to tip creators on Reels, buy marketplace listings, or send instant money to friends.
                  </p>
                </div>
              </div>

              <button
                id="prompt-deposit-now-btn"
                onClick={() => setActiveSubModal('deposit')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0 shadow-md"
              >
                Deposit now
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. RECENT ACTIVITY FEED (Requirement 3)                                   */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Recent Activity
              </h3>

              {/* Activity Filter Chips */}
              <div className="flex items-center gap-1 text-[11px]">
                {(['all', 'deposit', 'withdrawal', 'received'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTransactionFilter(f)}
                    className={`px-2.5 py-1 rounded-full font-bold capitalize transition-all cursor-pointer ${
                      transactionFilter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input for Transactions */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions, references, or tags..."
                value={searchTxQuery}
                onChange={(e) => setSearchTxQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
                  <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No transactions found</p>
                  <p className="text-[11px] text-slate-500 mt-1">Make your first deposit to get started</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isNegative = tx.amount < 0;
                  const absAmount = Math.abs(tx.amount);
                  
                  // Converted formatted value
                  const formattedValue = walletCurrency === 'NGN'
                    ? `₦${((absAmount || 0) * (exchangeRateNGN || 1550)).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                    : `$${(absAmount || 0).toFixed(2)}`;

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-3 transition-colors group"
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : tx.type === 'received'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {tx.type === 'deposit' && <ArrowDown className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'received' && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'withdrawal' && <ArrowUp className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'sent' && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                          {tx.type === 'tip' && <Sparkles className="w-5 h-5 stroke-[2.5]" />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {tx.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {tx.description || tx.relativeTime}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ref: {tx.reference}
                          </span>
                        </div>
                      </div>

                      {/* Right: Relative Time & Color-coded Amount */}
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-black ${
                          isNegative 
                            ? 'text-rose-400' 
                            : 'text-emerald-400'
                        }`}>
                          {isNegative ? `-${formattedValue}` : `+${formattedValue}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {tx.relativeTime}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            PCI-DSS 256-bit Encrypted
          </span>
          <button 
            onClick={() => addToast('NEMDAN Support', 'Contacting 24/7 wallet concierge...', 'info')}
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Need Help?
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL 1: DEPOSIT FUNDS FORM                                            */}
      {/* ========================================================================= */}
      {activeSubModal === 'deposit' && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setActiveSubModal('none')}
        >
          <div className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ArrowDown className="w-4 h-4" />
                </div>
                Deposit Funds
              </h3>
              <button 
                onClick={() => setActiveSubModal('none')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount ({walletCurrency})
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
                {/* Quick amount chips */}
                <div className="flex items-center gap-2 mt-2">
                  {['10', '25', '50', '100', '250'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 hover:text-white cursor-pointer"
                    >
                      +${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Channel Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('card')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      depositMethod === 'card'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Card Payment</p>
                      <p className="text-[10px] text-slate-400">Visa, Mastercard</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('bank')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      depositMethod === 'bank'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Bank Wire</p>
                      <p className="text-[10px] text-slate-400">Instant ACH / Wire</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('ussd')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      depositMethod === 'ussd'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">USSD / Mobile</p>
                      <p className="text-[10px] text-slate-400">MoMo, USSD code</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      depositMethod === 'apple_pay'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Digital Pay</p>
                      <p className="text-[10px] text-slate-400">Apple / Google Pay</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isProcessingDeposit}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessingDeposit ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Deposit...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Fund ${depositAmount || '0'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 2: WITHDRAW FUNDS FORM                                          */}
      {/* ========================================================================= */}
      {activeSubModal === 'withdraw' && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setActiveSubModal('none')}
        >
          <div className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <ArrowUp className="w-4 h-4" />
                </div>
                Withdraw to Bank
              </h3>
              <button 
                onClick={() => setActiveSubModal('none')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Available balance indicator */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">Available Balance:</span>
                <span className="font-bold text-emerald-400">${walletBalance.toFixed(2)} USD</span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount to Withdraw ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    max={walletBalance}
                    step="any"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xl font-black text-white outline-hidden focus:border-blue-500"
                    placeholder="25.00"
                  />
                </div>
              </div>

              {/* Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Destination Bank
                </label>
                <select
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-white outline-hidden"
                >
                  <option value="Access Bank">Access Bank Plc</option>
                  <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                  <option value="Zenith Bank">Zenith Bank Plc</option>
                  <option value="Chase Bank">Chase Bank USA (Wire)</option>
                  <option value="Wells Fargo">Wells Fargo (ACH)</option>
                  <option value="Kuda Bank">Kuda Microfinance Bank</option>
                  <option value="OPay">OPay Wallet</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccountNumber}
                  onChange={(e) => setWithdrawAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden"
                  placeholder="0123456789"
                />
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isProcessingWithdraw || walletBalance <= 0}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessingWithdraw ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Withdraw ${withdrawAmount || '0'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 3: QR CODE SCAN / RECEIVE TAG                                   */}
      {/* ========================================================================= */}
      {activeSubModal === 'qr' && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={(e) => e.target === e.currentTarget && setActiveSubModal('none')}
        >
          <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl border border-slate-700 p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                Scan to Pay & Receive
              </h3>
              <button 
                onClick={() => setActiveSubModal('none')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Visual QR Code Card */}
            <div className="p-5 bg-white rounded-2xl inline-block shadow-xl mx-auto border-4 border-blue-500">
              <div className="w-44 h-44 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                {/* SVG QR Code Pattern */}
                <div className="grid grid-cols-6 gap-1 w-full h-full p-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                          ? 'bg-blue-400' 
                          : 'bg-white/90'
                      }`} 
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white">@{currentUser?.username || 'user'}</p>
              <p className="text-xs text-slate-400">Scan using any NEMDAN camera or banking app</p>
            </div>

            <button
              onClick={handleCopyWalletId}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedWalletId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedWalletId ? 'Copied Pay Tag!' : 'Copy Personal Pay Tag'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
