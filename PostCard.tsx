import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  CheckCircle, Globe, Users, Lock, MapPin, 
  Music, Bookmark, ShieldAlert, Trash2, Send, 
  ThumbsUp, Laugh, Sparkles, Volume2, Flag, 
  BookmarkCheck, Maximize2
} from 'lucide-react';
import { Post, ReactionType } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const REACTION_EMOJIS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600 dark:text-blue-400' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'text-rose-500' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-amber-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-amber-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-yellow-600' },
  { type: 'angry', emoji: '😡', label: 'Angry', color: 'text-orange-600' },
];

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { 
    currentUser, 
    refreshPosts, 
    addToast, 
    setCurrentTab, 
    setSelectedUserId,
    savedPostIds,
    toggleSavePost,
    openFullscreenPost
  } = useApp() as any;

  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState(post.commentsList || []);
  const [localPost, setLocalPost] = useState(post);

  const isSaved = savedPostIds?.includes(localPost.id);

  // Identify current user's reaction
  const userReaction = currentUser ? localPost.reactions?.find(r => r.userId === currentUser.id) : null;
  const currentReactionMeta = userReaction ? REACTION_EMOJIS.find(r => r.type === userReaction.type) : null;

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked inside interactive controls, do not trigger modal
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('form') || target.closest('audio')) {
      return;
    }
    openFullscreenPost?.(localPost, 0);
  };

  const handleReact = async (type: ReactionType) => {
    if (!currentUser) {
      addToast('Sign in required', 'Please sign in to react to posts.', 'warning');
      return;
    }
    setShowReactionsMenu(false);
    try {
      const updated = await api.reactPost(localPost.id, currentUser.id, type);
      setLocalPost(updated);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!currentUser) {
      addToast('Sign in required', 'Please sign in to vote in community polls.', 'warning');
      return;
    }
    try {
      const updated = await api.votePoll(localPost.id, currentUser.id, optionId);
      setLocalPost(updated);
      addToast('Vote Recorded', 'Your poll vote has been submitted.', 'success');
    } catch (err: any) {
      addToast('Voting Error', err.message, 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim()) return;

    try {
      const newComment = await api.addComment(localPost.id, currentUser.id, commentText.trim());
      setCommentsList(prev => [...prev, newComment]);
      setCommentText('');
      setLocalPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      addToast('Comment Posted', 'Your reply has been added.', 'success');
    } catch (err: any) {
      addToast('Comment Error', err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePost(localPost.id);
      await refreshPosts();
      addToast('Post Deleted', 'The post was removed.', 'info');
    } catch (err: any) {
      addToast('Delete Error', err.message, 'error');
    }
  };

  const handleReport = () => {
    addToast('Report Submitted', 'Post submitted to the NEMDAN AI & Admin Moderation Queue for review.', 'info');
    setShowOptionsMenu(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    addToast('Link Copied!', 'Post permalink copied to clipboard.', 'success');
  };

  const totalVotes = localPost.poll?.options.reduce((acc, opt) => acc + opt.votes, 0) || 0;
  const isOwnerOrAdmin = currentUser?.id === localPost.authorId || currentUser?.role === 'super_admin';

  return (
    <article 
      id={`post-${localPost.id}`} 
      onClick={handleCardClick}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs mb-4 overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group/post"
    >
      
      {/* Moderation Alert Banner (if under review) */}
      {localPost.moderationStatus === 'flagged' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>AI Moderation Flag: Under review by NEMDAN Trust & Safety</span>
          </div>
          <span className="font-semibold text-[10px] bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">Pending</span>
        </div>
      )}

      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserId(localPost.authorId);
              setCurrentTab('profile');
            }}
            className="cursor-pointer shrink-0"
          >
            <img
              src={localPost.authorAvatar}
              alt={localPost.authorName}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-all"
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUserId(localPost.authorId);
                  setCurrentTab('profile');
                }}
                className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate cursor-pointer"
              >
                {localPost.authorName}
              </button>
              {localPost.authorVerified && (
                <span className="w-3.5 h-3.5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">
              <span>{localPost.createdAt}</span>
              <span>•</span>
              {localPost.audience === 'public' && <Globe className="w-3 h-3 text-slate-400" />}
              {localPost.audience === 'friends' && <Users className="w-3 h-3 text-slate-400" />}
              {localPost.audience === 'only_me' && <Lock className="w-3 h-3 text-slate-400" />}
              {localPost.location && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" /> {localPost.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3-Dots Options Menu & Fullscreen Trigger */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openFullscreenPost?.(localPost, 0);
            }}
            className="p-2 rounded-full text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open Fullscreen Viewer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsMenu(!showOptionsMenu);
              }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in duration-100 text-xs font-medium"
              >
                <button
                  onClick={(e) => { 
                    e.stopPropagation();
                    toggleSavePost(localPost.id); 
                    setShowOptionsMenu(false); 
                    addToast(isSaved ? 'Removed from Saved' : 'Saved to Bookmarks', '', 'info'); 
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{isSaved ? 'Unsave Post' : 'Save to Bookmarks'}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); setShowOptionsMenu(false); }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReport(); }}
                  className="w-full px-3.5 py-2 text-left text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <Flag className="w-4 h-4 text-amber-600" />
                  <span>Report to Safety Queue</span>
                </button>

                {isOwnerOrAdmin && (
                  <>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
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

      {/* Post Text or Gradient Box */}
      {localPost.backgroundGradient ? (
        <div 
          onClick={() => openFullscreenPost?.(localPost, 0)}
          className={`my-1 p-8 text-center text-lg sm:text-xl font-bold ${localPost.backgroundGradient} text-white shadow-inner flex items-center justify-center min-h-[140px] cursor-pointer hover:opacity-95 transition-opacity`}
        >
          <p className="max-w-md">{localPost.content}</p>
        </div>
      ) : (
        localPost.content && (
          <div 
            onClick={() => openFullscreenPost?.(localPost, 0)}
            className="px-4 sm:px-5 pb-3 cursor-pointer"
          >
            <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {localPost.content}
            </p>
          </div>
        )
      )}

      {/* Media Gallery / Video Player */}
      {(() => {
        const displayMedia = (localPost.media && localPost.media.length > 0)
          ? localPost.media
          : (localPost.mediaUrls && localPost.mediaUrls.length > 0)
            ? localPost.mediaUrls.map(url => ({
                type: (url.includes('.mp4') || url.includes('video')) ? ('video' as const) : ('image' as const),
                url
              }))
            : [];

        if (displayMedia.length === 0) return null;

        return (
          <div className={`grid gap-1 ${displayMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {displayMedia.map((item, idx) => (
              <div 
                key={idx} 
                onClick={(e) => {
                  e.stopPropagation();
                  openFullscreenPost?.(localPost, idx);
                }}
                className="relative bg-slate-950 overflow-hidden max-h-[420px] cursor-pointer group/media"
              >
                {item.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full max-h-[420px] object-contain pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover/media:bg-black/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl group-hover/media:scale-110 transition-transform">
                        <Volume2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={item.url}
                      alt="Post attachment"
                      className="w-full h-full max-h-[420px] object-cover group-hover/media:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Audio Track Visualizer Bar */}
      {localPost.audioUrl && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="mx-4 sm:mx-5 my-2 p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 rounded-2xl flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Music className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Audio Track Attached</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400">NEMDAN Hi-Fi Spatial Audio</p>
          </div>
          <audio src={localPost.audioUrl} controls className="h-8 w-40 sm:w-48" />
        </div>
      )}

      {/* Interactive Poll */}
      {localPost.poll && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="mx-4 sm:mx-5 my-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2.5"
        >
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{localPost.poll.question}</h4>
          <div className="space-y-2">
            {localPost.poll.options.map(opt => {
              const hasVoted = currentUser && opt.voterIds?.includes(currentUser.id);
              const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  className={`w-full relative overflow-hidden rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                    hasVoted
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200'
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
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right">{totalVotes} total votes</p>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="px-4 sm:px-5 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          {localPost.reactions && localPost.reactions.length > 0 ? (
            <div className="flex items-center -space-x-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[10px]">👍</span>
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-rose-950 flex items-center justify-center text-[10px]">❤️</span>
              <span className="ml-2 font-bold text-slate-700 dark:text-slate-300">{localPost.reactions.length}</span>
            </div>
          ) : (
            <span>Be the first to react</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              openFullscreenPost?.(localPost, 0);
            }} 
            className="hover:underline cursor-pointer"
          >
            {commentsList.length} comments
          </button>
          <span>•</span>
          <span>{localPost.sharesCount || 0} shares</span>
        </div>
      </div>

      {/* Reaction / Comment / Share Action Buttons */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="px-2 py-1.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-4 gap-1 relative"
      >
        
        {/* Multi-reactions Popover */}
        {showReactionsMenu && (
          <div 
            onMouseLeave={() => setShowReactionsMenu(false)}
            className="absolute -top-12 left-2 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 flex items-center gap-2 z-40 animate-in zoom-in-90 duration-150"
          >
            {REACTION_EMOJIS.map(r => (
              <button
                key={r.type}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReact(r.type);
                }}
                className="text-xl hover:scale-135 transition-transform duration-150 p-1 cursor-pointer"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        {/* React button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReact(userReaction ? 'like' : 'like');
          }}
          onMouseEnter={() => setShowReactionsMenu(true)}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
            currentReactionMeta ? `${currentReactionMeta.color} bg-blue-50/50 dark:bg-blue-950/40` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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

        {/* Comment button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openFullscreenPost?.(localPost, 0);
          }}
          className="py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        {/* Share button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Bookmark / Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSavePost(localPost.id);
            addToast(isSaved ? 'Removed from Bookmarks' : 'Saved to Bookmarks', '', 'info');
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
            isSaved 
              ? 'text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/40'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isSaved ? 'Unsave' : 'Save'}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <Bookmark className="w-4 h-4" />}
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

      </div>

      {/* Expanded Comments Thread */}
      {showComments && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-3"
        >
          {/* Add Comment Field */}
          {currentUser && (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a supportive reply..."
                className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* List Comments */}
          <div className="space-y-2.5 pt-1">
            {commentsList.map(comment => (
              <div key={comment.id} className="flex items-start gap-2.5">
                <img src={comment.userAvatar} alt={comment.userName} className="w-7 h-7 rounded-full object-cover mt-0.5" />
                <div className="flex-1 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </article>
  );
};

