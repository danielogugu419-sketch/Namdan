import React, { useState } from 'react';
import { 
  User, LayoutDashboard, MessageSquare, Users, Users2, 
  Film, ShoppingBag, Flag, Bookmark, Bell, Calendar, 
  Clock, Sparkles, Shield, Settings, Lock, ShieldCheck, 
  BellRing, Sliders, HelpCircle, AlertTriangle, FileText, 
  UserPlus, LogOut, ChevronDown, ChevronRight, Moon, 
  Sun, CheckCircle2, ArrowRight, Wallet, Radio
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';
import { initialUsers } from '../server/db';

export const MenuView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    setCurrentTab, 
    setSelectedUserId, 
    theme, 
    toggleTheme, 
    switchDemoUser,
    addToast,
    setShowWalletModal,
    setShowGoLiveModal,
    walletBalance,
    walletCurrency,
    exchangeRateNGN
  } = useApp() as any;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showSwitchAccounts, setShowSwitchAccounts] = useState(false);

  const quickBal = walletCurrency === 'NGN'
    ? `₦${((walletBalance || 0) * (exchangeRateNGN || 1550)).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `$${(walletBalance || 0).toFixed(0)}`;

  const quickActionCards = [
    {
      id: 'live',
      title: 'Live Streams & Broadcasts',
      desc: 'Watch live, chat in real-time or Go Live',
      icon: Radio,
      iconBg: 'bg-rose-600 text-white',
      badge: 'LIVE',
      action: () => setCurrentTab('live')
    },
    {
      id: 'wallet',
      title: 'NEMDAN Pay Wallet',
      desc: 'Instant deposits, payouts & tips',
      icon: Wallet,
      iconBg: 'bg-blue-600 text-white',
      badge: quickBal,
      action: () => setShowWalletModal(true)
    },
    {
      id: 'creator_studio',
      title: 'Creator Studio',
      desc: 'Monetization, analytics & reach',
      icon: Sparkles,
      iconBg: 'bg-amber-500 text-white',
      badge: 'Pro',
      action: () => setCurrentTab('creator_studio')
    },
    {
      id: 'messages',
      title: 'Messages & Calls',
      desc: 'Real-time chats & WebRTC calls',
      icon: MessageSquare,
      iconBg: 'bg-blue-600 text-white',
      badge: '1 Unread',
      action: () => setCurrentTab('messages')
    },
    {
      id: 'friends',
      title: 'Friends & Requests',
      desc: 'Find connections & manage network',
      icon: Users,
      iconBg: 'bg-indigo-600 text-white',
      badge: '2 New',
      action: () => setCurrentTab('friends')
    },
    {
      id: 'reels',
      title: 'Short Reels',
      desc: 'Trending vertical 9:16 videos',
      icon: Film,
      iconBg: 'bg-rose-500 text-white',
      badge: 'Hot',
      action: () => setCurrentTab('reels')
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      desc: 'Cash on delivery trading hub',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-600 text-white',
      badge: 'COD',
      action: () => setCurrentTab('marketplace')
    },
    {
      id: 'groups',
      title: 'Groups & Clubs',
      desc: 'Discover niche communities',
      icon: Users2,
      iconBg: 'bg-purple-600 text-white',
      badge: '4 Active',
      action: () => setCurrentTab('groups')
    },
    {
      id: 'pages',
      title: 'Verified Pages',
      desc: 'Official brands and public figures',
      icon: Flag,
      iconBg: 'bg-cyan-600 text-white',
      badge: 'Verified',
      action: () => setCurrentTab('pages')
    },
    {
      id: 'saved',
      title: 'Saved Items',
      desc: 'Bookmarks and saved posts',
      icon: Bookmark,
      iconBg: 'bg-teal-600 text-white',
      badge: 'Private',
      action: () => setCurrentTab('saved')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      desc: 'All platform activity alerts',
      icon: Bell,
      iconBg: 'bg-violet-600 text-white',
      badge: 'Recent',
      action: () => setCurrentTab('notifications')
    },
    {
      id: 'events',
      title: 'Events & Meetups',
      desc: 'Virtual and local happenings',
      icon: Calendar,
      iconBg: 'bg-orange-500 text-white',
      badge: 'Upcoming',
      action: () => addToast('Events', 'Showing upcoming community sessions and summits.', 'info')
    },
    {
      id: 'memories',
      title: 'Memories & Flashbacks',
      desc: 'Past year highlights & anniversaries',
      icon: Clock,
      iconBg: 'bg-pink-600 text-white',
      badge: 'Archive',
      action: () => addToast('Memories', 'No memories from this day yet. Check back soon!', 'info')
    },
    {
      id: 'admin',
      title: 'Admin Control Center',
      desc: 'AI Trust & Safety Moderation queue',
      icon: Shield,
      iconBg: 'bg-slate-900 text-white dark:bg-slate-700',
      badge: 'Staff',
      action: () => setCurrentTab('admin')
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-20">
      
      {/* ============================================================ */}
      {/* 1. TOP PROFILE CARD */}
      {/* ============================================================ */}
      <div 
        id="menu-profile-card"
        onClick={() => {
          setSelectedUserId(currentUser?.id || null);
          setCurrentTab('profile');
        }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
            />
            {currentUser?.isVerified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {currentUser?.name || 'Guest User'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              @{currentUser?.username || 'user'} • View your profile
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. QUICK ACTIONS 12-CARD GRID (Requirement 9) */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            All Shortcuts
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            12 Services
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickActionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                id={`menu-card-${card.id}`}
                onClick={card.action}
                className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-slate-700 transition-all text-left group cursor-pointer flex flex-col justify-between min-h-[115px] sm:min-h-[125px]"
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MENU SETTINGS & PRIVACY (Requirement 10) */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        
        {/* Settings & Privacy Expandable Accordion */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Settings & Privacy</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Account, privacy controls & security</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>

          {settingsOpen && (
            <div className="px-5 pb-4 pt-1 space-y-1 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-150">
              <button
                onClick={() => setCurrentTab('settings')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Account & Password Settings</span>
              </button>
              <button
                onClick={() => setCurrentTab('settings')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Privacy & Audience Visibility</span>
              </button>
              <button
                onClick={() => setCurrentTab('settings')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <BellRing className="w-4 h-4 text-slate-400" />
                <span>Notification Preferences</span>
              </button>
              <button
                onClick={() => setCurrentTab('settings')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Feed & Content Preferences</span>
              </button>
            </div>
          )}
        </div>

        {/* Help & Support Expandable Accordion */}
        <div>
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Help & Support</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Help center, safety guidelines & reports</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${helpOpen ? 'rotate-180' : ''}`} />
          </button>

          {helpOpen && (
            <div className="px-5 pb-4 pt-1 space-y-1 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-150">
              <button
                onClick={() => addToast('NEMDAN Help Center', 'Browse our 24/7 knowledge base and community guides.', 'info')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>NEMDAN Help Center</span>
              </button>
              <button
                onClick={() => addToast('Report an Issue', 'Report submitted to technical operations. Thanks for helping NEMDAN stay safe.', 'success')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Report a Technical Problem</span>
              </button>
              <button
                onClick={() => addToast('Community Standards', 'NEMDAN enforces strict zero-tolerance policies on hate speech, scams, and harassment.', 'info')}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Community Guidelines & Safety</span>
              </button>
            </div>
          )}
        </div>

        {/* Display & Dark Mode Toggle Row */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dark Mode</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
              theme === 'dark' ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md block" />
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. ACCOUNT SWITCHER & LOGOUT ACTIONS */}
      {/* ============================================================ */}
      <div className="space-y-3">
        {/* Switch / Add Account Button */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-3">
          <button
            onClick={() => setShowSwitchAccounts(!showSwitchAccounts)}
            className="w-full px-3 py-2 text-left font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Switch or Add Account (Demo Profiles)</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showSwitchAccounts ? 'rotate-180' : ''}`} />
          </button>

          {showSwitchAccounts && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
              {initialUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchDemoUser(user.id);
                    setShowSwitchAccounts(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    currentUser?.id === user.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="text-left">
                      <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {currentUser?.id === user.id && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">Active</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Log Out */}
        <button
          onClick={() => {
            setCurrentUser(null);
            addToast('Logged Out', 'You have been signed out of NEMDAN.', 'info');
          }}
          className="w-full py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of NEMDAN</span>
        </button>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-2">
          NEMDAN Social Platform • Version 2.0 • Privacy • Terms • Cookies
        </p>
      </div>

    </div>
  );
};
