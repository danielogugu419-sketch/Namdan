import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Post, StoryItem, Reel, Conversation, Message, 
  NotificationItem, Group, Page, MarketplaceItem, 
  MarketplaceOrder, CallSession, ReactionType, ThemeMode,
  WalletTransaction, NavigationTab, LiveStream,
  VirtualGift, CoinPackage, LiveStreamGift, GifterLeaderboardEntry,
  CreatorEarnings, WithdrawalRequest, ReferralConfig, ReferralConversion, ReferralStats 
} from '../types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export type { NavigationTab };

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  selectedPageId: string | null;
  setSelectedPageId: (id: string | null) => void;

  // Theme support
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Feeds & Media
  posts: Post[];
  stories: StoryItem[];
  reels: Reel[];
  liveStreams: LiveStream[];
  activeLiveStream: LiveStream | null;
  setActiveLiveStream: (stream: LiveStream | null) => void;
  activeBroadcastStream: MediaStream | null;
  setActiveBroadcastStream: (stream: MediaStream | null) => void;
  refreshPosts: () => Promise<void>;
  refreshStories: () => Promise<void>;
  refreshReels: () => Promise<void>;
  refreshLiveStreams: (category?: string, status?: 'live' | 'ended') => Promise<void>;
  refreshFeedData: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  showGoLiveModal: boolean;
  setShowGoLiveModal: (show: boolean) => void;

  // Saved / Bookmarked items
  savedPostIds: string[];
  toggleSavePost: (postId: string) => void;

  // Messaging & Realtime
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  messages: Message[];
  sendMessage: (content: string, type?: any, mediaUrl?: string) => Promise<void>;
  floatingChatUser: User | null;
  setFloatingChatUser: (user: User | null) => void;

  // Calls
  activeCall: CallSession | null;
  incomingCall: { caller: User; type: 'voice' | 'video'; callId: string } | null;
  startCall: (targetUser: User, type: 'voice' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationsAsRead: () => Promise<void>;

  // Modals & UI Triggers
  showQuickCreate: boolean;
  setShowQuickCreate: (show: boolean) => void;
  showCreatePost: boolean;
  setShowCreatePost: (show: boolean) => void;
  pendingUploadFiles: File[] | null;
  setPendingUploadFiles: (files: File[] | null) => void;
  showCreateStory: boolean;
  setShowCreateStory: (show: boolean) => void;
  activeStoryModal: { index: number; stories: StoryItem[] } | null;
  setActiveStoryModal: (data: { index: number; stories: StoryItem[] } | null) => void;
  showUploadReel: boolean;
  setShowUploadReel: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register' | 'otp';
  setAuthMode: (mode: 'login' | 'register' | 'otp') => void;
  showCreateGroup: boolean;
  setShowCreateGroup: (show: boolean) => void;
  showCreatePage: boolean;
  setShowCreatePage: (show: boolean) => void;
  showCreateListing: boolean;
  setShowCreateListing: (show: boolean) => void;
  checkoutItem: MarketplaceItem | null;
  setCheckoutItem: (item: MarketplaceItem | null) => void;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;

  // Full-screen Post Viewer State
  activeFullscreenPost: { post: Post; initialMediaIndex?: number } | null;
  setActiveFullscreenPost: (data: { post: Post; initialMediaIndex?: number } | null) => void;
  openFullscreenPost: (post: Post, initialMediaIndex?: number) => void;
  closeFullscreenPost: () => void;
  updatePostInFeed: (updatedPost: Post) => void;

  // Social Following State
  followingUserIds: string[];
  toggleFollowUser: (userId: string, userName?: string) => void;
  isFollowingUser: (userId: string) => boolean;

  // Social Wallet State & Actions
  walletBalance: number;
  walletCurrency: 'USD' | 'NGN';
  setWalletCurrency: (c: 'USD' | 'NGN') => void;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
  walletTransactions: WalletTransaction[];
  depositFunds: (amount: number, channel?: string, note?: string) => Promise<boolean>;
  withdrawFunds: (amount: number, bankDetails: string, note?: string) => Promise<boolean>;
  exchangeRateNGN: number;

  // Virtual Coins & Gifting
  userCoins: number;
  refreshUserCoins: () => Promise<void>;
  buyCoins: (packageId?: string, customAmount?: number, paymentMethod?: string) => Promise<boolean>;
  virtualGifts: VirtualGift[];
  coinPackages: CoinPackage[];
  sendLiveGift: (streamId: string, giftId: string, comboCount?: number) => Promise<boolean>;
  activeGiftOverlay: LiveStreamGift | null;
  setActiveGiftOverlay: (gift: LiveStreamGift | null) => void;

  // Creator Earnings & Withdrawals
  creatorEarnings: CreatorEarnings | null;
  refreshCreatorEarnings: () => Promise<void>;
  requestCreatorWithdrawal: (amountUSD: number, paymentMethod: any, accountDetails: any) => Promise<boolean>;

  // Referral System & Analytics
  referralStats: ReferralStats | null;
  referralConversions: ReferralConversion[];
  refreshReferralStats: () => Promise<void>;

  // PWA Support
  isPwaInstalled: boolean;
  canInstallPwa: boolean;
  installPwa: () => Promise<void>;

  // Global actions
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: Toast[];
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  switchDemoUser: (userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // =========================================================================
  // THEME STATE & PERSISTENCE (Light, Dark, System)
  // - Persists theme preference ('light' | 'dark' | 'system') in localStorage.
  // - Listens to OS preference changes via matchMedia when 'system' is active.
  // - Updates root HTML element with '.dark' class and color-scheme properties.
  // =========================================================================
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('nemdan_theme_mode');
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        return savedMode as ThemeMode;
      }
      const legacyTheme = localStorage.getItem('nemdan_theme');
      if (legacyTheme === 'dark' || legacyTheme === 'light') {
        return legacyTheme as ThemeMode;
      }
    } catch (e) {
      console.warn('Error reading theme from localStorage:', e);
    }
    return 'system';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 1. Save user preference to localStorage
    try {
      localStorage.setItem('nemdan_theme_mode', themeMode);
    } catch (e) {
      console.warn('Error saving theme mode to localStorage:', e);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 2. Helper to apply resolved theme to DOM root and state
    const applyResolvedTheme = (isDark: boolean) => {
      const resolved = isDark ? 'dark' : 'light';
      setTheme(resolved);
      try {
        localStorage.setItem('nemdan_theme', resolved);
      } catch {}

      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    // 3. Handle System preference vs explicit Light/Dark
    if (themeMode === 'system') {
      applyResolvedTheme(mediaQuery.matches);

      const handleSystemThemeChange = (event: MediaQueryListEvent) => {
        applyResolvedTheme(event.matches);
      };

      // Realtime listener for OS system theme changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older Safari/WebKit
        mediaQuery.addListener(handleSystemThemeChange);
        return () => mediaQuery.removeListener(handleSystemThemeChange);
      }
    } else {
      applyResolvedTheme(themeMode === 'dark');
    }
  }, [themeMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [activeBroadcastStream, setActiveBroadcastStream] = useState<MediaStream | null>(null);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nemdan_saved_posts') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => {
      const updated = prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId];
      localStorage.setItem('nemdan_saved_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [floatingChatUser, setFloatingChatUser] = useState<User | null>(null);

  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ caller: User; type: 'voice' | 'video'; callId: string } | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal triggers
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[] | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [activeStoryModal, setActiveStoryModal] = useState<{ index: number; stories: StoryItem[] } | null>(null);
  const [showUploadReel, setShowUploadReel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<MarketplaceItem | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fullscreen Post Viewer State
  const [activeFullscreenPost, setActiveFullscreenPost] = useState<{ post: Post; initialMediaIndex?: number } | null>(null);

  const openFullscreenPost = useCallback((post: Post, initialMediaIndex: number = 0) => {
    setActiveFullscreenPost({ post, initialMediaIndex });
  }, []);

  const closeFullscreenPost = useCallback(() => {
    setActiveFullscreenPost(null);
  }, []);

  const updatePostInFeed = useCallback((updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setActiveFullscreenPost(prev => {
      if (prev && prev.post.id === updatedPost.id) {
        return { ...prev, post: updatedPost };
      }
      return prev;
    });
  }, []);

  // Social Following State & Handlers
  const [followingUserIds, setFollowingUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nemdan_following_users');
      return saved ? JSON.parse(saved) : ['u_alex', 'u_elena', 'u_sarah'];
    } catch {
      return ['u_alex', 'u_elena', 'u_sarah'];
    }
  });

  const toggleFollowUser = useCallback((userId: string, userName?: string) => {
    setFollowingUserIds(prev => {
      const isFollowing = prev.includes(userId);
      const updated = isFollowing 
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      try {
        localStorage.setItem('nemdan_following_users', JSON.stringify(updated));
      } catch {}

      if (isFollowing) {
        setToasts(t => [...t, {
          id: `toast_${Date.now()}`,
          title: 'Unfollowed',
          message: userName ? `You unfollowed ${userName}` : 'Unfollowed successfully',
          type: 'info'
        }]);
      } else {
        setToasts(t => [...t, {
          id: `toast_${Date.now()}`,
          title: 'Following',
          message: userName ? `You are now following ${userName}!` : 'Following successfully',
          type: 'success'
        }]);
      }

      return updated;
    });
  }, []);

  const isFollowingUser = useCallback((userId: string) => {
    return followingUserIds.includes(userId);
  }, [followingUserIds]);

  // =========================================================================
  // SOCIAL WALLET & TRANSACTIONS STATE (Requirement 2 & 3)
  // - Persists wallet balance and currency preference in localStorage.
  // - Handles dynamic deposit, withdrawal, and currency conversions (USD/NGN).
  // =========================================================================
  const exchangeRateNGN = 1550; // 1 USD = 1,550 NGN

  const [walletCurrency, setWalletCurrencyState] = useState<'USD' | 'NGN'>(() => {
    try {
      const savedCurr = localStorage.getItem('nemdan_wallet_currency');
      return savedCurr === 'NGN' ? 'NGN' : 'USD';
    } catch {
      return 'USD';
    }
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const savedBal = localStorage.getItem('nemdan_wallet_balance');
      if (savedBal !== null) {
        return parseFloat(savedBal);
      }
    } catch {}
    return 0.00; // Default $0 balance matching UI screenshot
  });

  const [showWalletModal, setShowWalletModal] = useState(false);

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const savedTx = localStorage.getItem('nemdan_wallet_transactions');
      if (savedTx) {
        return JSON.parse(savedTx);
      }
    } catch {}
    // Seed initial activity feed
    return [
      {
        id: 'tx_1',
        type: 'withdrawal',
        title: 'Withdrawal',
        description: 'Bank Transfer (Access Bank ••••4019)',
        amount: -45.00,
        status: 'completed',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        relativeTime: '5 days ago',
        reference: 'WTH-984210',
        channel: 'Bank Transfer'
      },
      {
        id: 'tx_2',
        type: 'received',
        title: 'Received',
        description: 'Reel Monetization & Creator Tip from @elena_rodriguez',
        amount: 120.00,
        status: 'completed',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        relativeTime: '12 days ago',
        sender: 'Elena Rodriguez',
        reference: 'TIP-391842',
        channel: 'Creator Tip'
      },
      {
        id: 'tx_3',
        type: 'deposit',
        title: 'Deposit',
        description: 'Instant Card Funding (Mastercard ••••8821)',
        amount: 50.00,
        status: 'completed',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        relativeTime: '20 days ago',
        reference: 'DEP-102947',
        channel: 'Debit Card'
      }
    ];
  });

  // Sync wallet balance & transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nemdan_wallet_balance', walletBalance.toString());
      localStorage.setItem('nemdan_wallet_currency', walletCurrency);
      localStorage.setItem('nemdan_wallet_transactions', JSON.stringify(walletTransactions));
    } catch (e) {
      console.warn('Failed to sync wallet data:', e);
    }
  }, [walletBalance, walletCurrency, walletTransactions]);

  const setWalletCurrency = useCallback((c: 'USD' | 'NGN') => {
    setWalletCurrencyState(c);
  }, []);

  // =========================================================================
  // VIRTUAL COINS & GIFTING STATE (TikTok-Inspired Live Stream Gifting)
  // =========================================================================
  const [userCoins, setUserCoins] = useState<number>(1000);
  const [virtualGifts, setVirtualGifts] = useState<VirtualGift[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [activeGiftOverlay, setActiveGiftOverlay] = useState<LiveStreamGift | null>(null);

  // Creator Earnings & Withdrawals
  const [creatorEarnings, setCreatorEarnings] = useState<CreatorEarnings | null>(null);

  // Referral System & Analytics
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralConversions, setReferralConversions] = useState<ReferralConversion[]>([]);

  // PWA State & Installation Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setCanInstallPwa(false);
      setDeferredPrompt(null);
    };

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsPwaInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = useCallback(async () => {
    if (!deferredPrompt) {
      alert('To install NEMDAN on Google Chrome / Android, click the Chrome menu (⋮) and select "Install NEMDAN" or "Add to Home screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
      setIsPwaInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const addToast = useCallback((title: string, message: string, type: Toast['type'] = 'info') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const depositFunds = useCallback(async (amount: number, channel: string = 'Card Payment', note: string = ''): Promise<boolean> => {
    if (amount <= 0) return false;

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: 'deposit',
      title: 'Deposit',
      description: note || `Instant Funding (${channel})`,
      amount: amount,
      status: 'completed',
      date: new Date().toISOString(),
      relativeTime: 'Just now',
      reference: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      channel: channel
    };

    setWalletBalance(prev => {
      const updated = Math.round((prev + amount) * 100) / 100;
      return updated;
    });

    setWalletTransactions(prev => [newTx, ...prev]);
    addToast('Deposit Successful', `Successfully deposited $${amount.toFixed(2)} to your NEMDAN Wallet.`, 'success');
    return true;
  }, [addToast]);

  const withdrawFunds = useCallback(async (amount: number, bankDetails: string, note: string = ''): Promise<boolean> => {
    if (amount <= 0) return false;
    if (amount > walletBalance) {
      addToast('Insufficient Balance', `Your current balance is $${walletBalance.toFixed(2)}.`, 'error');
      return false;
    }

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: 'withdrawal',
      title: 'Withdrawal',
      description: note || `Payout to ${bankDetails}`,
      amount: -amount,
      status: 'completed',
      date: new Date().toISOString(),
      relativeTime: 'Just now',
      reference: `WTH-${Math.floor(100000 + Math.random() * 900000)}`,
      channel: 'Bank Payout'
    };

    setWalletBalance(prev => {
      const updated = Math.round((prev - amount) * 100) / 100;
      return updated;
    });

    setWalletTransactions(prev => [newTx, ...prev]);
    addToast('Withdrawal Processed', `Successfully initiated withdrawal of $${amount.toFixed(2)} to ${bankDetails}.`, 'success');
    return true;
  }, [walletBalance, addToast]);

  // Initial load
  useEffect(() => {
    async function initData() {
      try {
        const users = await api.getUsers();
        if (users && users.length > 0) {
          // Default to Super Admin for easy access to all features (Admin, Creator, Marketplace, Feed)
          setCurrentUser(users[0]);
        }
        const [loadedPosts, loadedStories, loadedReels, loadedNotifs, loadedConvs, loadedLive, loadedGifts, loadedPacks] = await Promise.all([
          api.getPosts(),
          api.getStories(),
          api.getReels(),
          api.getNotifications(),
          api.getConversations(),
          api.getLiveStreams(),
          api.getVirtualGifts(),
          api.getCoinPackages()
        ]);
        setPosts(loadedPosts || []);
        setStories(loadedStories || []);
        setReels(loadedReels || []);
        setNotifications(loadedNotifs || []);
        setConversations(loadedConvs || []);
        setLiveStreams(loadedLive || []);
        setVirtualGifts(loadedGifts || []);
        setCoinPackages(loadedPacks || []);
      } catch (err) {
        console.error('Initial data fetch error:', err);
      }
    }
    initData();
  }, []);

  // Fetch coins, referrals and creator earnings when currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    refreshUserCoins();
    refreshCreatorEarnings();
    refreshReferralStats();
  }, [currentUser]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!currentUser) return;
    const socket = getSocket();

    socket.emit('join_user', currentUser.id);

    const handleCoinsUpdated = (data: { coins: number }) => {
      if (typeof data.coins === 'number') {
        setUserCoins(data.coins);
      }
    };

    const handleGlobalGift = (data: { senderName: string; recipientName: string; giftName: string; giftIcon: string; coinAmount: number }) => {
      addToast(`🎁 Big Gift Alert!`, `${data.senderName} sent a ${data.giftIcon} ${data.giftName} (${data.coinAmount} Coins) to ${data.recipientName}!`, 'success');
    };

    const handleNewPost = (post: Post) => {
      setPosts(prev => [post, ...prev.filter(p => p.id !== post.id)]);
      addToast('New Feed Post', `${post.authorName} just posted.`);
    };

    const handlePostUpdated = (updatedPost: Post) => {
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    };

    const handlePostDeleted = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const handleNewStory = (story: StoryItem) => {
      setStories(prev => [story, ...prev.filter(s => s.id !== story.id)]);
    };

    const handleNewReel = (reel: Reel) => {
      setReels(prev => [reel, ...prev.filter(r => r.id !== reel.id)]);
    };

    const handleLiveStreamStarted = (stream: LiveStream) => {
      setLiveStreams(prev => [stream, ...prev.filter(s => s.id !== stream.id)]);
      addToast('🔴 Live Stream Started', `${stream.hostName} went LIVE: "${stream.title.slice(0, 40)}..."`, 'info');
    };

    const handleLiveStreamEnded = (endedStream: LiveStream) => {
      setLiveStreams(prev => prev.map(s => s.id === endedStream.id ? endedStream : s));
    };

    const handleReceiveMsg = (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderId !== currentUser.id) {
        addToast(`New Message from ${msg.senderName}`, msg.content.slice(0, 50));
      }
    };

    const handleIncomingCall = (data: { caller: User; type: 'voice' | 'video'; callId: string }) => {
      setIncomingCall(data);
    };

    const handleCallAnswered = (data: { callerId: string; accepted: boolean }) => {
      if (data.accepted) {
        setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
        addToast('Call Connected', 'You are now connected in a secure WebRTC call.', 'success');
      } else {
        setActiveCall(null);
        addToast('Call Declined', 'The recipient declined the call.', 'warning');
      }
    };

    const handleCallEnded = () => {
      setActiveCall(null);
      setIncomingCall(null);
      addToast('Call Ended', 'The call has ended.', 'info');
    };

    socket.on('coins_balance_updated', handleCoinsUpdated);
    socket.on('global_gift_shoutout', handleGlobalGift);
    socket.on('new_post', handleNewPost);
    socket.on('post_updated', handlePostUpdated);
    socket.on('post_deleted', handlePostDeleted);
    socket.on('new_story', handleNewStory);
    socket.on('new_reel', handleNewReel);
    socket.on('live_stream_started', handleLiveStreamStarted);
    socket.on('live_stream_ended', handleLiveStreamEnded);
    socket.on('receive_message', handleReceiveMsg);
    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_answered', handleCallAnswered);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('coins_balance_updated', handleCoinsUpdated);
      socket.off('global_gift_shoutout', handleGlobalGift);
      socket.off('new_post', handleNewPost);
      socket.off('post_updated', handlePostUpdated);
      socket.off('post_deleted', handlePostDeleted);
      socket.off('new_story', handleNewStory);
      socket.off('new_reel', handleNewReel);
      socket.off('live_stream_started', handleLiveStreamStarted);
      socket.off('live_stream_ended', handleLiveStreamEnded);
      socket.off('receive_message', handleReceiveMsg);
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_answered', handleCallAnswered);
      socket.off('call_ended', handleCallEnded);
    };
  }, [currentUser, addToast]);

  // Load conversation messages
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    const socket = getSocket();
    socket.emit('join_conversation', activeConversation.id);
    api.getMessages(activeConversation.id).then(msgs => setMessages(msgs || []));
  }, [activeConversation]);

  const refreshPosts = async () => {
    const data = await api.getPosts();
    setPosts(data || []);
  };

  const refreshStories = async () => {
    const data = await api.getStories();
    setStories(data || []);
  };

  const refreshReels = async () => {
    const data = await api.getReels();
    setReels(data || []);
  };

  const refreshLiveStreams = async (category?: string, status?: 'live' | 'ended') => {
    const data = await api.getLiveStreams(category, status).catch(() => []);
    setLiveStreams(data || []);
  };

  const refreshFeedData = async () => {
    const [loadedPosts, loadedStories] = await Promise.all([
      api.getPosts().catch(() => []),
      api.getStories().catch(() => [])
    ]);
    setPosts(loadedPosts || []);
    setStories(loadedStories || []);
  };

  const refreshNotifications = async () => {
    const data = await api.getNotifications().catch(() => []);
    setNotifications(data || []);
  };

  const refreshConversations = async () => {
    const data = await api.getConversations().catch(() => []);
    setConversations(data || []);
    if (activeConversation) {
      const msgs = await api.getMessages(activeConversation.id).catch(() => []);
      setMessages(msgs || []);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const user = await api.getUser(currentUser.id);
      if (user) setCurrentUser(user);
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const sendMessage = async (content: string, type = 'text', mediaUrl?: string) => {
    if (!activeConversation || !currentUser) return;
    try {
      const msg = await api.sendMessage(activeConversation.id, {
        senderId: currentUser.id,
        content,
        type,
        mediaUrl
      });
      setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const startCall = (targetUser: User, type: 'voice' | 'video') => {
    if (!currentUser) return;
    const socket = getSocket();
    socket.emit('initiate_call', {
      from: currentUser,
      toUserId: targetUser.id,
      type
    });

    setActiveCall({
      id: `call_${Date.now()}`,
      caller: currentUser,
      receiver: targetUser,
      type,
      status: 'calling',
      startedAt: new Date().toISOString()
    });

    addToast(`Calling ${targetUser.name}...`, `Starting WebRTC ${type} session`, 'info');
  };

  const acceptCall = () => {
    if (!incomingCall || !currentUser) return;
    const socket = getSocket();
    socket.emit('answer_call', {
      callerId: incomingCall.caller.id,
      accepted: true
    });

    setActiveCall({
      id: incomingCall.callId,
      caller: incomingCall.caller,
      receiver: currentUser,
      type: incomingCall.type,
      status: 'connected',
      startedAt: new Date().toISOString()
    });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();
    socket.emit('answer_call', {
      callerId: incomingCall.caller.id,
      accepted: false
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (!activeCall) return;
    const target = activeCall.caller.id === currentUser?.id ? activeCall.receiver : activeCall.caller;
    const socket = getSocket();
    socket.emit('end_call', { targetUserId: target.id });
    setActiveCall(null);
  };

  const refreshUserCoins = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getCoinBalance(currentUser.id);
      if (data && typeof data.coins === 'number') {
        setUserCoins(data.coins);
      }
    } catch (err) {
      console.error('Error fetching coin balance:', err);
    }
  }, [currentUser]);

  const refreshCreatorEarnings = useCallback(async () => {
    if (!currentUser) return;
    try {
      const earnings = await api.getCreatorEarnings(currentUser.id);
      setCreatorEarnings(earnings);
    } catch (err) {
      console.error('Error fetching creator earnings:', err);
    }
  }, [currentUser]);

  const refreshReferralStats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [stats, convs] = await Promise.all([
        api.getReferralStats(currentUser.id),
        api.getReferralConversions(currentUser.id)
      ]);
      setReferralStats(stats);
      setReferralConversions(convs || []);
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    }
  }, [currentUser]);

  const buyCoins = useCallback(async (packageId?: string, customAmount?: number, paymentMethod: string = 'card'): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await api.purchaseCoins(currentUser.id, packageId, customAmount, paymentMethod);
      setUserCoins(res.newBalance);
      addToast('Coins Added!', `+${res.addedCoins.toLocaleString()} Virtual Coins credited to your wallet!`, 'success');
      return true;
    } catch (err: any) {
      addToast('Coin Purchase Failed', err.message || 'Payment processing failed.', 'error');
      return false;
    }
  }, [currentUser, addToast]);

  const sendLiveGift = useCallback(async (streamId: string, giftId: string, comboCount: number = 1): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await api.sendLiveGift(streamId, currentUser.id, giftId, comboCount);
      setUserCoins(res.senderCoins);
      setActiveGiftOverlay({
        ...res.gift,
        timestamp: Date.now()
      });
      
      // Auto clear overlay animation after 4 seconds
      setTimeout(() => {
        setActiveGiftOverlay(null);
      }, 4000);

      return true;
    } catch (err: any) {
      addToast('Gift Not Sent', err.message || 'Unable to send gift. Please check coin balance.', 'error');
      return false;
    }
  }, [currentUser, addToast]);

  const requestCreatorWithdrawal = useCallback(async (amountUSD: number, paymentMethod: any, accountDetails: any): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await api.requestWithdrawal({
        creatorId: currentUser.id,
        amountUSD,
        paymentMethod,
        accountDetails
      });
      await refreshCreatorEarnings();
      addToast('Withdrawal Submitted', `Your payout request of $${amountUSD.toFixed(2)} is pending admin approval.`, 'success');
      return true;
    } catch (err: any) {
      addToast('Withdrawal Failed', err.message || 'Could not submit withdrawal.', 'error');
      return false;
    }
  }, [currentUser, refreshCreatorEarnings, addToast]);

  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    await api.markNotificationsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const switchDemoUser = async (userId: string) => {
    try {
      const user = await api.getUser(userId);
      if (user) {
        setCurrentUser(user);
        addToast('Switched Profile', `Now logged in as ${user.name} (${user.role.replace('_', ' ').toUpperCase()})`, 'success');
      }
    } catch (err) {
      console.error('Error switching profile:', err);
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: !!currentUser,
        currentTab,
        setCurrentTab,
        selectedUserId,
        setSelectedUserId,
        selectedGroupId,
        setSelectedGroupId,
        selectedPageId,
        setSelectedPageId,
        posts,
        stories,
        reels,
        liveStreams,
        activeLiveStream,
        setActiveLiveStream,
        activeBroadcastStream,
        setActiveBroadcastStream,
        refreshPosts,
        refreshStories,
        refreshReels,
        refreshLiveStreams,
        refreshFeedData,
        refreshNotifications,
        refreshConversations,
        refreshCurrentUser,
        showGoLiveModal,
        setShowGoLiveModal,
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        sendMessage,
        floatingChatUser,
        setFloatingChatUser,
        activeCall,
        incomingCall,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        notifications,
        unreadNotifsCount,
        markNotificationsAsRead,
        theme,
        themeMode,
        setThemeMode,
        toggleTheme,
        walletBalance,
        walletCurrency,
        setWalletCurrency,
        showWalletModal,
        setShowWalletModal,
        walletTransactions,
        depositFunds,
        withdrawFunds,
        exchangeRateNGN,
        userCoins,
        refreshUserCoins,
        buyCoins,
        virtualGifts,
        coinPackages,
        sendLiveGift,
        activeGiftOverlay,
        setActiveGiftOverlay,
        creatorEarnings,
        refreshCreatorEarnings,
        requestCreatorWithdrawal,
        referralStats,
        referralConversions,
        refreshReferralStats,
        isPwaInstalled,
        canInstallPwa,
        installPwa,
        savedPostIds,
        toggleSavePost,
        showQuickCreate,
        setShowQuickCreate,
        showCreatePost,
        setShowCreatePost,
        pendingUploadFiles,
        setPendingUploadFiles,
        showCreateStory,
        setShowCreateStory,
        activeStoryModal,
        setActiveStoryModal,
        showUploadReel,
        setShowUploadReel,
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode,
        showCreateGroup,
        setShowCreateGroup,
        showCreatePage,
        setShowCreatePage,
        showCreateListing,
        setShowCreateListing,
        checkoutItem,
        setCheckoutItem,
        showVerificationModal,
        setShowVerificationModal,
        activeFullscreenPost,
        setActiveFullscreenPost,
        openFullscreenPost,
        closeFullscreenPost,
        updatePostInFeed,
        followingUserIds,
        toggleFollowUser,
        isFollowingUser,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        switchDemoUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
