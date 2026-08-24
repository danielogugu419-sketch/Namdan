import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Plus, Coins, Zap, Flame, Crown, Heart, Award, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VirtualGift } from '../../types';

interface GiftStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  hostName: string;
  onOpenRecharge: () => void;
  onGiftSent?: (gift: VirtualGift, comboCount: number) => void;
}

const COMBO_PRESETS = [1, 5, 10, 25, 99];

export const GiftStoreModal: React.FC<GiftStoreModalProps> = ({
  isOpen,
  onClose,
  streamId,
  hostName,
  onOpenRecharge,
  onGiftSent
}) => {
  const { virtualGifts, userCoins, sendLiveGift, addToast } = useApp() as any;
  
  const [selectedGiftId, setSelectedGiftId] = useState<string>('g_rose');
  const [selectedCombo, setSelectedCombo] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'classic' | 'special' | 'luxury'>('all');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [comboPulse, setComboPulse] = useState<boolean>(false);
  
  // Double-tap tracking & feedback states
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{
    giftId: string;
    combo: number;
    icon: string;
    x?: number;
    y?: number;
  } | null>(null);
  const [rapidComboCount, setRapidComboCount] = useState<number>(1);
  const lastTapTimeRef = useRef<{ [key: string]: number }>({});
  const tapTimeoutRef = useRef<any>(null);
  const comboResetTimerRef = useRef<any>(null);

  if (!isOpen) return null;

  const selectedGift = virtualGifts.find((g: VirtualGift) => g.id === selectedGiftId) || virtualGifts[0];
  const giftPrice = selectedGift ? (selectedGift.coinPrice ?? selectedGift.coins ?? 1) : 0;
  const totalCost = giftPrice * selectedCombo;
  const hasEnoughCoins = userCoins >= totalCost;

  const filteredGifts = virtualGifts.filter((g: VirtualGift) => {
    const p = g.coinPrice ?? g.coins ?? 1;
    if (categoryFilter === 'classic') return g.category === 'classic' || p < 20;
    if (categoryFilter === 'special') return g.category === 'special' || (p >= 20 && p < 500);
    if (categoryFilter === 'luxury') return g.category === 'luxury' || g.category === 'exclusive' || p >= 500;
    return true;
  });

  // Core gift sending function with double-tap combo support
  const executeSendGift = async (targetGift: VirtualGift, combo: number = 1, isDoubleTap: boolean = false) => {
    const cost = (targetGift.coinPrice ?? targetGift.coins ?? 1) * combo;
    
    if (userCoins < cost) {
      addToast(
        'Not Enough Coins', 
        `You need ${cost.toLocaleString()} Coins to send ${combo > 1 ? `${combo}x ` : ''}${targetGift.name}. Recharge now!`, 
        'warning'
      );
      onOpenRecharge();
      return false;
    }

    setIsSending(true);
    setComboPulse(true);
    setTimeout(() => setComboPulse(false), 300);

    // Double tap combo feedback
    if (isDoubleTap) {
      const nextCombo = rapidComboCount + 1;
      setRapidComboCount(nextCombo);
      setDoubleTapFeedback({
        giftId: targetGift.id,
        combo: nextCombo,
        icon: targetGift.icon
      });

      if (comboResetTimerRef.current) clearTimeout(comboResetTimerRef.current);
      comboResetTimerRef.current = setTimeout(() => {
        setRapidComboCount(1);
        setDoubleTapFeedback(null);
      }, 2500);
    }

    try {
      const success = await sendLiveGift(streamId, targetGift.id, combo);
      if (success) {
        if (onGiftSent) onGiftSent(targetGift, combo);
        if (combo >= 25 && !isDoubleTap) {
          onClose();
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to send gift:', err);
    } finally {
      setIsSending(false);
    }
    return false;
  };

  // Double tap handler on individual gift items
  const handleGiftTap = (gift: VirtualGift, e?: React.MouseEvent) => {
    const now = Date.now();
    const lastTap = lastTapTimeRef.current[gift.id] || 0;
    const timeSinceLastTap = now - lastTap;

    // Set as selected gift
    setSelectedGiftId(gift.id);
    lastTapTimeRef.current[gift.id] = now;

    // Detect Double Tap (within 350ms)
    if (timeSinceLastTap > 0 && timeSinceLastTap < 350) {
      // Clear last tap to prevent triple trigger as two doubles
      lastTapTimeRef.current[gift.id] = 0;
      executeSendGift(gift, selectedCombo, true);
    }
  };

  const handleSend = () => {
    if (!selectedGift) return;
    executeSendGift(selectedGift, selectedCombo, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-white relative">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎁</span>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>Gift Store</span>
                <span className="text-xs font-normal text-slate-400">for {hostName}</span>
              </h3>
            </div>
          </div>

          {/* User Coin Balance Badge & Recharge Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black shadow-inner">
              <span>🪙</span>
              <span>{userCoins.toLocaleString()}</span>
            </div>

            <button
              onClick={onOpenRecharge}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Recharge</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Double-Tap Pro Tip Banner */}
        <div className="px-4 py-1.5 bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-slate-950 border-b border-white/10 flex items-center justify-between text-[11px] text-amber-200">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="animate-bounce">⚡</span>
            <span>Tip: <strong className="text-white font-extrabold">Double-tap any gift</strong> to send immediately!</span>
          </div>
          {rapidComboCount > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-pulse">
              Combo ×{rapidComboCount} 🔥
            </span>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto scrollbar-none">
          {(['all', 'classic', 'special', 'luxury'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat === 'all' ? '✨ All Gifts' : cat === 'luxury' ? '👑 Legendary' : cat === 'special' ? '💎 Super Gifts' : '🌹 Popular'}
            </button>
          ))}
        </div>

        {/* Gifts Grid (With Double-Tap Support) */}
        <div className="p-4 grid grid-cols-4 sm:grid-cols-4 gap-2.5 overflow-y-auto max-h-64 sm:max-h-72">
          {filteredGifts.map((gift: VirtualGift) => {
            const isSelected = selectedGiftId === gift.id;
            const isLegendary = (gift.coins || gift.coinPrice || 0) >= 500;
            const isFeedbackTarget = doubleTapFeedback?.giftId === gift.id;

            return (
              <div
                key={gift.id}
                onClick={(e) => handleGiftTap(gift, e)}
                onDoubleClick={() => executeSendGift(gift, selectedCombo, true)}
                className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none active:scale-95 group ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/30 shadow-lg scale-102'
                    : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-800/40'
                } ${isFeedbackTarget ? 'animate-bounce ring-4 ring-rose-500/60' : ''}`}
              >
                {/* Visual Animation Icon */}
                <div className={`text-3xl my-1 group-hover:scale-125 transition-transform ${
                  isSelected ? 'animate-pulse' : ''
                }`}>
                  {gift.icon}
                </div>

                <div className="w-full">
                  <div className="text-[11px] font-bold text-white truncate w-full">
                    {gift.name}
                  </div>
                  <div className="text-[10px] font-extrabold text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
                    <span>🪙</span>
                    <span>{gift.coinPrice ?? gift.coins ?? 1}</span>
                  </div>
                </div>

                {/* Double-Tap Immediate Sent Ripple Bubble */}
                {isFeedbackTarget && doubleTapFeedback && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-[9px] shadow-lg animate-in zoom-in-50 whitespace-nowrap z-20">
                    Sent ×{doubleTapFeedback.combo}!
                  </div>
                )}

                {isLegendary && (
                  <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[8px] uppercase">
                    LEGEND
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer / Combo & Send Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          
          {/* Combo Multiplier Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400">Combo Multiplier:</span>
            <div className="flex items-center gap-1.5">
              {COMBO_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setSelectedCombo(preset)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCombo === preset
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedGift?.icon}</span>
              <div>
                <div className="text-xs font-black text-white">
                  {selectedGift?.name} {selectedCombo > 1 ? `x${selectedCombo}` : ''}
                </div>
                <div className="text-[11px] font-extrabold text-amber-400">
                  Total: 🪙 {totalCost.toLocaleString()} Coins
                </div>
              </div>
            </div>

            {hasEnoughCoins ? (
              <button
                onClick={handleSend}
                disabled={isSending}
                className={`flex-1 max-w-[180px] py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-black text-xs shadow-xl shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  comboPulse ? 'scale-105' : ''
                }`}
              >
                <Zap className="w-4 h-4 fill-current animate-pulse" />
                <span>{isSending ? 'Sending...' : 'Send Gift'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenRecharge}
                className="flex-1 max-w-[180px] py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Coins className="w-4 h-4" />
                <span>Get Coins ({totalCost - userCoins} needed)</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
