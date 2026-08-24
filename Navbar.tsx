import React, { useState, useMemo } from 'react';
import { 
  Home, Users, Film, ShoppingBag, MessageSquare, Bell, 
  Search, Plus, Menu, X, Sun, Moon, Sparkles, CheckCircle, 
  ChevronDown, LogOut, UserCheck, Shield, Settings, 
  Grid, Compass, Bookmark, Store, HelpCircle, Flame,
  Wallet, CreditCard, ArrowDownToLine, ArrowUpRight, Radio, Video
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';
import { initialUsers } from '../server/db';
import { ThemeDropdown } from './ThemeDropdown';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    currentTab, 
    setCurrentTab, 
    unreadNotifsCount, 
    theme,
    toggleTheme,
    setShowQuickCreate,
    setShowCreatePost,
    setShowAuthModal,
    setAuthMode,
    switchDemoUser,
    searchQuery,
    setSearchQuery,
    setSelectedUserId,
    walletBalance,
    walletCurrency,
    setShowWalletModal,
    setShowGoLiveModal,
    exchangeRateNGN,
    canInstallPwa,
    isPwaInstalled,
    installPwa
  } = useApp() as any;

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Quick formatted balance for compact navbar badge
  const quickFormattedBalance = useMemo(() => {
    if (walletCurrency === 'NGN') {
      const ngnVal = (walletBalance || 0) * (exchangeRateNGN || 1550);
      return `₦${ngnVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `$${(walletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [walletBalance, walletCurrency, exchangeRateNGN]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentTab('search');
      setShowSearchModal(false);
    }
  };

  // Primary Navigation tabs directly under NEMDAN Header: Home | Friends | Create | Reels | Live | Menu (+ Messages & Marketplace)
  const navTabs = [
    { id: 'feed' as NavigationTab, label: 'Home', icon: Home, isCreate: false },
    { id: 'friends' as NavigationTab, label: 'Friends', icon: Users, isCreate: false, badge: 2 },
    { id: 'create' as any, label: 'Create', icon: Plus, isCreate: true },
    { id: 'reels' as NavigationTab, label: 'Reels', icon: Film, isCreate: false, hot: true },
    { id: 'live' as NavigationTab, label: 'Live', icon: Radio, isCreate: false, isLive: true },
    { id: 'menu' as NavigationTab, label: 'Menu', icon: Grid, isCreate: false },
    { id: 'messages' as NavigationTab, label: 'Messages', icon: MessageSquare, isCreate: false, badge: 1, hideOnMobile: true },
    { id: 'marketplace' as NavigationTab, label: 'Marketplace', icon: ShoppingBag, isCreate: false, hideOnMobile: true },
  ];

  // =========================================================================
  // CONDITIONAL HEADER VISIBILITY (Requirement 2):
  // If the user is actively on the 'reels' tab, unmount the header entirely
  // to allow the immersive Reels vertical video player to occupy 100% full viewport height.
  // The header remains visible across all other tabs (Home, Friends, Marketplace, etc.).
  // =========================================================================
  if (currentTab === 'reels') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* 1. EXPANDED NEMDAN MAIN HEADER (Height: 74-80px)              */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-5 lg:px-8 h-[74px] sm:h-[80px] flex items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left: Prominent NEMDAN Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            id="brand-logo-btn"
            onClick={() => { 
              setCurrentTab('feed'); 
              setSelectedUserId(null); 
            }}
            className="flex items-center gap-3 sm:gap-3.5 group text-left cursor-pointer focus:outline-hidden py-1"
            title="NEMDAN Home"
          >
            {/* NEMDAN Logo Icon: 44px on Mobile, 48px on Desktop */}
            <div className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-200 relative overflow-hidden shrink-0 border border-white/20">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-black text-2xl sm:text-[26px] tracking-tighter drop-shadow-sm select-none">
                N
              </span>
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 shadow-xs" />
            </div>

            {/* NEMDAN Wordmark: 24-28px Bold & Prominent */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl sm:text-[28px] tracking-tight leading-none bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:via-slate-100 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-xs select-none">
                  NEMDAN
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
                  Global
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Desktop Search Input Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
            <input
              id="desktop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, creators, reels, marketplace..."
              className="w-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-full pl-11 pr-10 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Right: Header Controls (44-48px Touch Area & Clean Spacing) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile/Tablet Search Button (44px touch target) */}
          <button
            id="mobile-search-btn"
            onClick={() => setShowSearchModal(true)}
            className="lg:hidden w-[44px] h-[44px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 active:scale-95"
            title="Search NEMDAN"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Quick Create (+) Button (Prominent 44px Touch Target) */}
          <button
            id="header-create-btn"
            onClick={() => setShowQuickCreate(true)}
            className="flex items-center justify-center gap-2 h-[44px] px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Create Post, Story, Reel or Listing"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Messages Trigger (44px touch target) */}
          <button
            id="header-messages-btn"
            onClick={() => {
              setCurrentTab('messages');
              setSelectedUserId(null);
            }}
            className={`relative w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
              currentTab === 'messages'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Messages & Chat"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute 1.5 top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              1
            </span>
          </button>

          {/* Notifications Trigger (44px touch target) */}
          <button
            id="header-notifications-btn"
            onClick={() => {
              setCurrentTab('notifications');
              setSelectedUserId(null);
            }}
            className={`hidden sm:flex relative w-[44px] h-[44px] rounded-full items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
              currentTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* 
            =========================================================================
            SOCIAL MEDIA WALLET WIDGET TRIGGER (Requirement 1)
            - Compact button in main navigation bar displaying user's quick balance.
            - Toggling this button opens the interactive Wallet overview modal.
            =========================================================================
          */}
          <button
            id="header-wallet-btn"
            onClick={() => setShowWalletModal(true)}
            className="group relative h-[44px] px-3 sm:px-3.5 rounded-full bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 hover:from-blue-600/20 hover:to-indigo-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs"
            title={`NEMDAN Pay Wallet (Balance: ${quickFormattedBalance})`}
            aria-label="Open NEMDAN Pay Wallet"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
              <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none">Wallet</span>
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{quickFormattedBalance}</span>
            </div>
          </button>

          {/* Install PWA Button (Visible if browser supports or standalone install) */}
          {!isPwaInstalled && (
            <button
              id="header-install-pwa-btn"
              onClick={installPwa}
              className="hidden md:flex items-center gap-1.5 h-[44px] px-3.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700"
              title="Install NEMDAN App to Desktop / Mobile"
            >
              <ArrowDownToLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Install App</span>
            </button>
          )}

          {/* Theme Selector Popover Dropdown (Light, Dark, System) */}
          <ThemeDropdown />

          {/* User Profile Avatar Dropdown (44px touch area) */}
          <div className="relative shrink-0">
            <button
              id="header-user-avatar-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-[44px] h-[44px] rounded-full p-0.5 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
              title="Account Menu"
              aria-label="Account Menu"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User Avatar'}
                className="w-[40px] h-[40px] rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Link */}
                <div 
                  onClick={() => {
                    setSelectedUserId(currentUser?.id || null);
                    setCurrentTab('profile');
                    setShowUserDropdown(false);
                  }}
                  className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @{currentUser?.username || 'user'} • {currentUser?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="py-1">
                  {/* Social Wallet Trigger Item */}
                  <button
                    onClick={() => {
                      setShowWalletModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800/60 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-slate-900 dark:text-white">NEMDAN Pay Wallet</span>
                    </div>
                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                      {quickFormattedBalance}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('menu');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Grid className="w-4 h-4 text-slate-400" />
                    <span>NEMDAN Full Menu</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('saved');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>Saved Bookmarks</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('creator_studio');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Creator Studio</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowGoLiveModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="font-bold">Go Live (Broadcast)</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-[10px] font-black">
                      LIVE
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Privacy</span>
                  </button>

                  <button
                    onClick={() => {
                      installPwa();
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowDownToLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Install NEMDAN (PWA)</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-extrabold">
                      Chrome
                    </span>
                  </button>

                  {/* Switch Demo Role */}
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Switch Role (Demo)
                    </p>
                    <div className="space-y-1">
                      {initialUsers.slice(0, 4).map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchDemoUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full px-2 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            currentUser?.id === u.id 
                              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{u.name}</span>
                          <span className="text-[10px] opacity-75 capitalize">{u.role.split('_')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setCurrentUser(null);
                        setShowUserDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PRIMARY TOP NAVIGATION: Home | Friends | Create | Reels | Menu */}
      {/*    Height: 60-64px directly below NEMDAN Header              */}
      {/* ============================================================ */}
      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <nav className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 sm:gap-4 h-[60px] sm:h-[64px] overflow-x-auto scrollbar-none">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = !tab.isCreate && currentTab === tab.id;
              
              if (tab.isCreate) {
                return (
                  <button
                    key="top-nav-create"
                    id="top-nav-create"
                    onClick={() => setShowQuickCreate(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-2.5 sm:px-6 h-[48px] rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 group"
                    title="Create Post, Story, Reel or Listing"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold">Create</span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  id={`top-nav-${tab.id}`}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setSelectedUserId(null);
                  }}
                  className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2 px-2.5 sm:px-5 h-[48px] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                    tab.hideOnMobile ? 'hidden md:flex' : 'flex'
                  } ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/70 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>

                  {tab.isLive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shrink-0 shadow-xs animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                      Live
                    </span>
                  )}

                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black shrink-0">
                      {tab.badge}
                    </span>
                  )}

                  {tab.hot && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}

                  {isActive && (
                    <span className="absolute -bottom-1.5 sm:-bottom-2 left-4 right-4 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE SEARCH MODAL                                       */}
      {/* ============================================================ */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-6 px-3.5">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-5 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  N
                </div>
                <h4 className="font-bold text-base text-slate-800 dark:text-white">Search NEMDAN</h4>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, people, reels, marketplace..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
};
