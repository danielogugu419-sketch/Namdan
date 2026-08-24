import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Heart, MessageCircle, 
  Share2, Bookmark, BookmarkCheck, MoreHorizontal, Send, 
  Globe, Users, Lock, MapPin, Music, Volume2, VolumeX, 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Check, UserPlus, 
  UserCheck, ShieldAlert, Flag, Trash2, ThumbsUp, Laugh, 
  Sparkles, Play, Pause, ExternalLink, Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post, ReactionType, PostComment } from '../types';
import { api } from '../services/api';

const REACTION_EMOJIS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600 dark:text-blue-400' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'text-rose-500' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-amber-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-amber-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-yellow-600' },
  { type: 'angry', emoji: '😡', label: 'Angry', color: 'text-orange-600' },
];

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '🙌', '😍', '😂', '🎉', '✨'];

export const FullscreenPostModal: React.FC = () => {
  const {
    activeFullscreenPost,
    closeFullscreenPost,
    currentUser,
    savedPostIds,
    toggleSavePost,
    isFollowingUser,
    toggleFollowUser,
    updatePostInFeed,
    refreshPosts,
    addToast,
    setSelectedUserId,
    setCurrentTab
  } = useApp() as any;

  if (!activeFullscreenPost) return null;

  const initialPost = activeFullscreenPost.post;
  const initialMediaIdx = activeFullscreenPost.initialMediaIndex || 0;

  return (
    <FullscreenPostModalContent 
      key={initialPost.id}
      post={initialPost}
      initialMediaIndex={initialMediaIdx}
      onClose={closeFullscreenPost}
    />
  );
};

interface ContentProps {
  post: Post;
  initialMediaIndex: number;
  onClose: () => void;
}

