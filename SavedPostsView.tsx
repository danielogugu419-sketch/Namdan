import React, { useState } from 'react';
import { 
  Bookmark, Trash2, ExternalLink, Image, 
  Film, MessageSquare, Heart, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { PullToRefresh } from './PullToRefresh';

export const SavedPostsView: React.FC = () => {
  const { 
    posts, 
    refreshPosts,
    savedPostIds, 
    toggleSavePost, 
    setCurrentTab, 
    setSelectedUserId,
    addToast 
  } = useApp() as any;

  const [activeFilter, setActiveFilter] = useState<'all' | 'media' | 'posts'>('all');

  const savedPosts = posts.filter((p: any) => savedPostIds.includes(p.id));

  const handlePullRefresh = async () => {
    if (refreshPosts) await refreshPosts();
    addToast('Bookmarks Refreshed', 'Saved items updated.', 'info');
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh} label="Saved Bookmarks">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-20">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Saved Bookmarks
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only you can see items saved in your private vault
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            {savedPosts.length} saved
          </span>
        </div>

        {/* Content */}
        {savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">No saved posts yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Click the bookmark icon on any post in your feed to save articles, photos, and ideas for later.
            </p>
            <button
              onClick={() => setCurrentTab('feed')}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
            >
              Explore Feed
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </PullToRefresh>
  );
};
