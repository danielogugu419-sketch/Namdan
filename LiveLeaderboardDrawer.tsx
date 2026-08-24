import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, X, Sparkles, Flame, Users } from 'lucide-react';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';

interface LiveLeaderboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  totalCoinsReceived: number;
}

interface LeaderboardUser {
  userId: string;
  userName: string;
  userAvatar: string;
  totalCoins: number;
  giftCount: number;
}

export const LiveLeaderboardDrawer: React.FC<LiveLeaderboardDrawerProps> = ({
  isOpen,
  onClose,
  streamId,
  totalCoinsReceived
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !streamId) return;

    setLoading(true);
    api.getStreamGiftLeaderboard(streamId)
      .then(data => {
        setLeaderboard(data || []);
      })
      .catch(err => console.error('Failed to load leaderboard:', err))
      .finally(() => setLoading(false));

    const socket = getSocket();
    const handleGiftReceived = () => {
      // Re-fetch leaderboard on new gifts
      api.getStreamGiftLeaderboard(streamId).then(data => {
        setLeaderboard(data || []);
      }).catch(() => {});
    };

    socket.on('live_gift_received', handleGiftReceived);
    return () => {
      socket.off('live_gift_received', handleGiftReceived);
    };
  }, [isOpen, streamId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border-l sm:border border-slate-800 h-full sm:h-auto sm:max-h-[85vh] sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>Top Gifters Leaderboard</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Stream Total: <span className="text-amber-400 font-bold">🪙 {totalCoinsReceived.toLocaleString()} Coins</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Podium / Top 3 Highlight */}
        {leaderboard.length >= 3 && (
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-end justify-center gap-3 pt-6">
            
            {/* Rank 2 - Silver */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={leaderboard[1].userAvatar}
                  alt={leaderboard[1].userName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  2
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-200 mt-1 truncate max-w-[80px]">
                {leaderboard[1].userName}
              </span>
              <span className="text-[10px] font-black text-amber-400">
                🪙 {leaderboard[1].totalCoins.toLocaleString()}
              </span>
            </div>

            {/* Rank 1 - Gold */}
            <div className="flex flex-col items-center -mt-4">
              <div className="relative">
                <Crown className="w-6 h-6 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce" />
                <img
                  src={leaderboard[0].userAvatar}
                  alt={leaderboard[0].userName}
                  className="w-16 h-16 rounded-full object-cover border-3 border-amber-400 shadow-xl ring-4 ring-amber-400/20"
                />
                <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                  1
                </span>
              </div>
              <span className="text-xs font-black text-amber-300 mt-1 truncate max-w-[100px]">
                {leaderboard[0].userName}
              </span>
              <span className="text-xs font-black text-amber-400">
                🪙 {leaderboard[0].totalCoins.toLocaleString()}
              </span>
            </div>

            {/* Rank 3 - Bronze */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={leaderboard[2].userAvatar}
                  alt={leaderboard[2].userName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-700 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center">
                  3
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-200 mt-1 truncate max-w-[80px]">
                {leaderboard[2].userName}
              </span>
              <span className="text-[10px] font-black text-amber-400">
                🪙 {leaderboard[2].totalCoins.toLocaleString()}
              </span>
            </div>

          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-96">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading gifters...</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No gifts sent yet</p>
              <p className="text-[11px] text-slate-500">Be the first to send a virtual gift to claim #1 on the leaderboard!</p>
            </div>
          ) : (
            leaderboard.map((u, idx) => (
              <div
                key={u.userId}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 text-center text-xs font-black ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>

                  <img
                    src={u.userAvatar}
                    alt={u.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {u.userName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {u.giftCount} {u.giftCount === 1 ? 'gift' : 'gifts'} sent
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-amber-400">
                    🪙 {u.totalCoins.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