const FullscreenPostModalContent: React.FC<ContentProps> = ({ post: propPost, initialMediaIndex, onClose }) => {
  const {
    currentUser,
    savedPostIds,
    toggleSavePost,
    isFollowingUser,
    toggleFollowUser,
    updatePostInFeed,
    refreshPosts,
    addToast,
    setSelectedUserId,
    setCurrentTab
  } = useApp() as any;

  const [post, setPost] = useState<Post>(propPost);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(initialMediaIndex || 0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Video playback state
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Touch swipe state for mobile media carousel
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Interaction states
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<PostComment[]>(propPost.commentsList || []);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);

  // Normalized media items array
  const mediaItems = useMemo(() => {
    if (post.media && post.media.length > 0) {
      return post.media;
    }
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      return post.mediaUrls.map(url => ({
        type: (url.includes('.mp4') || url.includes('video')) ? ('video' as const) : ('image' as const),
        url
      }));
    }
    return [];
  }, [post.media, post.mediaUrls]);

  const hasMedia = mediaItems.length > 0;
  const currentMedia = hasMedia ? mediaItems[activeMediaIndex] : null;

  const isSaved = savedPostIds?.includes(post.id);
  const isFollowing = post.authorId ? isFollowingUser(post.authorId) : false;
  const isOwner = currentUser?.id === post.authorId;
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const userReaction = currentUser ? post.reactions?.find(r => r.userId === currentUser.id) : null;
  const currentReactionMeta = userReaction ? REACTION_EMOJIS.find(r => r.type === userReaction.type) : null;

  // Sync index if media length changes
  useEffect(() => {
    if (activeMediaIndex >= mediaItems.length) {
      setActiveMediaIndex(0);
    }
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [mediaItems.length]);

  // Load comments from backend on open
  useEffect(() => {
    let isMounted = true;
    api.getComments(post.id).then((res: any) => {
      if (isMounted && Array.isArray(res)) {
        setCommentsList(res);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [post.id]);

  // Reset zoom on index change
  const handleNextMedia = useCallback(() => {
    if (mediaItems.length <= 1) return;
    setActiveMediaIndex(prev => (prev + 1) % mediaItems.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [mediaItems.length]);

  const handlePrevMedia = useCallback(() => {
    if (mediaItems.length <= 1) return;
    setActiveMediaIndex(prev => (prev - 1 + mediaItems.length) % mediaItems.length);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [mediaItems.length]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.75, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.75, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleToggleZoom = () => {
    setZoomLevel(prev => {
      if (prev > 1) {
        setPanOffset({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when user is typing in comment input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNextMedia();
      } else if (e.key === 'ArrowLeft') {
        handlePrevMedia();
      } else if (e.key === ' ' && currentMedia?.type === 'video') {
        e.preventDefault();
        toggleVideoPlay();
      } else if (e.key.toLowerCase() === 'm' && currentMedia?.type === 'video') {
        e.preventDefault();
        setIsVideoMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNextMedia, handlePrevMedia, currentMedia]);

  // Video playback handlers
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
        setShowPlayOverlay(true);
        setTimeout(() => setShowPlayOverlay(false), 600);
      }).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
      setShowPlayOverlay(true);
      setTimeout(() => setShowPlayOverlay(false), 600);
    }
  };

  // Reactions handler
  const handleReact = async (type: ReactionType) => {
    if (!currentUser) {
      addToast('Sign in required', 'Please sign in to react to posts.', 'warning');
      return;
    }
    setShowReactionsMenu(false);
    try {
      const updated = await api.reactPost(post.id, currentUser.id, type);
      setPost(updated);
      updatePostInFeed(updated);
    } catch (err: any) {
      console.error('Error reacting to post:', err);
    }
  };

  // Add comment handler
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      addToast('Sign in required', 'Please sign in to comment.', 'warning');
      return;
    }
    if (!commentText.trim() || isSubmittingComment) return;

    const content = commentText.trim();
    setCommentText('');
    setIsSubmittingComment(true);

    // Optimistic comment creation
    const tempComment: PostComment = {
      id: `temp_${Date.now()}`,
      postId: post.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userVerified: currentUser.isVerified,
      content: content,
      createdAt: 'Just now',
      likesCount: 0
    };

    setCommentsList(prev => [...prev, tempComment]);
    setPost(prev => {
      const updated = { ...prev, commentsCount: (prev.commentsCount || 0) + 1 };
      updatePostInFeed(updated);
      return updated;
    });

    try {
      const savedComment = await api.addComment(post.id, currentUser.id, content);
      setCommentsList(prev => prev.map(c => c.id === tempComment.id ? savedComment : c));
      addToast('Comment Posted', 'Your reply has been added.', 'success');
      
      // Auto-scroll to bottom of comments
      setTimeout(() => {
        if (commentsScrollRef.current) {
          commentsScrollRef.current.scrollTop = commentsScrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (err: any) {
      addToast('Comment Failed', err.message || 'Could not post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    setShowOptionsMenu(false);
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.authorName}'s post on NEMDAN`,
          text: post.content,
          url: shareUrl
        });
        addToast('Shared!', 'Post shared successfully.', 'success');
        return;
      } catch {}
    }
    navigator.clipboard?.writeText?.(shareUrl);
    addToast('Link Copied!', 'Post permalink copied to clipboard.', 'success');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(post.id);
      await refreshPosts();
      addToast('Post Deleted', 'Your post was removed.', 'info');
      onClose();
    } catch (err: any) {
      addToast('Delete Error', err.message, 'error');
    }
  };

  const handleAuthorClick = () => {
    setSelectedUserId(post.authorId);
    setCurrentTab('profile');
    onClose();
  };

  const handleToggleFollow = () => {
    if (!currentUser) {
      addToast('Sign in required', 'Please sign in to follow creators.', 'warning');
      return;
    }
    toggleFollowUser(post.authorId, post.authorName);
  };

  // Interactive Poll Voting
  const handleVote = async (optionId: string) => {
    if (!currentUser) {
      addToast('Sign in required', 'Please sign in to vote.', 'warning');
      return;
    }
    try {
      const updated = await api.votePoll(post.id, currentUser.id, optionId);
      setPost(updated);
      updatePostInFeed(updated);
      addToast('Vote Recorded', 'Your poll vote has been submitted.', 'success');
    } catch (err: any) {
      addToast('Voting Error', err.message, 'error');
    }
  };

  const totalVotes = post.poll?.options.reduce((acc, opt) => acc + opt.votes, 0) || 0;

  // Touch Gestures for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null || zoomLevel > 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    // Horizontal swipe threshold (50px)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleNextMedia();
      } else {
        handlePrevMedia();
      }
    }
    // Vertical swipe down to dismiss
    else if (deltaY < -100 && Math.abs(deltaY) > Math.abs(deltaX)) {
      onClose();
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Image pan handler when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDraggingImage(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  return (
    <div 
      id="fullscreen-post-viewer"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center overflow-hidden animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Floating Mobile/Desktop Close Button */}
      <button
        id="fullscreen-close-btn"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-60 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-2xl"
        title="Close Viewer (Esc)"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Main Lightbox Modal Container */}
      <div 
        className="w-full h-full lg:h-[94vh] lg:max-w-6xl xl:max-w-7xl lg:rounded-3xl lg:border lg:border-white/10 bg-black lg:bg-slate-900 shadow-2xl overflow-hidden flex flex-col lg:flex-row relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================================= */}
        {/* LEFT / CENTER: MEDIA CANVAS & IMMERSIVE STAGE                             */}
        {/* ========================================================================= */}
        <div 
          className="flex-1 min-h-[40vh] sm:min-h-[50vh] lg:h-full bg-black flex flex-col justify-between relative overflow-hidden group"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Top Stage Badges & Controls */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
            {/* Media index counter badge */}
            {hasMedia && mediaItems.length > 1 && (
              <div className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wide shadow-lg">
                {activeMediaIndex + 1} / {mediaItems.length}
              </div>
            )}

            <div className="flex-1" />

            {/* Media Zoom & Sound Toolbar */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/15 text-white shadow-lg">
              {currentMedia?.type === 'video' ? (
                <button
                  onClick={() => setIsVideoMuted(prev => !prev)}
                  className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                  title={isVideoMuted ? 'Unmute' : 'Mute'}
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ) : currentMedia?.type === 'image' ? (
                <>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToggleZoom}
                    className="px-2 py-0.5 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                    title="Toggle 1x/2x"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Active Media Renderer Stage */}
          <div className="flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
            
            {/* 1. Multiple or Single Media Viewer */}
            {hasMedia && currentMedia ? (
              currentMedia.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                    onClick={toggleVideoPlay}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setVideoProgress(videoRef.current.currentTime);
                        setVideoDuration(videoRef.current.duration || 0);
                      }
                    }}
                    className="max-h-full max-w-full object-contain cursor-pointer brightness-100 contrast-100 filter-none"
                    style={{
                      filter: 'none',
                      WebkitTransform: 'translateZ(0)',
                      transform: 'translateZ(0)'
                    }}
                  />

                  {/* Centered Play/Pause Ripple Indicator */}
                  {showPlayOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-out fade-out zoom-out-50 duration-500">
                      <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-2xl">
                        {isVideoPlaying ? <Play className="w-8 h-8 fill-white ml-1" /> : <Pause className="w-8 h-8 fill-white" />}
                      </div>
                    </div>
                  )}

                  {/* Video Play/Pause floating bottom indicator */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-white text-xs">
                    <button onClick={toggleVideoPlay} className="cursor-pointer hover:text-blue-400 transition-colors">
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    
                    {/* Scrub Progress Bar */}
                    <div 
                      className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                      onClick={(e) => {
                        if (!videoRef.current || !videoDuration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percent = clickX / rect.width;
                        videoRef.current.currentTime = percent * videoDuration;
                      }}
                    >
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0}%` }}
                      />
                    </div>

                    <span className="font-mono text-[11px] text-white/80">
                      {Math.floor(videoProgress)}s / {Math.floor(videoDuration || 0)}s
                    </span>

                    <button 
                      onClick={() => setIsVideoMuted(prev => !prev)}
                      className="cursor-pointer hover:text-blue-400"
                    >
                      {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  onDoubleClick={handleToggleZoom}
                >
                  <img
                    src={currentMedia.url}
                    alt="Full-screen post attachment"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                      cursor: zoomLevel > 1 ? (isDraggingImage ? 'grabbing' : 'grab') : 'zoom-in',
                      transition: isDraggingImage ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                    draggable={false}
                  />
                </div>
              )
            ) : post.backgroundGradient ? (
              /* 2. Gradient / Display Text Canvas */
              <div className={`w-full max-w-lg p-10 sm:p-14 rounded-3xl ${post.backgroundGradient} text-white shadow-2xl flex items-center justify-center text-center my-auto`}>
                <p className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug drop-shadow-md">
                  {post.content}
                </p>
              </div>
            ) : (
              /* 3. Text Post Stage Canvas */
              <div className="w-full max-w-lg p-8 sm:p-12 bg-slate-900/90 border border-slate-800 rounded-3xl text-white shadow-2xl text-left my-auto space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{post.authorName}</h4>
                    <p className="text-xs text-slate-400">{post.createdAt}</p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-slate-100 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>
            )}

            {/* Previous Navigation Chevron */}
            {hasMedia && mediaItems.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 transition-all hover:scale-110 shadow-2xl cursor-pointer"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Next Navigation Chevron */}
            {hasMedia && mediaItems.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 transition-all hover:scale-110 shadow-2xl cursor-pointer"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

          </div>

          {/* Bottom Pagination Dots & Thumbnails Carousel */}
          {hasMedia && mediaItems.length > 1 && (
            <div className="p-3 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-2 z-20">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMediaIndex(idx);
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeMediaIndex === idx
                      ? 'border-blue-500 scale-105 ring-2 ring-blue-500/50 shadow-md'
                      : 'border-transparent opacity-50 hover:opacity-100 hover:scale-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : (
                    <img src={item.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT / BOTTOM: AUTHOR INFO, CAPTION, ACTIONS & COMMENTS THREAD           */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col h-[50vh] sm:h-[45vh] lg:h-full shrink-0 shadow-xl overflow-hidden">
          
          {/* 1. Header: Author, Follow Button, Options Menu */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={handleAuthorClick}
                className="cursor-pointer relative shrink-0"
              >
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-all"
                />
              </button>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleAuthorClick}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate"
                  >
                    {post.authorName}
                  </button>
                  {post.authorVerified && (
                    <span className="w-3.5 h-3.5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  <span>{post.createdAt}</span>
                  <span>•</span>
                  {post.audience === 'public' && <Globe className="w-3 h-3 text-slate-400" />}
                  {post.audience === 'friends' && <Users className="w-3 h-3 text-slate-400" />}
                  {post.audience === 'only_me' && <Lock className="w-3 h-3 text-slate-400" />}
                  {post.location && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" /> {post.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Follow Button & Options */}
            <div className="flex items-center gap-2 shrink-0">
              {!isOwner && (
                <button
                  onClick={handleToggleFollow}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}

              {/* 3-Dots Options Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        toggleSavePost(post.id);
                        setShowOptionsMenu(false);
                        addToast(isSaved ? 'Removed from Bookmarks' : 'Saved to Bookmarks', '', 'info');
                      }}
                      className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-teal-600" /> : <Bookmark className="w-4 h-4 text-blue-600" />}
                      <span>{isSaved ? 'Unsave Post' : 'Save to Bookmarks'}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        addToast('Report Submitted', 'Post submitted to the NEMDAN AI & Admin Moderation Queue for review.', 'info');
                      }}
                      className="w-full px-3.5 py-2 text-left text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <Flag className="w-4 h-4 text-amber-600" />
                      <span>Report to Safety Queue</span>
                    </button>

                    {(isOwner || isSuperAdmin) && (
                      <>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                        <button
                          onClick={handleDelete}
                          className="w-full px-3.5 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Post</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body: Caption, Poll, Audio Track, and Comments Thread */}
          <div 
            ref={commentsScrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100 dark:divide-slate-800"
          >
            {/* Post Caption with hashtags/mentions highlighting */}
            {post.content && !post.backgroundGradient && (
              <div className="space-y-2 pb-3">
                <div className="flex items-start gap-3">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    <span className="font-bold text-slate-900 dark:text-white mr-1.5">{post.authorName}</span>
                    {post.content.split(' ').map((word, i) => {
                      if (word.startsWith('#')) {
                        return <span key={i} className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">{word} </span>;
                      }
                      if (word.startsWith('@')) {
                        return <span key={i} className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer">{word} </span>;
                      }
                      return word + ' ';
                    })}
                  </div>
                </div>

                {/* Audio Track Visualizer (if present) */}
                {post.audioUrl && (
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Audio Track</p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400">NEMDAN Hi-Fi Spatial Audio</p>
                    </div>
                    <audio src={post.audioUrl} controls className="h-7 w-36" />
                  </div>
                )}

                {/* Interactive Poll in Fullscreen Modal */}
                {post.poll && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{post.poll.question}</h5>
                    <div className="space-y-1.5">
                      {post.poll.options.map(opt => {
                        const hasVoted = currentUser && opt.voterIds?.includes(currentUser.id);
                        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleVote(opt.id)}
                            className={`w-full relative overflow-hidden rounded-xl border p-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                              hasVoted
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100/70 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-blue-100/80 dark:bg-blue-900/50 rounded-xl transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between">
                              <span>{opt.text} {hasVoted && '✓'}</span>
                              <span className="font-mono text-slate-600 dark:text-slate-400">{percentage}% ({opt.votes})</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments List */}
            <div className="pt-3 space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Comments ({commentsList.length})
              </h4>

              {commentsList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <MessageCircle className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-medium">No comments yet.</p>
                  <p className="text-[11px]">Be the first to share your thoughts!</p>
                </div>
              ) : (
                commentsList.map(comment => (
                  <div key={comment.id} className="flex items-start gap-2.5 group">
                    <img 
                      src={comment.userAvatar} 
                      alt={comment.userName} 
                      className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0" 
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                          {comment.userVerified && (
                            <span className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center text-[7px] text-white">✓</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Action Bar: Reactions & Interaction Buttons */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 space-y-2">
            
            {/* Reaction Counts & Shares summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
              <div className="flex items-center gap-1.5">
                {post.reactions && post.reactions.length > 0 ? (
                  <div className="flex items-center -space-x-1">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[10px]">👍</span>
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-rose-950 flex items-center justify-center text-[10px]">❤️</span>
                    <span className="ml-2 font-bold text-slate-700 dark:text-slate-300">{post.reactions.length}</span>
                  </div>
                ) : (
                  <span>Be the first to react</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span>{commentsList.length} comments</span>
                <span>•</span>
                <span>{post.sharesCount || 0} shares</span>
              </div>
            </div>

            {/* Interaction Buttons Bar */}
            <div className="grid grid-cols-4 gap-1 relative pt-1">
              
              {/* Multi-reactions Popover */}
              {showReactionsMenu && (
                <div 
                  onMouseLeave={() => setShowReactionsMenu(false)}
                  className="absolute -top-12 left-1 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 flex items-center gap-2 z-40 animate-in zoom-in-90 duration-150"
                >
                  {REACTION_EMOJIS.map(r => (
                    <button
                      key={r.type}
                      onClick={() => handleReact(r.type)}
                      className="text-xl hover:scale-135 transition-transform duration-150 p-1 cursor-pointer"
                      title={r.label}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* React Button */}
              <button
                onClick={() => handleReact(userReaction ? 'like' : 'like')}
                onMouseEnter={() => setShowReactionsMenu(true)}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  currentReactionMeta ? `${currentReactionMeta.color} bg-blue-50 dark:bg-blue-950/40` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {currentReactionMeta ? (
                  <>
                    <span className="text-base">{currentReactionMeta.emoji}</span>
                    <span className="hidden sm:inline">{currentReactionMeta.label}</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Like</span>
                  </>
                )}
              </button>

              {/* Comment Button */}
              <button
                onClick={() => commentInputRef.current?.focus()}
                className="py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Comment</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Save Button */}
              <button
                onClick={() => {
                  toggleSavePost(post.id);
                  addToast(isSaved ? 'Removed from Bookmarks' : 'Saved to Bookmarks', '', 'info');
                }}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  isSaved 
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-teal-600" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Quick Emoji Bar */}
            <div className="flex items-center justify-between pt-1 px-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Quick reaction:</span>
              <div className="flex items-center gap-1">
                {QUICK_EMOJIS.map((em, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCommentText(prev => prev + em);
                      commentInputRef.current?.focus();
                    }}
                    className="text-base hover:scale-125 transition-transform p-0.5 cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 4. Bottom Comment Composer Field */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            {currentUser ? (
              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full object-cover shrink-0" 
                />
                <div className="flex-1 relative flex items-center">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={isSubmittingComment}
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-full text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="absolute right-1.5 p-1.5 rounded-full bg-blue-600 disabled:opacity-40 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs text-slate-500">Sign in to leave a comment.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
