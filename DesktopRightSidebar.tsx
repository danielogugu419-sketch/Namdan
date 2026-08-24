import React from 'react';
import { 
  TrendingUp, UserPlus, MessageSquare, ShieldCheck, 
  Sparkles, ExternalLink, Hash, Flame, Users 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUsers, initialGroups, initialPages } from '../server/db';
import { api } from '../services/api';

export const DesktopRightSidebar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentTab, 
    setSelectedUserId, 
    setSelectedGroupId,
    setSelectedPageId,
    setFloatingChatUser, 
    addToast 
  } = useApp() as any;

  const suggestedUsers = initialUsers.filter(u => u.id !== currentUser?.id).slice(0, 3);
  const onlineContacts = initialUsers.filter(u => u.id !== currentUser?.id).slice(0, 4);

  const trendingTopics = [
    { tag: '#NEMDANLaunch', count: '142K posts', category: 'Technology' },
    { tag: '#CreatorEconomy2026', count: '89K posts', category: 'Creator Studio' },
    { tag: '#CODMarketplaceSafety', count: '64K posts', category: 'Shopping' },
    { tag: '#GeminiAIModeration', count: '38K posts', category: 'Safety & Trust' },
  ];

  const handleAddFriend = async (userId: string) => {
    if (!currentUser) return;
    try {
      await api.toggleFriend(userId, currentUser.id);
      addToast('Request Sent', 'Friend request delivered.', 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <aside className="hidden xl:block w-72 shrink-0 space-y-4 sticky top-20">
      
      {/* 1. Online Contacts & Instant Chat */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Online Contacts
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">{onlineContacts.length} active</span>
        </div>

        <div className="space-y-2">
          {onlineContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setFloatingChatUser(contact)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {contact.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Active now
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Suggested Connections */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Suggested for You
          </h3>
          <button 
            onClick={() => setCurrentTab('friends')}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-2">
              <div 
                onClick={() => {
                  setSelectedUserId(user.id);
                  setCurrentTab('profile');
                }}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    @{user.username || 'user'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAddFriend(user.id)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Trending on NEMDAN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Trending Topics
          </h3>
        </div>

        <div className="space-y-2.5">
          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              onClick={() => {
                addToast('Trending', `Filtering by ${topic.tag}`, 'info');
              }}
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold">{topic.category}</span>
                <span className="text-[10px] text-slate-400">{topic.count}</span>
              </div>
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-0.5">
                {topic.tag}
              </p>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
