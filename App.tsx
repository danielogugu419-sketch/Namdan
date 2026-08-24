import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { FeedView } from './components/FeedView';
import { ReelsView } from './components/ReelsView';
import { StoryViewerModal } from './components/StoryViewerModal';
import { FullscreenPostModal } from './components/FullscreenPostModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { CreatePostModal } from './components/CreatePostModal';
import { UploadReelModal } from './components/ReelsView';
import { QuickCreateModal } from './components/QuickCreateModal';
import { FriendsView } from './components/FriendsView';
import { MenuView } from './components/MenuView';
import { SavedPostsView } from './components/SavedPostsView';
import { MessengerView, FloatingChatDock } from './components/MessengerView';
import { MarketplaceView, CreateListingModal, CheckoutOrderModal } from './components/MarketplaceView';
import { GroupsView, CreateGroupModal } from './components/GroupsView';
import { PagesView, CreatePageModal } from './components/PagesView';
import { ProfileView, VerificationModal } from './components/ProfileView';
import { CreatorDashboardView } from './components/CreatorDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { NotificationsView, SearchView } from './components/NotificationsView';
import { SettingsView, PWAInstallBanner } from './components/SettingsView';
import { WalletView } from './components/WalletView';
import { WalletModal } from './components/WalletModal';
import { CallModal } from './components/CallModal';
import { LiveStreamView } from './components/LiveStreamView';
import { GoLiveModal } from './components/GoLiveModal';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopRightSidebar } from './components/DesktopRightSidebar';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    currentTab, 
    activeLiveStream,
    toasts, 
    removeToast 
  } = useApp() as any;

  // Unauthenticated Visitors Landing
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <LandingPage />
        <AuthModal />
      </div>
    );
  }

  // Check if viewing full-screen live stream or reels
  const isFullScreenLive = currentTab === 'live' && !!activeLiveStream;
  const isFullScreenMode = currentTab === 'reels' || isFullScreenLive;

  // Views that use the standard 3-column / 2-column dashboard layout
  const isDashboardLayout = ['feed', 'friends', 'marketplace', 'groups', 'pages', 'saved', 'creator_studio', 'admin', 'settings', 'wallet'].includes(currentTab);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top PWA Banner */}
      {!isFullScreenMode && <PWAInstallBanner />}

      {/* 
        CONDITIONAL HEADER VISIBILITY LOGIC:
        Whenever viewing Reels or an Active Full-Screen LIVE stream, hide the top navigation bars
        to allow the vertical video to expand into an immersive, 100% viewport height full-screen view.
        The navigation bar remains visible across all other tabs.
      */}
      {!isFullScreenMode && <Navbar />}

      {/* Main View Router */}
      <main className={isFullScreenMode ? "h-screen w-full overflow-hidden bg-black flex flex-col" : "flex-1"}>
        {currentTab === 'reels' ? (
          <ReelsView />
        ) : isFullScreenLive ? (
          <LiveStreamView />
        ) : isDashboardLayout ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 flex gap-6 items-start justify-center">
            {/* Desktop Left Navigation Sidebar */}
            <DesktopSidebar />

            {/* Main Center Content Feed / Active Tab */}
            <div className="flex-1 min-w-0 max-w-2xl w-full">
              {currentTab === 'feed' && <FeedView />}
              {currentTab === 'friends' && <FriendsView />}
              {currentTab === 'marketplace' && <MarketplaceView />}
              {currentTab === 'groups' && <GroupsView />}
              {currentTab === 'pages' && <PagesView />}
              {currentTab === 'saved' && <SavedPostsView />}
              {currentTab === 'creator_studio' && <CreatorDashboardView />}
              {currentTab === 'admin' && <AdminDashboardView />}
              {currentTab === 'settings' && <SettingsView />}
              {currentTab === 'wallet' && <WalletView />}
            </div>

            {/* Desktop Right Context Sidebar (Contacts, Trending, Suggested) */}
            {currentTab === 'feed' && <DesktopRightSidebar />}
          </div>
        ) : (
          <div className={currentTab === 'live' ? "w-full" : "max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-4"}>
            {currentTab === 'live' && <LiveStreamView />}
            {currentTab === 'messages' && <MessengerView />}
            {currentTab === 'profile' && <ProfileView />}
            {currentTab === 'notifications' && <NotificationsView />}
            {currentTab === 'search' && <SearchView />}
            {currentTab === 'menu' && <MenuView />}
          </div>
        )}
      </main>

      {/* Global Modals & Overlays */}
      <WalletModal />
      <GoLiveModal />
      <QuickCreateModal />
      <AuthModal />
      <CreatePostModal />
      <CreateStoryModal />
      <StoryViewerModal />
      <FullscreenPostModal />
      <UploadReelModal />
      <CreateListingModal />
      <CheckoutOrderModal />
      <CreateGroupModal />
      <CreatePageModal />
      <VerificationModal />
      <CallModal />
      <FloatingChatDock />

      {/* Toast Notification Container */}
      <div className="fixed bottom-16 sm:bottom-5 left-3 sm:left-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-1.5rem)] sm:w-full pointer-events-none">
        {toasts?.map((toast: any) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl shadow-xl border flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              toast.type === 'success' 
                ? 'bg-slate-900 text-white border-slate-800' 
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800'
                : 'bg-blue-950 text-blue-100 border-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
              {toast.message && (
                <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast && removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 p-1 -mr-1 -mt-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
