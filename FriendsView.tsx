import React, { useState } from 'react';
import { 
  Users, UserPlus, UserCheck, UserX, Search, 
  MessageSquare, Check, ShieldCheck, Sparkles, Filter, 
  MoreHorizontal 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUsers } from '../server/db';
import { api } from '../services/api';
import { PullToRefresh } from './PullToRefresh';

export const FriendsView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentTab, 
    setSelectedUserId, 
    setFloatingChatUser, 
    addToast 
  } = useApp() as any;

  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'all'>('suggestions');
  const [searchFilter, setSearchFilter] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [acceptedUsers, setAcceptedUsers] = useState<string[]>([]);

  // Simulated requests and friends lists
  const pendingRequests = initialUsers.filter(u => u.id !== currentUser?.id).slice(0, 2);
  const friendSuggestions = initialUsers.filter(u => u.id !== currentUser?.id);
  const myFriends = initialUsers.filter(u => u.id !== currentUser?.id).slice(0, 4);

  const handleSendFriendRequest = async (userId: string) => {
    if (!currentUser) return;
    try {
      await api.toggleFriend(userId, currentUser.id);
      setSentRequests(prev => [...prev, userId]);
      addToast('Friend Request Sent', 'Connection request is on its way.', 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleAcceptRequest = (userId: string, userName: string) => {
    setAcceptedUsers(prev => [...prev, userId]);
    addToast('Request Accepted', `You and ${userName} are now friends on NEMDAN!`, 'success');
  };

  const handlePullRefresh = async () => {
    await new Promise(r => setTimeout(r, 600));
    addToast('Connections Refreshed', 'Loaded latest friend suggestions & requests.', 'info');
  };

  const filteredSuggestions = friendSuggestions.filter(u => 
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <PullToRefresh onRefresh={handlePullRefresh} label="Friends">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-20">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Friends & Connections
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Discover creators, colleagues, and friends across NEMDAN
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search friends by name..."
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'suggestions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          Suggestions
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          <span>Friend Requests</span>
          <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          All Friends ({myFriends.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. FRIEND SUGGESTIONS TAB */}
      {/* ============================================================ */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSuggestions.map((user) => {
            const isSent = sentRequests.includes(user.id);
            return (
              <div 
                key={user.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Cover & Avatar Header */}
                <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-700">
                  <div className="absolute -bottom-8 left-4">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setCurrentTab('profile');
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md cursor-pointer hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="pt-10 px-4 pb-4 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setCurrentTab('profile');
                      }}
                      className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {user.name}
                    </h3>
                    {user.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    @{user.username || 'user'} • {user.role.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {user.bio || 'Active NEMDAN community member.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{user.followersCount || 128} followers</span>
                    <span>12 mutual friends</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSendFriendRequest(user.id)}
                      disabled={isSent}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isSent ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{isSent ? 'Sent' : 'Add Friend'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setCurrentTab('profile');
                      }}
                      className="py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. FRIEND REQUESTS TAB */}
      {/* ============================================================ */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRequests.map((user) => {
            const isAccepted = acceptedUsers.includes(user.id);
            return (
              <div 
                key={user.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      @{user.username || 'user'}
                    </p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      Requested 2 hours ago
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isAccepted ? (
                    <div className="py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      ✓ Friend Request Accepted
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAcceptRequest(user.id, user.name)}
                        className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => addToast('Declined', 'Friend request was declined.', 'info')}
                        className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. ALL FRIENDS TAB */}
      {/* ============================================================ */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFriends.map((user) => (
            <div 
              key={user.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setCurrentTab('profile');
                  }}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform shrink-0"
                />
                <div className="min-w-0">
                  <h3 
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setCurrentTab('profile');
                    }}
                    className="font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    @{user.username || 'user'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setFloatingChatUser(user)}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Send Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setCurrentTab('profile');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>
    </PullToRefresh>
  );
};
