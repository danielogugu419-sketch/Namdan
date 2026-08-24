import React from 'react';
import { 
  X, PenSquare, Image, Film, ShoppingBag, 
  Users, Flag, Sparkles, ChevronRight, PlusCircle, Radio 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickCreateModal: React.FC = () => {
  const { 
    showQuickCreate, 
    setShowQuickCreate, 
    setShowCreatePost, 
    setShowCreateStory, 
    setShowUploadReel, 
    setShowCreateListing, 
    setShowCreateGroup, 
    setShowCreatePage,
    setShowGoLiveModal
  } = useApp() as any;

  if (!showQuickCreate) return null;

  const creationOptions = [
    {
      id: 'live',
      title: 'Go Live (Broadcast)',
      description: 'Stream video live with real-time viewer chat & reactions',
      icon: Radio,
      iconBg: 'bg-gradient-to-tr from-rose-600 to-red-600 text-white',
      badge: 'LIVE NOW',
      action: () => {
        setShowQuickCreate(false);
        setShowGoLiveModal(true);
      }
    },
    {
      id: 'post',
      title: 'Create Post',
      description: 'Share thoughts, photos, galleries, polls, and updates',
      icon: PenSquare,
      iconBg: 'bg-blue-600 dark:bg-blue-500 text-white',
      badge: 'Feed',
      action: () => {
        setShowQuickCreate(false);
        setShowCreatePost(true);
      }
    },
    {
      id: 'story',
      title: 'Add to Story',
      description: 'Share moments that disappear in 24 hours',
      icon: Image,
      iconBg: 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white',
      badge: '24h',
      action: () => {
        setShowQuickCreate(false);
        setShowCreateStory(true);
      }
    },
    {
      id: 'reel',
      title: 'Upload Reel',
      description: 'Vertical 9:16 short video with music & effects',
      icon: Film,
      iconBg: 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white',
      badge: 'Trending',
      action: () => {
        setShowQuickCreate(false);
        setShowUploadReel(true);
      }
    },
    {
      id: 'marketplace',
      title: 'List an Item',
      description: 'Sell products with verified Cash on Delivery support',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-600 dark:bg-emerald-500 text-white',
      badge: 'COD Safe',
      action: () => {
        setShowQuickCreate(false);
        setShowCreateListing(true);
      }
    },
    {
      id: 'group',
      title: 'Create Group',
      description: 'Build a community around shared interests',
      icon: Users,
      iconBg: 'bg-purple-600 dark:bg-purple-500 text-white',
      badge: 'Community',
      action: () => {
        setShowQuickCreate(false);
        setShowCreateGroup(true);
      }
    },
    {
      id: 'page',
      title: 'Create Page',
      description: 'Official presence for your brand, business, or project',
      icon: Flag,
      iconBg: 'bg-cyan-600 dark:bg-cyan-500 text-white',
      badge: 'Official',
      action: () => {
        setShowQuickCreate(false);
        setShowCreatePage(true);
      }
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Create on NEMDAN</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose what you would like to publish</p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickCreate(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[75vh] overflow-y-auto">
          {creationOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={opt.action}
                className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-slate-700 transition-all text-left group cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-2xl ${opt.iconBg} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {opt.title}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {opt.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>AI Moderation active for community safety</span>
          </div>
          <button
            onClick={() => setShowQuickCreate(false)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
