import React from 'react';
import { Plus, CheckCircle, Sparkles, Clock, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoryItem } from '../types';

export const StoriesBar: React.FC = () => {
  const { 
    currentUser, 
    stories = [], 
    setActiveStoryModal, 
    setShowCreateStory 
  } = useApp() as any;

  // Filter out any story older than 24 hours
  const now = Date.now();
  const validStories = stories.filter((s: StoryItem) => {
    if (!s.expiresAt) return true;
    return new Date(s.expiresAt).getTime() > now;
  });

  // Current user's stories
  const myStories = validStories.filter((s: StoryItem) => s.userId === currentUser?.id);

  // Group other creators' stories
  const otherStories = validStories.filter((s: StoryItem) => s.userId !== currentUser?.id);
  const groupedOtherStories: { user: any; items: StoryItem[] }[] = [];
  
  otherStories.forEach((story: StoryItem) => {
    const existing = groupedOtherStories.find(g => g.user.id === story.userId);
    if (existing) {
      existing.items.push(story);
    } else {
      groupedOtherStories.push({
        user: {
          id: story.userId,
          name: story.userName,
          avatar: story.userAvatar,
          isVerified: story.userVerified
        },
        items: [story]
      });
    }
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-4">
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
        
        {/* ============================================================ */}
        {/* 1. "YOUR STORY" / CREATE STORY CARD */}
        {/* ============================================================ */}
        {myStories.length > 0 ? (
          /* User has active stories -> Card with active ring & tap to view or add */
          <div className="shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl relative overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left p-3 flex flex-col justify-between group shadow-xs hover:shadow-md transition-all">
            {/* Background latest story thumbnail */}
            <div 
              onClick={() => setActiveStoryModal({ index: 0, stories: myStories })}
              className="absolute inset-0 cursor-pointer"
            >
              {myStories[0].mediaUrl ? (
                <img
                  src={myStories[0].mediaUrl}
                  alt="Your Story"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-tr ${myStories[0].backgroundGradient || 'from-indigo-600 to-purple-800'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50" />
            </div>

            {/* Top User Avatar with Glowing Story Ring */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <button
                onClick={() => setActiveStoryModal({ index: 0, stories: myStories })}
                className="w-9 h-9 rounded-full ring-2 ring-gradient-to-r ring-amber-400 via-rose-500 ring-offset-2 ring-offset-black/60 overflow-hidden bg-slate-700 cursor-pointer shadow-md"
                title="View Your Stories"
              >
                <img 
                  src={currentUser?.avatar} 
                  alt={currentUser?.name} 
                  className="w-full h-full object-cover" 
                />
              </button>

              {/* Add Story Button (+) */}
              <button
                id="add-another-story-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateStory(true);
                }}
                className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border border-white/40 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="Add Another Story"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Bottom Label & Viewer Count */}
            <div 
              onClick={() => setActiveStoryModal({ index: 0, stories: myStories })}
              className="relative z-10 cursor-pointer"
            >
              <p className="text-white text-xs font-bold leading-tight drop-shadow-sm flex items-center gap-1">
                <span>Your Story</span>
              </p>
              <p className="text-[10px] text-amber-300 font-semibold drop-shadow-xs flex items-center gap-1 mt-0.5">
                <Eye className="w-3 h-3" />
                <span>{myStories[0].viewers?.length || 0} views</span>
                <span className="text-white/60">• {myStories.length}</span>
              </p>
            </div>
          </div>
        ) : (
          /* User has NO active story -> Standard Create Card */
          <button
            id="create-story-card-btn"
            onClick={() => setShowCreateStory(true)}
            className="shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl relative overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-between text-center transition-all group cursor-pointer shadow-xs hover:shadow-md"
          >
            {/* Top User Avatar Photo */}
            <div className="w-full h-28 sm:h-32 overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt="My Avatar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Plus Button in Center Seam */}
            <div className="absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-blue-700 transition-all">
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>

            {/* Bottom Label */}
            <div className="pb-3 px-1 w-full mt-3">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Your Story
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                Share a moment
              </p>
            </div>
          </button>
        )}

        {/* ============================================================ */}
        {/* 2. CREATOR STORY CARDS */}
        {/* ============================================================ */}
        {groupedOtherStories.map((group) => {
          const firstStory = group.items[0];
          return (
            <button
              key={group.user.id}
              id={`story-card-${group.user.id}`}
              onClick={() => setActiveStoryModal({ index: 0, stories: group.items })}
              className="shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl relative overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left p-3 flex flex-col justify-between group cursor-pointer hover:shadow-md transition-all shadow-xs"
            >
              {/* Background Media Thumbnail */}
              {firstStory.mediaUrl ? (
                <img
                  src={firstStory.mediaUrl}
                  alt={group.user.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-tr ${firstStory.backgroundGradient || 'from-indigo-600 to-purple-800'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

              {/* Creator Profile Avatar with Unread Gradient Ring */}
              <div className="relative z-10 w-9 h-9 rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-black/60 overflow-hidden bg-slate-700 shadow-md">
                <img 
                  src={group.user.avatar} 
                  alt={group.user.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Creator Name & Story Count */}
              <div className="relative z-10">
                <p className="text-white text-xs font-bold leading-tight line-clamp-1 drop-shadow-sm flex items-center gap-1">
                  {group.user.name.split(' ')[0]}
                  {group.user.isVerified && (
                    <CheckCircle className="w-3 h-3 text-blue-400 fill-blue-400 shrink-0" />
                  )}
                </p>
                <p className="text-[10px] text-slate-300 font-medium drop-shadow-xs">
                  {group.items.length} {group.items.length === 1 ? 'update' : 'updates'}
                </p>
              </div>
            </button>
          );
        })}

      </div>
    </div>
  );
};
