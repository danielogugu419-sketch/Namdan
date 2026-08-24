import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Heart, MessageCircle, Share2, Music, 
  Volume2, VolumeX, Plus, Play, Pause, 
  Sparkles, X, Send, ChevronUp, ChevronDown, 
  Flame, Bookmark, MoreHorizontal, Check, 
  Copy, UserPlus, UserCheck, Flag, Download,
  Gauge, AlertCircle, Upload, Film, FileVideo,
  CornerDownRight, Smile, Eye, ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Reel, User, PostComment } from '../types';
import { api } from '../services/api';
import { initialUsers } from '../server/db';

interface HeartAnimation {
  id: number;
  x: number;
  y: number;
  scale: number;
}

export const ReelsView: React.FC = () => {
  const { 
    currentUser, 
    reels, 
    refreshReels,
    setShowUploadReel, 
    setCurrentTab, 
    setSelectedUserId, 
    addToast 
  } = useApp() as any;

  const [activeReelIndex, setActiveReelIndex] = useState(0);
  
  // Persistent sound preference: initialize from localStorage
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nemdan_reels_muted');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [videoFit, setVideoFit] = useState<'contain' | 'cover'>('cover');
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [followingCreators, setFollowingCreators] = useState<Set<string>>(new Set(['u_alex']));
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAutoplayMutedNotice, setShowAutoplayMutedNotice] = useState(false);
  const [audioToastText, setAudioToastText] = useState<string | null>(null);

  // Smooth swipe physics state
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Pull to refresh state for Reels (top of stream)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const isDraggingDownRef = useRef(false);

  // State & Ref for the consolidated 3-dot "More" options dropdown menu on the right overlay
  const [showRightMoreMenu, setShowRightMoreMenu] = useState(false);
  const rightMoreMenuRef = useRef<HTMLDivElement | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [commentInput, setCommentInput] = useState('');
  const [localReels, setLocalReels] = useState<Reel[]>(reels);
  const [heartAnimations, setHeartAnimations] = useState<HeartAnimation[]>([]);
  const [showPlayStateIndicator, setShowPlayStateIndicator] = useState<'play' | 'pause' | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);

  // Synchronize localReels when reels context updates
  useEffect(() => {
    if (reels && reels.length > 0) {
      setLocalReels(reels);
    }
  }, [reels]);

  const currentReel: Reel | undefined = localReels[activeReelIndex] || localReels[0] || reels[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nextVideoRef = useRef<HTMLVideoElement | null>(null);
  const prevVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wheelLockRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const currentDragYRef = useRef<number>(0);

  // Persist sound preference changes to localStorage
  const toggleSound = useCallback((explicitMuteState?: boolean) => {
    setIsMuted(prev => {
      const next = explicitMuteState !== undefined ? explicitMuteState : !prev;
      try {
        localStorage.setItem('nemdan_reels_muted', next ? 'true' : 'false');
      } catch (e) {
        console.warn('Could not save sound preference:', e);
      }
      
      setAudioToastText(next ? 'Sound Muted' : 'Sound Enabled');
      setTimeout(() => setAudioToastText(null), 1800);
      setShowAutoplayMutedNotice(false);
      return next;
    });
  }, []);

  // Fetch / resolve current Reel's creator profile
  useEffect(() => {
    if (!currentReel) return;
    
    // Find creator from initialUsers or API
    const foundUser = initialUsers.find(u => u.id === currentReel.creatorId || u.username === currentReel.creatorUsername);
    if (foundUser) {
      setCreatorUser(foundUser);
    } else {
      api.getUser(currentReel.creatorId).then(u => {
        if (u) setCreatorUser(u);
      }).catch(() => {
        setCreatorUser({
          id: currentReel.creatorId,
          username: currentReel.creatorUsername || 'creator',
          name: currentReel.creatorName,
          email: 'creator@nemdan.global',
          avatar: currentReel.creatorAvatar,
          bio: 'NEMDAN Verified Creator sharing daily stories & short videos 🌟',
          role: 'creator',
          isVerified: !!currentReel.creatorVerified,
          followersCount: 38900,
          followingCount: 240
        });
      });
    }
  }, [currentReel]);

  // Synchronize audio muted state directly to video DOM element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = isMuted;
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Autoplay and sound management with browser policy compliance
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.playbackRate = playbackSpeed;
    vid.defaultMuted = isMuted;
    vid.muted = isMuted;

    if (isPlaying) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If unmuted autoplay is blocked by browser policy, fall back to muted autoplay automatically
          if (!vid.muted) {
            vid.muted = true;
            setIsMuted(true);
            setShowAutoplayMutedNotice(true);
            vid.play().catch(() => {});
          }
        });
      }
    } else {
      vid.pause();
    }
    setVideoProgress(0);
  }, [activeReelIndex, isPlaying, playbackSpeed]);

  // Browser tab visibility lifecycle handling (pause when tab hidden, resume when active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const vid = videoRef.current;
      if (!vid) return;

      if (document.hidden) {
        vid.pause();
      } else if (isPlaying) {
        vid.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Video progress updater
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(prog);
    }
  };

  // Navigate reels with smooth transition
  const handleNextReel = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveReelIndex(prev => (prev < localReels.length - 1 ? prev + 1 : 0));
    setShowCommentsDrawer(false);
    setShowMoreMenu(false);
    setShowRightMoreMenu(false);
    setShowShareModal(false);
    setDragOffsetY(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [localReels.length, isTransitioning]);

  const handlePrevReel = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveReelIndex(prev => (prev > 0 ? prev - 1 : localReels.length - 1));
    setShowCommentsDrawer(false);
    setShowMoreMenu(false);
    setShowRightMoreMenu(false);
    setShowShareModal(false);
    setDragOffsetY(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [localReels.length, isTransitioning]);

  // Handle click-outside-to-close behavior for the right 3-dot "More" options dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // If the dropdown is currently open and the click occurred outside rightMoreMenuRef, close it
      if (rightMoreMenuRef.current && !rightMoreMenuRef.current.contains(event.target as Node)) {
        setShowRightMoreMenu(false);
      }
    };

    if (showRightMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showRightMoreMenu]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextReel, handlePrevReel]);

  // Mouse wheel scroll to transition between reels
  const handleWheel = (e: React.WheelEvent) => {
    if (showCommentsDrawer || showShareModal || showMoreMenu) return;
    if (wheelLockRef.current) return;

    if (Math.abs(e.deltaY) > 35) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        handleNextReel();
      } else {
        handlePrevReel();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  };

  // Touch & Swipe gesture engine with real-time tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showCommentsDrawer || showShareModal || showMoreMenu || showRightMoreMenu) return;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
    currentDragYRef.current = 0;
    setIsDragging(true);

    if (activeReelIndex === 0) {
      isDraggingDownRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    currentDragYRef.current = diff;

    // Pull-to-refresh at the top of feed
    if (activeReelIndex === 0 && diff > 0 && !isPullRefreshing) {
      const pull = Math.min(80, Math.pow(diff, 0.75) * 2.2);
      setPullDistance(pull);
      setDragOffsetY(pull * 0.4);
    } else {
      // Direct 1:1 responsive drag feedback with rubber-band dampening at edges
      if ((activeReelIndex === 0 && diff > 0) || (activeReelIndex === localReels.length - 1 && diff < 0)) {
        setDragOffsetY(diff * 0.3); // Rubber band
      } else {
        setDragOffsetY(diff);
      }
    }
  };

  const handleTriggerReelsRefresh = async () => {
    setIsPullRefreshing(true);
    setPullDistance(56);
    try {
      if (refreshReels) {
        await refreshReels();
      } else {
        const fresh = await api.getReels();
        setLocalReels(fresh || []);
      }
      addToast('Reels Updated', 'Loaded latest short videos.', 'info');
    } catch (err: any) {
      addToast('Refresh Error', err.message || 'Could not refresh reels', 'error');
    } finally {
      setIsPullRefreshing(false);
      setPullDistance(0);
      isDraggingDownRef.current = false;
      setDragOffsetY(0);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    const elapsed = Date.now() - touchStartTimeRef.current;
    const velocity = Math.abs(deltaY) / (elapsed || 1);

    if (activeReelIndex === 0 && pullDistance > 45) {
      await handleTriggerReelsRefresh();
      return;
    }
    setPullDistance(0);
    isDraggingDownRef.current = false;

    // Swipe threshold: 75px or fast flick (velocity > 0.45)
    if (Math.abs(deltaY) > 75 || velocity > 0.45) {
      if (deltaY > 0) {
        handleNextReel();
      } else {
        handlePrevReel();
      }
    } else {
      // Spring back to center
      setDragOffsetY(0);
    }
  };

  // Double tap heart burst animation
  const triggerHeartBurst = (clientX?: number, clientY?: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    let x = 50;
    let y = 50;

    if (rect && clientX !== undefined && clientY !== undefined) {
      x = ((clientX - rect.left) / rect.width) * 100;
      y = ((clientY - rect.top) / rect.height) * 100;
    }

    const newAnim: HeartAnimation = {
      id: Date.now() + Math.random(),
      x,
      y,
      scale: 1
    };

    setHeartAnimations(prev => [...prev, newAnim]);

    setTimeout(() => {
      setHeartAnimations(prev => prev.filter(h => h.id !== newAnim.id));
    }, 900);
  };

  const handleReactReel = async (type: string = 'like') => {
    if (!currentUser || !currentReel) {
      addToast('Sign in required', 'Please sign in to react to Reels.', 'warning');
      return;
    }
    try {
      const updated = await api.reactReel(currentReel.id, currentUser.id, type);
      setLocalReels(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Video Tap / Double Tap
  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      // DOUBLE TAP DETECTED -> LIKE REEL!
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      lastTapRef.current = 0;
      triggerHeartBurst(e.clientX, e.clientY);
      handleReactReel('like');
    } else {
      // SINGLE TAP -> TOGGLE PLAY / PAUSE
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        setIsPlaying(prev => {
          const next = !prev;
          setShowPlayStateIndicator(next ? 'play' : 'pause');
          setTimeout(() => setShowPlayStateIndicator(null), 600);
          return next;
        });
      }, 260);
    }
  };

  const handleToggleSave = () => {
    if (!currentReel) return;
    const isSaved = savedReels.has(currentReel.id);
    setSavedReels(prev => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(currentReel.id);
      } else {
        next.add(currentReel.id);
      }
      return next;
    });
    addToast(
      isSaved ? 'Removed from Saved' : 'Reel Saved',
      isSaved ? 'Removed from your bookmarks.' : 'Saved to your NEMDAN Reels collection.',
      'info'
    );
  };

  const handleToggleFollow = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentReel) return;
    const creatorId = currentReel.creatorId;
    const isFollowing = followingCreators.has(creatorId);

    setFollowingCreators(prev => {
      const next = new Set(prev);
      if (isFollowing) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });

    addToast(
      isFollowing ? `Unfollowed` : `Following ${currentReel.creatorName}`,
      isFollowing ? `You will see fewer reels from @${currentReel.creatorUsername}` : `You are now following ${currentReel.creatorName}!`,
      'success'
    );
  };

  const handleOpenCreatorProfile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentReel) return;
    setSelectedUserId(currentReel.creatorId);
    setCurrentTab('profile');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentReel) return;
    const newComment: PostComment = {
      id: `rc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      postId: currentReel.id,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest User',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userVerified: currentUser?.isVerified || false,
      content: commentInput.trim(),
      createdAt: 'Just now',
      likesCount: 0
    };
    setLocalReels(prev => prev.map(r => {
      if (r.id === currentReel.id) {
        return {
          ...r,
          commentsCount: (r.commentsCount || 0) + 1,
          comments: [...(r.comments || []), newComment]
        };
      }
      return r;
    }));
    setCommentInput('');
    addToast('Comment Posted', 'Your reply is now live on this reel.', 'success');
  };

  const handleShareToFeed = () => {
    if (!currentReel) return;
    setShowShareModal(false);
    setShowMoreMenu(false);
    addToast('Shared to Feed', `Reel by ${currentReel.creatorName} reposted to your NEMDAN activity feed!`, 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShowShareModal(false);
    setShowMoreMenu(false);
    addToast('Reel Link Copied', 'Direct link copied to clipboard.', 'success');
  };

  const handleNotInterested = () => {
    setShowMoreMenu(false);
    addToast('Preferences Updated', 'We will show you fewer videos like this.', 'info');
    handleNextReel();
  };

  const handleReportSubmit = () => {
    setShowReportModal(false);
    addToast('Report Received', 'Thank you for keeping NEMDAN safe. Our AI & moderation team will review this reel.', 'success');
  };

  if (!currentReel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-black">
        <Film className="w-12 h-12 text-slate-600 mb-3" />
        <p className="text-white font-semibold">No Reels available in stream</p>
        <button
          onClick={() => setShowUploadReel(true)}
          className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
        >
          Create the First Reel
        </button>
      </div>
    );
  }

  const isLikedByMe = currentUser && currentReel.reactions?.some(r => r.userId === currentUser.id);
  const isSavedByMe = savedReels.has(currentReel.id);
  const isFollowingCreator = followingCreators.has(currentReel.creatorId);
  const creatorReelsCount = localReels.filter(r => r.creatorId === currentReel.creatorId).length || 3;
  const followersCountFormatted = creatorUser?.followersCount 
    ? (creatorUser.followersCount > 999 ? `${(creatorUser.followersCount / 1000).toFixed(1)}K` : creatorUser.followersCount)
    : '48.2K';
  const followingCountFormatted = creatorUser?.followingCount || 240;

  // Extract hashtags from caption or reel tags
  const captionWords = currentReel.caption.split(' ');
  const hashtags = captionWords.filter(w => w.startsWith('#'));

  return (
    <div 
      className="relative w-full h-full bg-black flex flex-col items-center justify-between select-none overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull To Refresh Floating Indicator */}
      {(pullDistance > 0 || isPullRefreshing) && (
        <div 
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 transition-transform duration-75 pointer-events-none"
          style={{
            transform: `translate(-50%, ${Math.min(pullDistance, 70)}px)`
          }}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white shadow-2xl flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full border-2 border-white/30 border-t-blue-400 flex items-center justify-center ${
              isPullRefreshing ? 'animate-spin border-t-blue-400' : ''
            }`} style={{
              transform: isPullRefreshing ? undefined : `rotate(${pullDistance * 5}deg)`
            }}>
              {!isPullRefreshing && <div className="w-1 h-1 bg-blue-400 rounded-full" />}
            </div>
            <span className="text-xs font-bold text-white/90">
              {isPullRefreshing 
                ? 'Refreshing Reels...' 
                : pullDistance > 45 
                  ? 'Release to update' 
                  : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Ambient Canvas Glow Backdrop (Zero GPU Video Decoder Overhead) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2. USER PROFILE SECTION — KEEP IT AT THE TOP (Requirement 2)               */}
      {/* ========================================================================= */}
      <div 
        id="reels-top-creator-profile-bar"
        className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border-b border-white/10 px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 z-30 shrink-0 text-white shadow-xl"
      >
        {/* Left: Back Navigation to Home/Feed & Creator Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Direct Back navigation button to exit immersive full-screen Reels mode */}
          <button
            id="reels-back-to-feed-btn"
            onClick={() => setCurrentTab('feed')}
            className="p-2 -ml-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Back to Home Feed"
          >
            <ArrowLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          <div 
            onClick={handleOpenCreatorProfile}
            className="relative cursor-pointer group shrink-0"
            title="View creator's profile"
          >
            <img
              src={creatorUser?.avatar || currentReel.creatorAvatar}
              alt={currentReel.creatorName}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-blue-500/80 group-hover:scale-105 transition-transform"
            />
            {(creatorUser?.isVerified || currentReel.creatorVerified) && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-1 ring-black">
                ✓
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                onClick={handleOpenCreatorProfile}
                className="font-bold text-xs sm:text-sm text-white hover:text-blue-400 cursor-pointer truncate drop-shadow-xs"
              >
                {creatorUser?.name || currentReel.creatorName}
              </span>
              <span 
                onClick={handleOpenCreatorProfile}
                className="text-[11px] sm:text-xs text-white/60 hover:text-white cursor-pointer truncate"
              >
                @{creatorUser?.username || currentReel.creatorUsername || 'creator'}
              </span>
            </div>
            
            {/* Compact 1-line short bio */}
            <p className="text-[10px] sm:text-[11px] text-white/75 truncate max-w-[200px] sm:max-w-xs md:max-w-sm mt-0.5 font-normal">
              {creatorUser?.bio || 'NEMDAN Verified Creator sharing daily stories & short videos 🌟'}
            </p>
          </div>
        </div>

        {/* Center/Right: Stats (Reel count, Followers, Following) & Follow/Following Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Detailed stats on tablet/desktop */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-medium border border-white/10">
            <span className="text-white/80">
              <strong className="text-white font-bold">{creatorReelsCount}</strong> Reels
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-white/80">
              <strong className="text-white font-bold">{followersCountFormatted}</strong> Followers
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-white/80">
              <strong className="text-white font-bold">{followingCountFormatted}</strong> Following
            </span>
          </div>

          {/* Compact Followers badge on mobile */}
          <div className="flex md:hidden items-center text-[10px] text-white/70 font-medium bg-white/10 px-2 py-1 rounded-full">
            <span><strong>{followersCountFormatted}</strong> followers</span>
          </div>

          {/* Follow / Following Button */}
          <button
            id="creator-top-follow-btn"
            onClick={handleToggleFollow}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1 ${
              isFollowingCreator
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
          >
            {isFollowingCreator ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REELS STAGE (9:16 Vertical Video Frame - Full Screen Viewport)         */}
      {/* ========================================================================= */}
      <div 
        ref={containerRef}
        id={`reel-stage-${currentReel.id}`}
        className="relative flex-1 w-full max-w-2xl flex items-center justify-center overflow-hidden h-full touch-none"
      >
        {/* Lazy Preloaded Adjacent Videos for Instantaneous Zero-Lag Swipes */}
        {localReels[activeReelIndex + 1] && (
          <video
            ref={nextVideoRef}
            src={localReels[activeReelIndex + 1].videoUrl}
            preload="metadata"
            muted
            playsInline
            className="hidden pointer-events-none"
          />
        )}
        {localReels[activeReelIndex - 1] && (
          <video
            ref={prevVideoRef}
            src={localReels[activeReelIndex - 1].videoUrl}
            preload="metadata"
            muted
            playsInline
            className="hidden pointer-events-none"
          />
        )}

        {/* 9:16 Centered Vertical Player Stage with Real-Time Smooth Swipe Physics */}
        <div 
          className="relative w-full h-full max-h-full aspect-[9/16] max-w-md sm:max-w-lg bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer will-change-transform"
          style={{
            transform: `translate3d(0, ${dragOffsetY}px, 0)`,
            transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
          onClick={handleVideoTap}
          onDoubleClick={(e) => {
            triggerHeartBurst(e.clientX, e.clientY);
            handleReactReel('like');
          }}
        >
          {/* Main Reel Video (Autoplays, loops, 9:16 format, high-contrast clean render) */}
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            autoPlay={isPlaying}
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            controls={false}
            onTimeUpdate={handleTimeUpdate}
            className={`w-full h-full ${videoFit === 'cover' ? 'object-cover' : 'object-contain'} brightness-100 contrast-100 filter-none transition-all duration-300`}
            style={{
              objectFit: videoFit,
              filter: 'none',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)'
            }}
          />

          {/* Subtle Bottom Gradient strictly behind text for readability without darkening the video */}
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

          {/* Play / Pause Indicator Burst Badge */}
          {showPlayStateIndicator && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-18 h-18 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white scale-110 animate-out fade-out zoom-out duration-500 shadow-2xl border border-white/10">
                {showPlayStateIndicator === 'play' ? (
                  <Play className="w-8 h-8 fill-white translate-x-0.5" />
                ) : (
                  <Pause className="w-8 h-8 fill-white" />
                )}
              </div>
            </div>
          )}

          {/* Autoplay Browser Muted Notice Prompt */}
          {isMuted && showAutoplayMutedNotice && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                toggleSound(false);
              }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/25 px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Tap to Unmute</span>
            </div>
          )}

          {/* Floating Sound State Toast */}
          {audioToastText && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black/85 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{audioToastText}</span>
            </div>
          )}

          {/* Double Tap Floating Heart Burst Animations */}
          {heartAnimations.map(h => (
            <div 
              key={h.id}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping duration-700 z-30"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <div className="relative flex items-center justify-center">
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-[0_10px_25px_rgba(239,68,68,0.9)] animate-bounce" />
                <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
          ))}

          {/* Top Stage Floating Tools Bar (Speaker Toggle & More Menu) */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-end pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Primary Speaker Toggle in Top Bar */}
              <button
                id="reel-mute-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound();
                }}
                className={`p-2.5 rounded-full backdrop-blur-md text-white border transition-all shadow-lg cursor-pointer flex items-center justify-center ${
                  !isMuted 
                    ? 'bg-blue-600/90 border-blue-400/50 hover:bg-blue-600 scale-105' 
                    : 'bg-black/60 hover:bg-black/80 border-white/15'
                }`}
                title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
                aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? (
                  <VolumeX className="w-4.5 h-4.5 text-white/90" />
                ) : (
                  <Volume2 className="w-4.5 h-4.5 text-white animate-pulse" />
                )}
              </button>

              {/* Three-Dot More Options Menu */}
              <div className="relative">
                <button
                  id="reel-more-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition-all shadow-md cursor-pointer flex items-center justify-center"
                  title="More Options"
                >
                  <MoreHorizontal className="w-4.5 h-4.5" />
                </button>

                {/* More Options Dropdown Modal */}
                {showMoreMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 z-40 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-blue-400" />
                      <span>Copy Link</span>
                    </button>

                    <button
                      onClick={handleShareToFeed}
                      className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <CornerDownRight className="w-4 h-4 text-green-400" />
                      <span>Share to Feed</span>
                    </button>

                    <div className="my-1 border-t border-white/10" />

                    {/* Playback speed selector */}
                    <div className="px-3 py-1.5">
                      <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
                        <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-amber-400" /> Speed</span>
                        <span className="font-bold text-white">{playbackSpeed}x</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[0.5, 1, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`py-1 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${
                              playbackSpeed === speed ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fit Mode Toggle */}
                    <button
                      onClick={() => setVideoFit(prev => prev === 'cover' ? 'contain' : 'cover')}
                      className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Film className="w-4 h-4 text-purple-400" />
                        <span>Display Fit</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-md">
                        {videoFit}
                      </span>
                    </button>

                    <div className="my-1 border-t border-white/10" />

                    <button
                      onClick={handleNotInterested}
                      className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>Not Interested</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowReportModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report Reel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FLOATING RIGHT ACTION DOCK (TikTok Style - Large Touch Targets)            */}
          {/* ========================================================================= */}
          <div className="absolute right-3 sm:right-4 bottom-14 z-20 flex flex-col items-center gap-3.5 sm:gap-4 pointer-events-auto">
            
            {/* Creator Mini-Avatar with quick Follow plus icon */}
            <div className="relative flex flex-col items-center mb-1">
              <img
                src={currentReel.creatorAvatar}
                alt={currentReel.creatorName}
                onClick={handleOpenCreatorProfile}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xl cursor-pointer hover:scale-105 transition-transform"
              />
              {!isFollowingCreator && (
                <button
                  onClick={handleToggleFollow}
                  className="absolute -bottom-1.5 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-black hover:scale-110 transition-transform cursor-pointer shadow-md"
                  title="Follow Creator"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Like Button */}
            <div className="flex flex-col items-center">
              <button
                id="reel-like-button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHeartBurst(undefined, undefined);
                  handleReactReel('like');
                }}
                className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-125 cursor-pointer shadow-xl border border-white/10 ${
                  isLikedByMe 
                    ? 'bg-red-500 text-white shadow-red-500/50 scale-105' 
                    : 'bg-black/60 text-white hover:bg-black/80 hover:scale-105'
                }`}
                title="Like Reel"
              >
                <Heart className={`w-6 h-6 ${isLikedByMe ? 'fill-white' : ''}`} />
              </button>
              <span className="text-white text-[11px] font-bold mt-1 drop-shadow-md">
                {currentReel.reactions?.length || 0}
              </span>
            </div>

            {/* Comments Button */}
            <div className="flex flex-col items-center">
              <button
                id="reel-comment-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentsDrawer(true);
                }}
                className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 hover:scale-105 flex items-center justify-center transition-all cursor-pointer shadow-xl border border-white/10"
                title="View Comments"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <span className="text-white text-[11px] font-bold mt-1 drop-shadow-md">
                {currentReel.commentsCount || currentReel.comments?.length || 0}
              </span>
            </div>

            {/* Prominent Floating Speaker Toggle Button (Dock Action) */}
            <div className="flex flex-col items-center">
              <button
                id="reel-dock-speaker-toggle-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound();
                }}
                className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl border ${
                  !isMuted 
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/40 scale-105' 
                    : 'bg-black/60 text-white hover:bg-black/80 border-white/15'
                }`}
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {!isMuted ? (
                  <Volume2 className="w-6 h-6 animate-pulse" />
                ) : (
                  <VolumeX className="w-6 h-6 text-white/80" />
                )}
              </button>
              <span className="text-white text-[11px] font-bold mt-1 drop-shadow-md">
                {!isMuted ? 'Sound' : 'Muted'}
              </span>
            </div>

            {/* Consolidated Three-Dot "More" options trigger & Popover dropdown menu */}
            <div className="relative flex flex-col items-center" ref={rightMoreMenuRef}>
              <button
                id="reel-right-more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRightMoreMenu(prev => !prev);
                }}
                className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl border border-white/15 ${
                  showRightMoreMenu
                    ? 'bg-blue-600 text-white shadow-blue-500/50 scale-105 ring-2 ring-blue-400'
                    : 'bg-black/60 text-white hover:bg-black/80 hover:scale-105 active:scale-95'
                }`}
                title="More Video Actions"
                aria-label="More Video Actions"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
              <span className="text-white text-[11px] font-bold mt-1 drop-shadow-md">
                More
              </span>

              {/* Popover Action Menu */}
              {showRightMoreMenu && (
                <div 
                  id="reel-more-popover-menu"
                  className="absolute right-14 bottom-0 w-60 sm:w-64 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 z-40 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 origin-bottom-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-white/60">More Options</span>
                    <button 
                      onClick={() => setShowRightMoreMenu(false)}
                      className="text-white/40 hover:text-white p-0.5 rounded-md transition-colors cursor-pointer"
                      title="Close menu"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Share Action */}
                  <button
                    id="popover-share-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRightMoreMenu(false);
                      setShowShareModal(true);
                    }}
                    className="w-full px-3 py-2.5 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">Share</span>
                    </div>
                    <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
                      {currentReel.sharesCount || 12}
                    </span>
                  </button>

                  {/* Save Action */}
                  <button
                    id="popover-save-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave();
                    }}
                    className="w-full px-3 py-2.5 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                        isSavedByMe 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-white/10 text-slate-300'
                      }`}>
                        <Bookmark className={`w-4 h-4 ${isSavedByMe ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </div>
                      <span className="font-bold text-white">
                        {isSavedByMe ? 'Saved' : 'Save'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isSavedByMe 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                        : 'bg-white/10 text-white/60 border-white/10'
                    }`}>
                      {isSavedByMe ? 'Saved' : 'Save'}
                    </span>
                  </button>

                  {/* Sound Action */}
                  <button
                    id="popover-sound-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSound();
                    }}
                    className="w-full px-3 py-2.5 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                        !isMuted 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-white">Sound</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      !isMuted 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {!isMuted ? 'On' : 'Muted'}
                    </span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink();
                      setShowRightMoreMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-white/10 rounded-xl flex items-center gap-2.5 text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-blue-400" />
                    <span>Copy Video Link</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRightMoreMenu(false);
                      setShowReportModal(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report Reel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Rotating Audio Soundtrack Disc */}
            <div 
              className="w-11 h-11 rounded-full border-2 border-white/80 bg-gradient-to-tr from-slate-900 via-indigo-900 to-blue-600 flex items-center justify-center text-white overflow-hidden shadow-2xl animate-spin mt-1 cursor-pointer" 
              style={{ animationDuration: isPlaying && !isMuted ? '3s' : '0s' }}
              title={`Audio: ${currentReel.audioTitle || currentReel.audioTrack || 'Original Soundtrack'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleSound(false);
                addToast('Soundtrack', currentReel.audioTitle || currentReel.audioTrack || 'NEMDAN Original Audio', 'info');
              }}
            >
              <Music className="w-4 h-4 text-blue-300" />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* REEL BOTTOM METADATA (Creator, Caption, Clickable Hashtags, Sound Bar)    */}
          {/* ========================================================================= */}
          <div className="absolute left-3 sm:left-4 right-16 bottom-3 z-20 pointer-events-auto space-y-2 text-left">
            
            {/* Creator Name & Username */}
            <div 
              onClick={handleOpenCreatorProfile}
              className="flex items-center gap-1.5 cursor-pointer w-fit group"
            >
              <span className="text-white font-bold text-sm sm:text-base group-hover:underline drop-shadow-md">
                {currentReel.creatorName}
              </span>
              <span className="text-white/70 text-xs font-medium">
                @{currentReel.creatorUsername || 'creator'}
              </span>
              {currentReel.creatorVerified && (
                <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-white font-black">✓</span>
                </span>
              )}
            </div>

            {/* Caption & Hashtag badges */}
            <p className="text-white text-xs sm:text-sm leading-relaxed drop-shadow-md font-normal line-clamp-3">
              {currentReel.caption}
            </p>

            {/* Clickable Hashtags Pill Bar */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {hashtags.slice(0, 4).map((tag, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToast('Tag Filter', `Browsing Reels tagged with ${tag}`, 'info');
                    }}
                    className="text-[11px] bg-white/15 hover:bg-blue-600/60 backdrop-blur-md px-2 py-0.5 rounded-md text-blue-200 font-semibold cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Scrolling / Animated Audio Soundtrack Pill */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                addToast('Soundtrack Info', currentReel.audioTitle || currentReel.audioTrack || 'Original Sound', 'info');
              }}
              className="flex items-center gap-2 text-white/95 text-xs font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full w-fit max-w-[260px] sm:max-w-[320px] border border-white/15 shadow-sm cursor-pointer hover:bg-black/70 transition-colors"
            >
              <Music className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">
                {currentReel.audioTitle || currentReel.audioTrack || 'NEMDAN Original Audio'}
              </span>
            </div>
          </div>

          {/* Bottom Edge Video Playback Progress Scrubber Line */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.9)]"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
        </div>

        {/* Desktop Side Chevrons for Fast Up/Down Navigation */}
        <div className="hidden lg:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-20">
          <button
            id="reel-prev-btn"
            onClick={handlePrevReel}
            className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-blue-600 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Previous Reel (↑ / K)"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          <button
            id="reel-next-btn"
            onClick={handleNextReel}
            className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-blue-600 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Next Reel (↓ / J)"
          >
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* COMMENTS BOTTOM SHEET / DRAWER                                            */}
        {/* ========================================================================= */}
        {showCommentsDrawer && (
          <div 
            className="absolute inset-y-0 right-0 w-full sm:w-[380px] md:w-[420px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/15 p-5 z-40 flex flex-col justify-between animate-in slide-in-from-right-8 duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <h4 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span>Comments ({currentReel.comments?.length || currentReel.commentsCount || 0})</span>
              </h4>
              <button 
                onClick={() => setShowCommentsDrawer(false)} 
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 scrollbar-thin">
              {currentReel.comments && currentReel.comments.length > 0 ? (
                currentReel.comments.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs">
                    <img 
                      src={c.userAvatar} 
                      alt={c.userName} 
                      className="w-8 h-8 rounded-full object-cover mt-0.5 border border-white/20 shrink-0" 
                    />
                    <div className="flex-1 bg-white/10 p-3 rounded-2xl text-white">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white text-xs">{c.userName}</span>
                          {c.userVerified && (
                            <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px]">✓</span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/50">{c.createdAt}</span>
                      </div>
                      <p className="text-white/90 text-xs leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-white/50 space-y-2">
                  <MessageCircle className="w-8 h-8 text-white/20" />
                  <p className="text-xs">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Quick Emoji Reaction Pills */}
            <div className="flex items-center gap-1.5 py-2 border-t border-white/10 overflow-x-auto">
              {['🔥', '👏', '❤️', '😂', '😍', '🚀', '💯'].map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCommentInput(prev => `${prev} ${emoji}`.trim())}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-colors cursor-pointer shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 bg-white/10 rounded-full text-white text-xs placeholder-white/50 outline-hidden border border-white/20 focus:border-blue-400 focus:bg-white/15 transition-all"
              />
              <button 
                type="submit" 
                disabled={!commentInput.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer shrink-0 shadow-md shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SHARE MODAL DIALOG                                                        */}
        {/* ========================================================================= */}
        {showShareModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <div 
              className="bg-slate-900 border border-white/15 w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Share NEMDAN Reel</span>
                </h4>
                <button onClick={() => setShowShareModal(false)} className="text-white/60 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Creator Preview Tile */}
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                <img src={currentReel.creatorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs truncate">{currentReel.creatorName}</p>
                  <p className="text-[11px] text-white/60 truncate">{currentReel.caption}</p>
                </div>
              </div>

              {/* Share Options Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <Copy className="w-5 h-5 text-blue-400" />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={handleShareToFeed}
                  className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <CornerDownRight className="w-5 h-5 text-green-400" />
                  <span>Share to Feed</span>
                </button>
              </div>

              {/* Quick direct share link */}
              <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
                <span className="text-white/60 truncate flex-1 font-mono text-[11px]">
                  https://nemdan.global/reels/{currentReel.id}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT REEL MODAL                                                         */}
        {/* ========================================================================= */}
        {showReportModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <div 
              className="bg-slate-900 border border-white/15 w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="font-bold text-sm flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Report Reel</span>
                </h4>
                <button onClick={() => setShowReportModal(false)} className="text-white/60 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/70">
                Why are you reporting this video by <strong>{currentReel.creatorName}</strong>?
              </p>

              <div className="space-y-2">
                {[
                  'Inappropriate Content',
                  'Spam or Misleading',
                  'Harassment or Hate Speech',
                  'Copyright Violation',
                  'Violence or Dangerous Acts'
                ].map(reason => (
                  <label 
                    key={reason}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      reportReason === reason ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span>{reason}</span>
                    <input 
                      type="radio" 
                      name="reportReason" 
                      value={reason} 
                      checked={reportReason === reason} 
                      onChange={() => setReportReason(reason)}
                      className="text-blue-600"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// =============================================================================
// 4. CREATE REEL MODAL & DRAFT SYSTEM (Requirement 4)
// =============================================================================
export const UploadReelModal: React.FC = () => {
  const { 
    currentUser, 
    showUploadReel, 
    setShowUploadReel, 
    refreshReels, 
    addToast 
  } = useApp() as any;

  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [audioTrack, setAudioTrack] = useState('NEMDAN Original Audio');
  const [loading, setLoading] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sampleVideos = [
    { title: 'Cyber Robot AI', url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-talking-in-a-virtual-reality-41551-large.mp4' },
    { title: 'Ocean Waves 4K', url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-a-rocky-beach-42358-large.mp4' },
    { title: 'Ceramics Pottery', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41712-large.mp4' },
    { title: 'Kyoto Cherry Blossom', url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4' },
    { title: 'Neon Night Vibe', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4' }
  ];

  const popularHashtags = ['#NEMDAN', '#Trending', '#Viral', '#CreatorStudio', '#Tech2026', '#Travel', '#Art', '#Inspiration'];
  const popularAudioTracks = [
    'NEMDAN Original Audio',
    'Midnight Cyber Synth • NEMDAN Studio',
    'Pacific Ocean Breeze • Ambient Nature',
    'Lofi Chillhop Beats • Study Session',
    'Kyoto Ambient Harmonies'
  ];

  // Check for existing draft on modal open
  useEffect(() => {
    if (showUploadReel) {
      const saved = localStorage.getItem('nemdan_reel_draft');
      if (saved) {
        setHasSavedDraft(true);
      }
    }
  }, [showUploadReel]);

  if (!showUploadReel) return null;

  // Handle local video file upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      addToast('Video Loaded', `Selected "${file.name}" from your device.`, 'success');
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      videoUrl,
      caption,
      thumbnailUrl,
      audioTrack,
      savedAt: new Date().toLocaleTimeString()
    };
    localStorage.setItem('nemdan_reel_draft', JSON.stringify(draftData));
    setHasSavedDraft(true);
    addToast('Draft Saved', 'Your Reel progress has been saved as a draft.', 'info');
  };

  const handleLoadDraft = () => {
    const saved = localStorage.getItem('nemdan_reel_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVideoUrl(parsed.videoUrl || '');
        setCaption(parsed.caption || '');
        setThumbnailUrl(parsed.thumbnailUrl || '');
        setAudioTrack(parsed.audioTrack || 'NEMDAN Original Audio');
        addToast('Draft Restored', `Restored draft from ${parsed.savedAt || 'earlier'}.`, 'success');
      } catch {
        addToast('Draft Error', 'Could not parse draft data.', 'error');
      }
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('nemdan_reel_draft');
    setHasSavedDraft(false);
    addToast('Draft Discarded', 'Cleared saved draft data.', 'info');
  };

  const handleAppendHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption(prev => `${prev} ${tag}`.trim());
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!videoUrl) {
      addToast('Video Required', 'Please select or upload a video for your Reel.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.createReel({
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorUsername: currentUser.username,
        creatorAvatar: currentUser.avatar,
        creatorVerified: currentUser.isVerified,
        videoUrl: videoUrl || sampleVideos[0].url,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        caption: caption.trim() || 'New video on NEMDAN Reels! #NEMDAN #Creators',
        audioTitle: audioTrack || `${currentUser.name} • Original Audio`
      });

      // Clear draft on successful publish
      localStorage.removeItem('nemdan_reel_draft');
      setHasSavedDraft(false);

      await refreshReels();
      setShowUploadReel(false);
      addToast('Reel Published!', 'Your vertical short video is now live on the NEMDAN Reels stream.', 'success');
    } catch (err: any) {
      addToast('Error Uploading Reel', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Create NEMDAN Reel</h3>
              <p className="text-[11px] text-slate-500">9:16 Vertical Video Studio</p>
            </div>
          </div>
          <button 
            onClick={() => setShowUploadReel(false)} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draft Notice Banner if draft exists */}
        {hasSavedDraft && (
          <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              You have a saved Reel draft.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadDraft}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Restore Draft
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-slate-400 hover:text-red-500 cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handlePublish} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Video Upload Dropzone & File Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Video Source (From Device or Preset)
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors mb-0.5" />
              <p className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                Click to upload video from your device
              </p>
              <p className="text-[10px] text-slate-400">MP4, WebM, MOV (Vertical 9:16 recommended)</p>
            </div>

            {/* Video Presets */}
            <div className="mt-2.5">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Or choose a high-quality 9:16 sample preset:</p>
              <div className="flex flex-wrap gap-1.5">
                {sampleVideos.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVideoUrl(s.url);
                      addToast('Preset Selected', `Loaded ${s.title}`, 'info');
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      videoUrl === s.url
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Preview if selected */}
            {videoUrl && (
              <div className="mt-3 p-2 bg-slate-900 rounded-xl flex items-center gap-3">
                <video src={videoUrl} className="w-12 h-16 object-cover rounded-lg bg-black shrink-0" />
                <div className="min-w-0 flex-1 text-white">
                  <p className="text-xs font-bold truncate">Active Video Loaded</p>
                  <p className="text-[10px] text-white/60 truncate font-mono">{videoUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-white/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Caption & Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">Caption & Description</label>
              <span className="text-[10px] text-slate-400">{caption.length} / 300</span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write an engaging caption for your Reel... #NEMDAN #Viral"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-blue-500 transition-all resize-none text-slate-800"
            />

            {/* Quick Hashtag Chips */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {popularHashtags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendHashtag(tag)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Soundtrack Audio Track */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Soundtrack / Audio Name</label>
            <input
              type="text"
              value={audioTrack}
              onChange={(e) => setAudioTrack(e.target.value)}
              placeholder="e.g. Chill Synthwave • NEMDAN Audio"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-blue-500 transition-all text-slate-800"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {popularAudioTracks.map((trk, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAudioTrack(trk)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer truncate max-w-full"
                >
                  {trk}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail URL (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Cover Thumbnail (Optional)</label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Actions: Save Draft & Publish */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="submit"
              disabled={loading || !videoUrl}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Publishing Reel...' : 'Publish Reel to Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
