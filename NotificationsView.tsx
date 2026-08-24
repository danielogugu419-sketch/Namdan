import React, { useState } from 'react';
import { 
  Bell, Heart, MessageSquare, UserPlus, 
  ShoppingBag, ShieldAlert, Sparkles, Check, 
  Trash2, Filter 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';
import { PullToRefresh } from './PullToRefresh';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    refreshNotifications,
    markNotificationsAsRead, 
    setCurrentTab, 
    setSelectedUserId,
    addToast 
  } = useApp() as any;

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleRefresh = async () => {
    if (refreshNotifications) {
      await refreshNotifications();
    }
    addToast('Notifications Updated', 'Fetched the latest activity & alerts.', 'info');
  };

  const filteredNotifs = notifications.filter((n: NotificationItem) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'reaction':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case 'marketplace_order':
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case 'moderation_alert':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} label="Notifications">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-blue-600" /> Notification Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Stay updated on reactions, mentions, COD orders, and security alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter === 'unread' ? 'Showing Unread' : 'Filter Unread'}
            </button>

            <button
              onClick={markNotificationsAsRead}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((notif: NotificationItem) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.senderId) {
                    setSelectedUserId(notif.senderId);
                    setCurrentTab('profile');
                  }
                }}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  notif.isRead ? 'hover:bg-slate-50/80' : 'bg-blue-50/40 hover:bg-blue-50/70 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative">
                    <img
                      src={notif.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-xs border border-slate-100">
                      {getIcon(notif.type)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm text-slate-900 font-bold leading-tight">{notif.title}</h4>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{notif.content}</p>
                    <span className="text-[10px] text-slate-400 font-normal">{notif.createdAt}</span>
                  </div>
                </div>

                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm">No notifications to show.</p>
            </div>
          )}
        </div>

      </div>
    </PullToRefresh>
  );
};

export const SearchView: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    setCurrentTab, 
    setSelectedUserId, 
    setCheckoutItem 
  } = useApp() as any;

  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'posts' | 'marketplace' | 'groups'>('all');
  const [results, setResults] = useState<any>({ users: [], posts: [], items: [], groups: [] });

  React.useEffect(() => {
    if (searchQuery.trim()) {
      import('../services/api').then(({ api }) => {
        api.search(searchQuery).then(res => setResults(res || {}));
      });
    }
  }, [searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Search Results for "{searchQuery}"
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'people', 'posts', 'marketplace', 'groups'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* People Results */}
      {(activeTab === 'all' || activeTab === 'people') && results.users?.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">People</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.users.map((u: any) => (
              <div
                key={u.id}
                onClick={() => { setSelectedUserId(u.id); setCurrentTab('profile'); }}
                className="p-3 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-200/80 flex items-center gap-3 cursor-pointer transition-colors"
              >
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">@{u.username} • {u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketplace Results */}
      {(activeTab === 'all' || activeTab === 'marketplace') && results.items?.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Marketplace COD Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {results.items.map((item: any) => (
              <div key={item.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                <img src={item.images[0]} alt={item.title} className="w-full h-32 object-cover rounded-xl" />
                <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                <p className="text-xs font-black text-blue-600">${item.price} USD</p>
                <button
                  onClick={() => setCheckoutItem(item)}
                  className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Order COD
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
