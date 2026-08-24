import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Heart, Send, 
  Eye, Volume2, VolumeX, Music, Flame, ThumbsUp, Laugh, Sparkles,
  Clock, Trash2, MapPin, AtSign, Share2, MoreVertical
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoryItem } from '../types';
import { api } from '../services/api';

export const StoryViewerModal: React.FC = () => {
  const { 
    currentUser, 
    activeStoryModal, 
    setActiveStoryModal, 
    refreshStories,
    addToast 
  } = useApp() as any;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [showViewers, setShowViewers] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  const stories: StoryItem[] = activeStoryModal?.stories || [];
  const currentStory = stories[currentIndex];

  // Sync index and reset progress whenever a new modal/story set opens
  useEffect(() => {
    if (activeStoryModal) {
      setCurrentIndex(activeStoryModal.index || 0);
      setProgress(0);
      setIsPaused(false);
      setShowViewers(false);
    }
  }, [activeStoryModal]);

  // Track view in backend
  useEffect(() => {
    if (currentStory && currentUser) {
      api.viewStory(currentStory.id, currentUser.id).catch(() => {});
    }
  }, [currentStory?.id, currentUser?.id]);

  // Auto-progress ticker (5 seconds per story)
  useEffect(() => {
    if (!activeStoryModal || !currentStory || isPaused || showViewers) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2; // increments every 100ms -> 5000ms total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryModal, currentStory, isPaused, showViewers]);

  // Advance or close when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && activeStoryModal) {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setProgress(0);
      } else {
        setActiveStoryModal(null);
      }
    }
  }, [progress, currentIndex, stories.length, activeStoryModal, setActiveStoryModal]);

  if (!activeStoryModal || !currentStory) return null;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      setActiveStoryModal(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!currentUser) return;
    setFloatingReaction(emoji);
    setTimeout(() => setFloatingReaction(null), 1200);

    try {
      await api.reactStory(currentStory.id, currentUser.id, emoji);
      addToast(`Reaction sent to ${currentStory.userName}`, emoji, 'info');
    } catch (e) {
      console.warn('React story error:', e);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addToast(`Reply sent to ${currentStory.userName}`, `"${replyText}"`, 'success');
    setReplyText('');
  };

  const handleDeleteStory = async () => {
    if (!currentUser || !currentStory) return;
    setIsDeleting(true);
    try {
      await api.deleteStory(currentStory.id, currentUser.id);
      await refreshStories();
      addToast('Story Deleted', 'Your story update was removed.', 'info');
      setActiveStoryModal(null);
    } catch (err: any) {
      addToast('Error', err.message || 'Could not delete story', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = currentUser?.id === currentStory.userId;

  // Calculate hours remaining before 24-hour expiration
  const getExpirationText = () => {
    if (!currentStory.expiresAt) return '24h story';
    const diffMs = new Date(currentStory.expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Expires in ${hours}h ${mins}m`;
    return `Expires in ${mins}m`;
  };

  const formatStoryTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString || 'Just now';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none">
      
      {/* Top Close Button */}
      <button
        onClick={() => setActiveStoryModal(null)}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        title="Close Story Viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story Stage Frame */}
      <div 
        className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[88vh] max-h-[820px] bg-slate-900 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Visual (Image, Video or Gradient) */}
        {currentStory.mediaUrl ? (
          <img
            src={currentStory.mediaUrl}
            alt="Story content"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: currentStory.filter || 'none',
              transform: currentStory.rotation ? `rotate(${currentStory.rotation}deg)` : undefined
            }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentStory.backgroundGradient || 'from-indigo-600 via-purple-700 to-rose-600'}`} />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/85 pointer-events-none" />

        {/* Floating Heart Burst Animation */}
        {floatingReaction && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-out duration-1000">
            <span className="text-8xl drop-shadow-2xl animate-bounce">
              {floatingReaction}
            </span>
          </div>
        )}

        {/* ============================================================ */}
        {/* TOP HEADER & MULTI-STORY PROGRESS BARS */}
        {/* ============================================================ */}
        <div className="relative z-30 p-4 space-y-3">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id || idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Profile Info & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/60 shadow-md"
              />
              <div>
                <p className="text-white text-sm font-bold flex items-center gap-1 drop-shadow-sm leading-tight">
                  {currentStory.userName}
                </p>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px]">
                  <span>{formatStoryTime(currentStory.createdAt)}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{getExpirationText()}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Music Badge */}
              {currentStory.musicTitle && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-semibold border border-white/15 max-w-[130px] truncate">
                  <Music className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                  <span className="truncate">{currentStory.musicTitle}</span>
                </div>
              )}

              {/* Sound Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 cursor-pointer transition-colors"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Owner Delete Button */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStory();
                  }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md border border-white/10 cursor-pointer transition-colors"
                  title="Delete This Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Left / Right Tap zones for Prev / Next Navigation */}
        <div className="absolute inset-0 z-10 flex">
          <div 
            className="w-1/3 h-full cursor-pointer" 
            onClick={handlePrev}
            title="Previous Story" 
          />
          <div 
            className="w-2/3 h-full cursor-pointer" 
            onClick={handleNext}
            title="Next Story" 
          />
        </div>

        {/* ============================================================ */}
        {/* STORY OVERLAYS: TEXT OVERLAYS & STICKERS */}
        {/* ============================================================ */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center items-center p-6">
          
          {/* Main Story Caption or Center Text */}
          {currentStory.caption && (
            <div className="text-center my-auto max-w-[90%]">
              <p className="inline-block px-4 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-white text-base sm:text-lg font-black border border-white/15 shadow-xl leading-snug break-words">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Render Saved Text Overlays */}
          {currentStory.textOverlays?.map((t) => (
            <div
              key={t.id}
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                transform: 'translate(-50%, -50%)',
                color: t.color,
                backgroundColor: t.bgColor || 'transparent'
              }}
              className={`absolute px-3 py-1.5 rounded-xl text-center max-w-[85%] shadow-lg ${
                t.fontStyle === 'neon' ? 'font-black tracking-wider text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' :
                t.fontStyle === 'classic' ? 'font-serif italic' :
                t.fontStyle === 'typewriter' ? 'font-mono' :
                t.fontStyle === 'impact' ? 'font-black uppercase tracking-tight' :
                'font-bold'
              } ${
                t.fontSize === 'xl' ? 'text-xl' :
                t.fontSize === 'lg' ? 'text-base' :
                t.fontSize === 'sm' ? 'text-xs' : 'text-sm'
              }`}
            >
              <span className="drop-shadow-md break-words">{t.text}</span>
            </div>
          ))}

          {/* Render Saved Stickers */}
          {currentStory.stickers?.map((stk) => (
            <div
              key={stk.id}
              style={{
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: `translate(-50%, -50%) scale(${stk.scale || 1})`
              }}
              className="absolute select-none"
            >
              {stk.type === 'emoji' ? (
                <span className="text-4xl drop-shadow-lg">{stk.content}</span>
              ) : stk.type === 'location' ? (
                <div className="px-3 py-1.5 rounded-full bg-rose-600/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-white/20">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{stk.content}</span>
                </div>
              ) : stk.type === 'mention' ? (
                <div className="px-3 py-1.5 rounded-full bg-blue-600/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-white/20">
                  <AtSign className="w-3.5 h-3.5" />
                  <span>{stk.content}</span>
                </div>
              ) : stk.type === 'time' ? (
                <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white font-black text-xs flex items-center gap-1.5 shadow-lg border border-white/20">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{stk.content}</span>
                </div>
              ) : stk.type === 'badge' ? (
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-lg border border-white/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{stk.content}</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white font-bold text-xs shadow-lg border border-white/20">
                  {stk.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* BOTTOM ACTIONS BAR: REACTIONS / REPLY / VIEWER DRAWER */}
        {/* ============================================================ */}
        <div className="relative z-30 p-4 space-y-3 pointer-events-auto">
          
          {/* Quick Reaction Emojis for Viewers */}
          {!isOwner && (
            <div className="flex items-center justify-center gap-3">
              {['❤️', '🔥', '👏', '😂', '😮', '💯'].map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleReaction(emoji); 
                  }}
                  className="w-10 h-10 rounded-full bg-black/50 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-xl hover:scale-125 transition-transform cursor-pointer shadow-lg border border-white/10 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Reply Form (for Viewers) OR Viewer Count Button (for Owner) */}
          <div className="flex items-center gap-2">
            {!isOwner ? (
              <form 
                onSubmit={handleSendReply} 
                className="flex-1 flex items-center gap-2" 
                onClick={e => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${currentStory.userName}...`}
                  className="flex-1 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md text-white placeholder-white/60 text-xs sm:text-sm border border-white/20 focus:border-blue-400 outline-hidden shadow-lg"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                id="story-viewers-toggle-btn"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowViewers(!showViewers); 
                }}
                className="w-full py-3 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-between px-4 transition-colors cursor-pointer shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{currentStory.viewers?.length || 0} Story Viewers</span>
                </span>
                <span className="text-amber-400 text-[11px] font-semibold">
                  {showViewers ? 'Hide Details' : 'View Audience'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* SLIDE-UP VIEWERS DRAWER (FOR CREATOR) */}
        {/* ============================================================ */}
        {showViewers && isOwner && (
          <div className="absolute inset-x-0 bottom-0 max-h-80 bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/20 p-5 z-40 space-y-3 overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <h4 className="text-white text-xs font-black uppercase tracking-wider">
                  Story Viewers ({currentStory.viewers?.length || 0})
                </h4>
              </div>
              <button 
                onClick={() => setShowViewers(false)} 
                className="p-1 rounded-full text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {currentStory.viewers && currentStory.viewers.length > 0 ? (
              <div className="space-y-2.5">
                {currentStory.viewers.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={v.userAvatar} 
                        alt={v.userName} 
                        className="w-8 h-8 rounded-full object-cover border border-white/30" 
                      />
                      <div>
                        <span className="font-bold text-white block">{v.userName}</span>
                        <span className="text-white/50 text-[10px]">{v.viewedAt}</span>
                      </div>
                    </div>

                    {v.reaction && (
                      <span className="text-lg bg-black/40 px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                        {v.reaction}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-1">
                <p className="text-sm font-bold text-white/80">No Viewers Yet</p>
                <p className="text-xs text-white/50">Friends who view your story in the next 24h will appear here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
