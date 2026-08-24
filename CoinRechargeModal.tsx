import React, { useState } from 'react';
import { X, Coins, ShieldCheck, Check, CreditCard, Smartphone, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoinPackage } from '../../types';

interface CoinRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinRechargeModal: React.FC<CoinRechargeModalProps> = ({ isOpen, onClose }) => {
  const { userCoins, coinPackages, buyCoins, addToast } = useApp();
  
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_500');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customCoins, setCustomCoins] = useState<number>(2000);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'crypto' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPackage = coinPackages.find(p => p.id === selectedPackageId);
  const calculatedPrice = isCustom 
    ? (customCoins * 0.0095).toFixed(2)
    : currentPackage?.priceUSD.toFixed(2) || '4.99';

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      let success = false;
      if (isCustom) {
        success = await buyCoins(undefined, customCoins, paymentMethod);
      } else {
        success = await buyCoins(selectedPackageId, undefined, paymentMethod);
      }
      if (success) {
        onClose();
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Payment failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xl shadow-xs">
              🪙
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Recharge Virtual Coins</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  Instant Credit
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Balance: <span className="font-bold text-amber-600 dark:text-amber-400">{userCoins.toLocaleString()} Coins</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Coin Packages Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Select Coin Package</span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Special Bonus Included
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {coinPackages.map(pkg => {
                const isSelected = !isCustom && selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedPackageId(pkg.id);
                    }}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-md ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800/60 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        {pkg.badge}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {pkg.coins.toLocaleString()} Coins
                        </div>
                        {pkg.bonusCoins && pkg.bonusCoins > 0 ? (
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            +{pkg.bonusCoins} Bonus Free
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        ${pkg.priceUSD.toFixed(2)}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Amount Button */}
            <div
              onClick={() => setIsCustom(true)}
              className={`mt-2 p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                isCustom
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">✨</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Custom Coin Amount
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {isCustom ? 'Active' : 'Choose exact coins'}
              </span>
            </div>

            {isCustom && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Coins to purchase:</span>
                  <span className="text-amber-500 font-extrabold">{customCoins.toLocaleString()} Coins</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={customCoins}
                  onChange={e => setCustomCoins(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>100 coins ($0.95)</span>
                  <span>5,000 coins ($47.50)</span>
                  <span>10,000 coins ($95.00)</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === 'apple_pay'
                    ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Apple / Google Pay</span>
              </button>
            </div>
          </div>

          {/* Secure Trust Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>256-Bit SSL Encrypted & Instant Wallet Recharge.</span>
          </div>

        </div>

        {/* Modal Footer / Checkout Action */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Price</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              ${calculatedPrice} USD
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex-1 max-w-[200px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Pay & Add Coins</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
