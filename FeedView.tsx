import React, { useState } from 'react';
import { 
  RefreshCw, Sparkles, SlidersHorizontal, 
  Flame, Clock, Users, ArrowUp, Inbox
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoriesBar } from './StoriesBar';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { PullToRefresh } from './PullToRefresh';

export const FeedView: React.FC = () => {
  const { 
    currentUser, 
    posts, 
    refreshPosts, 
    refreshFeedData,
    setShowCreatePost, 
    setCurrentTab, 
    addToast 
  } = useApp() as any;

  const [activeFeedTab, setActiveFeedTab] = useState<'for_you' | 'following' | 'recent'>('for_you');
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    if (refreshFeedData) {
      await refreshFeedData();
    } else {
      await refreshPosts();
    }
    setRefreshing(false);
    addToast('Feed Updated', 'Loaded the latest stories and posts.', 'info');
  };

  const handlePullRefresh = async () => {
    if (refreshFeedData) {
      await refreshFeedData();
    } else {
      await refreshPosts();
    }
    addToast('Feed Updated', 'Loaded the latest stories and posts.', 'info');
  };

  // Filter posts based on tab
  const filteredPosts = posts.filter((p: any) => {
    if (activeFeedTab === 'following') {
      return p.authorId !== currentUser?.id;
    }
    return true;
  });

  return (
    <PullToRefresh onRefresh={handlePullRefresh} label="Feed">
      <div className="space-y-4 max-w-2xl mx-auto w-full pb-20">
      
      {/* 1. Stories Bar (Requirement 5) */}
      <StoriesBar />

      {/* 2. Post Composer (Requirement 4) */}
      <PostComposer />

      {/* 3. Feed Filter Tabs & Refresh (Requirement 1, 6) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 sm:px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="feed-tab-for-you"
            onClick={() => setActiveFeedTab('for_you')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFeedTab === 'for_you' 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For You</span>
            </span>
          </button>

          <button
            id="feed-tab-following"
            onClick={() => setActiveFeedTab('following')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFeedTab === 'following' 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Following</span>
            </span>
          </button>

          <button
            id="feed-tab-recent"
            onClick={() => setActiveFeedTab('recent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFeedTab === 'recent' 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </span>
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className={`p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer ${
            refreshing ? 'animate-spin text-blue-600' : ''
          }`}
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Posts Stream (Requirement 6) */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
              No posts in this feed yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Be the first to share an update, photo, or thought with the NEMDAN community!
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
            >
              Create Post
            </button>
          </div>
        )}
      </div>
      </div>
    </PullToRefresh>
  );
};
