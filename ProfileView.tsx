import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, MapPin, Briefcase, GraduationCap, 
  Calendar, UserPlus, MessageSquare, Edit3, 
  Share2, ShieldCheck, Film, Image as ImageIcon, 
  Bookmark, Lock, Sparkles, X, Plus, ThumbsUp,
  Camera, Upload, Loader2, Eye, Maximize2, Download, Check, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, Post, Reel } from '../types';
import { api } from '../services/api';
import { PostCard } from './PostCard';
import { PullToRefresh } from './PullToRefresh';

// Curated high-resolution aesthetic cover photos for Gallery Picker
const CURATED_COVER_PRESETS = [
  {
    id: 'preset-1',
    title: 'Aurora Gradient',
    category: 'Gradients',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'preset-2',
    title: 'Cyberpunk Neon Horizon',
    category: 'Futuristic',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'preset-3',
    title: 'Midnight Mountain Ridge',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'preset-4',
    title: 'Architectural Minimal',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'preset-5',
    title: 'Sunset Coastline',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=85'
  },
  {
    id: 'preset-6',
    title: 'Abstract Silicon Fluid',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85'
  }
];

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    selectedUserId, 
    setSelectedUserId, 
    setCurrentTab, 
    startCall, 
    setShowVerificationModal,
    addToast 
  } = useApp() as any;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'photos' | 'about'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);

  // =========================================================================
  // COVER PHOTO FEATURE STATE MANAGEMENT
  // =========================================================================
  // Controls bottom sheet visibility for cover photo options
  const [showCoverBottomSheet, setShowCoverBottomSheet] = useState(false);
  // Controls full-screen viewer modal for inspecting current cover photo
  const [showCoverFullscreenModal, setShowCoverFullscreenModal] = useState(false);
  // Controls gallery picker modal for selecting curated/suggested cover banners
  const [showGalleryPickerModal, setShowGalleryPickerModal] = useState(false);
  // Temporary preview URL for instant local feedback before committing
  const [tempCoverPreview, setTempCoverPreview] = useState<string | null>(null);
  // Pending base64 file data for uploading upon user confirmation
  const [pendingCoverFile, setPendingCoverFile] = useState<{ base64: string; fileName: string } | null>(null);
  // Loading state during API image upload / profile update
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Avatar upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement | null>(null);

  // Edit form state
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWork, setEditWork] = useState('');
  const [editEducation, setEditEducation] = useState('');

  const targetId = selectedUserId || currentUser?.id;

  useEffect(() => {
    if (!targetId) return;
    api.getUser(targetId).then(u => {
      setProfileUser(u);
      if (u) {
        setEditBio(u.bio || '');
        setEditLocation(u.location || '');
        setEditWork(u.work || '');
        setEditEducation(u.education || '');
      }
    });

    api.getPosts(undefined, targetId).then(posts => {
      setProfilePosts(posts || []);
    });
  }, [targetId]);

  if (!profileUser) return null;

  const isMe = currentUser?.id === profileUser.id;

  // Handle Avatar Image File Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast('Invalid Image Format', 'Please choose a JPG, PNG, or WEBP photo.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('File Too Large', 'Maximum image size is 15MB.', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    addToast('Updating Profile Picture', 'Uploading and saving your new avatar...', 'info');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, file.name, currentUser.id);
        const newAvatarUrl = uploadRes.url;

        // Persist avatar in user profile
        const updated = await api.updateUser(currentUser.id, { avatar: newAvatarUrl });
        setProfileUser(updated);
        setCurrentUser(updated);
        addToast('Avatar Updated', 'Your profile picture has been successfully updated!', 'success');
      } catch (err: any) {
        addToast('Avatar Upload Failed', err.message || 'Failed to save avatar image', 'error');
      } finally {
        setIsUploadingAvatar(false);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // =========================================================================
  // COVER PHOTO EVENT HANDLERS
  // =========================================================================

  /**
   * Reads selected file (from local upload or camera capture), creates an
   * instant preview in state, closes the bottom sheet, and waits for user confirmation.
   */
  const handleCoverFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid Image Format', 'Please choose a valid photo file.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('File Too Large', 'Maximum image size is 15MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Set instant local preview and store pending payload
      setTempCoverPreview(base64);
      setPendingCoverFile({ base64, fileName: file.name });
      setShowCoverBottomSheet(false);
      addToast('Cover Photo Selected', 'Previewing your new cover banner. Click "Save Changes" to apply.', 'info');
    };
    reader.readAsDataURL(file);

    // Reset input value to allow re-selection of identical file name
    e.target.value = '';
  };

  /**
   * Selects a curated photo from the gallery picker modal for instant preview.
   */
  const handleSelectGalleryPreset = (presetUrl: string) => {
    setTempCoverPreview(presetUrl);
    setPendingCoverFile(null); // Direct URL, no base64 upload needed
    setShowGalleryPickerModal(false);
    setShowCoverBottomSheet(false);
    addToast('Cover Selected', 'Review your selected cover photo and click "Save Changes" to apply.', 'info');
  };

  /**
   * Persists the previewed cover photo to the backend server and updates app state.
   */
  const handleSaveCoverPhoto = async () => {
    if (!tempCoverPreview || !currentUser) return;

    setIsUploadingCover(true);
    try {
      let finalCoverUrl = tempCoverPreview;

      // If it's a newly uploaded base64 file, send to upload API first
      if (pendingCoverFile) {
        const uploadRes = await api.uploadImage(
          pendingCoverFile.base64, 
          pendingCoverFile.fileName, 
          currentUser.id
        );
        finalCoverUrl = uploadRes.url;
      }

      // Persist cover photo in user record
      const updated = await api.updateUser(currentUser.id, { 
        coverPhoto: finalCoverUrl,
        coverImage: finalCoverUrl 
      });

      setProfileUser(updated);
      setCurrentUser(updated);
      setTempCoverPreview(null);
      setPendingCoverFile(null);
      addToast('Cover Photo Saved', 'Your new cover banner is live!', 'success');
    } catch (err: any) {
      addToast('Failed to Save Cover', err.message || 'Error updating cover photo.', 'error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  /**
   * Cancels the active temporary cover photo preview and reverts to current photo.
   */
  const handleCancelCoverPreview = () => {
    setTempCoverPreview(null);
    setPendingCoverFile(null);
    addToast('Preview Cancelled', 'Reverted back to your current cover photo.', 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateUser(profileUser.id, {
        bio: editBio,
        location: editLocation,
        work: editWork,
        education: editEducation
      });
      setProfileUser(updated);
      if (isMe) setCurrentUser(updated);
      setShowEditModal(false);
      addToast('Profile Updated', 'Changes saved successfully.', 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleToggleFriend = async () => {
    if (!currentUser) return;
    try {
      await api.toggleFriend(profileUser.id, currentUser.id);
      addToast('Connection Request Sent', `Request delivered to ${profileUser.name}`, 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleRefreshProfile = async () => {
    if (!targetId) return;
    const [user, posts] = await Promise.all([
      api.getUser(targetId).catch(() => null),
      api.getPosts(undefined, targetId).catch(() => [])
    ]);
    if (user) {
      setProfileUser(user);
      if (isMe) setCurrentUser(user);
    }
    setProfilePosts(posts || []);
    addToast('Profile Refreshed', `Loaded latest profile data for ${user?.name || profileUser.name}.`, 'info');
  };

  // Active cover photo URL (either temporary preview or committed photo)
  const currentCoverPhotoUrl = tempCoverPreview || profileUser.coverPhoto || profileUser.coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80';

  return (
    <PullToRefresh onRefresh={handleRefreshProfile} label="Profile">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-6">
      
      {/* Hidden File Inputs for Native Image & Camera Pickers */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />
      {/* Local File Selector for Cover Photo */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileSelection}
        className="hidden"
      />
      {/* Native Camera Capture for Cover Photo (Mobile capture API) */}
      <input
        ref={cameraCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCoverFileSelection}
        className="hidden"
      />

      {/* Profile Cover & Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Cover Photo Banner */}
        <div className="relative h-48 sm:h-64 bg-slate-800 group overflow-hidden">
          <img
            src={currentCoverPhotoUrl}
            alt="Cover"
            className={`w-full h-full object-cover transition-all duration-300 ${tempCoverPreview ? 'brightness-95' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* ========================================================================= */}
          {/* TEMPORARY PREVIEW CONFIRMATION FLOATING BAR                                */}
          {/* ========================================================================= */}
          {tempCoverPreview && (
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-blue-500/40 shadow-2xl animate-in slide-in-from-top-3">
              <div className="flex items-center gap-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-bold">Cover Photo Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="cancel-cover-preview-btn"
                  onClick={handleCancelCoverPreview}
                  disabled={isUploadingCover}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-cover-preview-btn"
                  onClick={handleSaveCoverPhoto}
                  disabled={isUploadingCover}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. CAMERA TRIGGER BUTTON (Bottom-Right corner of banner)                  */}
          {/* ========================================================================= */}
          {isMe && !tempCoverPreview && (
            <button
              id="cover-camera-trigger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowCoverBottomSheet(true);
              }}
              className="absolute bottom-4 right-4 px-3.5 py-2 bg-black/60 hover:bg-black/85 active:scale-95 backdrop-blur-md text-white text-xs font-bold rounded-2xl border border-white/25 shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              title="Change Cover Photo"
              aria-label="Change Cover Photo"
            >
              <Camera className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Edit Cover Photo</span>
            </button>
          )}
        </div>

        {/* Profile Avatar & Details Header */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4 text-center sm:text-left">
            
            {/* Avatar & Name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative group">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-white dark:bg-slate-800"
                />

                {/* Avatar Change Camera Button for Current User */}
                {isMe && (
                  <button
                    id="update-profile-avatar-btn"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 rounded-3xl bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                    title="Change Profile Picture"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-7 h-7 animate-spin text-white" />
                    ) : (
                      <>
                        <Camera className="w-7 h-7 stroke-[2.2] mb-1" />
                        <span className="text-[11px] font-bold">Update Photo</span>
                      </>
                    )}
                  </button>
                )}

                {/* Verified Badge */}
                {profileUser.isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900 text-white shadow-md">
                    <CheckCircle className="w-5 h-5 fill-white text-blue-600" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <span>{profileUser.name}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  @{profileUser.username} • <span className="capitalize font-semibold text-blue-700 dark:text-blue-400">{profileUser.role.replace('_', ' ')}</span>
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                  <span className="font-bold text-slate-900 dark:text-white">{profileUser.friends?.length || 428} <span className="font-normal text-slate-500">friends</span></span>
                  <span>•</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profileUser.followersCount?.toLocaleString() || '12.4K'} <span className="font-normal text-slate-500">followers</span></span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {isMe ? (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Bio & Info</span>
                  </button>

                  {!profileUser.isVerified && (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Request Blue Badge</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleToggleFriend}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('messages');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Bio text */}
          {profileUser.bio && (
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl text-center sm:text-left leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          {/* Quick Meta Grid */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {profileUser.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> Lives in <strong className="text-slate-700 dark:text-slate-200 font-semibold">{profileUser.location}</strong>
              </span>
            )}
            {profileUser.work && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Works at <strong className="text-slate-700 dark:text-slate-200 font-semibold">{profileUser.work}</strong>
              </span>
            )}
            {profileUser.education && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> Studied at <strong className="text-slate-700 dark:text-slate-200 font-semibold">{profileUser.education}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="px-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'posts' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'about' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            About & Transparency
          </button>
        </div>
      </div>

      {/* Profile Body Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {profilePosts.length > 0 ? (
            profilePosts.map(p => (
              <PostCard key={p.id} post={p} />
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400">
              <p className="text-sm">No posts published by this user yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">About {profileUser.name}</h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p><strong>Username:</strong> @{profileUser.username}</p>
              <p><strong>Member Since:</strong> {profileUser.joinedAt || '2026'}</p>
              <p><strong>Verification Status:</strong> {profileUser.isVerified ? 'Verified Official Account' : 'Standard User'}</p>
              <p><strong>Account Role:</strong> {profileUser.role.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BOTTOM SHEET / MODAL OPTIONS FOR CHANGE COVER PHOTO                     */}
      {/* ========================================================================= */}
      {showCoverBottomSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setShowCoverBottomSheet(false)}
        >
          <div 
            className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top drag handle indicator for mobile bottom sheet */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Cover photo</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose how you'd like to update your cover photo</p>
              </div>
              <button 
                onClick={() => setShowCoverBottomSheet(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Items List */}
            <div className="p-3 space-y-1.5">
              
              {/* Option 1: Take photo */}
              <button
                id="bottom-sheet-take-photo-btn"
                onClick={() => {
                  cameraCaptureInputRef.current?.click();
                }}
                className="w-full p-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Camera className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Take photo</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Use your device camera to capture a new photo</p>
                </div>
              </button>

              {/* Option 2: Upload Photo */}
              <button
                id="bottom-sheet-upload-photo-btn"
                onClick={() => {
                  coverInputRef.current?.click();
                }}
                className="w-full p-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Upload className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Upload photo</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose an image from your device library</p>
                </div>
              </button>

              {/* Option 3: Select Photo on Facebook / Gallery */}
              <button
                id="bottom-sheet-gallery-btn"
                onClick={() => {
                  setShowCoverBottomSheet(false);
                  setShowGalleryPickerModal(true);
                }}
                className="w-full p-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Select Photo on Facebook / Gallery</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Browse curated aesthetic wallpapers & past uploads</p>
                </div>
              </button>

              {/* Option 4: See cover photo */}
              <button
                id="bottom-sheet-see-photo-btn"
                onClick={() => {
                  setShowCoverBottomSheet(false);
                  setShowCoverFullscreenModal(true);
                }}
                className="w-full p-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">See cover photo</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View current cover photo in full high-resolution</p>
                </div>
              </button>

            </div>

            {/* Cancel Button */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCoverBottomSheet(false)}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GALLERY PICKER MODAL (Select Photo on Facebook / Gallery)                   */}
      {/* ========================================================================= */}
      {showGalleryPickerModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowGalleryPickerModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Choose Cover Photo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select from curated designer themes or albums</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGalleryPickerModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Featured Wallpapers</span>
                <span className="text-xs text-slate-400">{CURATED_COVER_PRESETS.length} Photos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CURATED_COVER_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectGalleryPreset(preset.url)}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs hover:shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <div className="h-32 w-full bg-slate-800 relative">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                        <div>
                          <p className="text-xs font-bold drop-shadow-sm">{preset.title}</p>
                          <p className="text-[10px] text-white/70">{preset.category}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowGalleryPickerModal(false);
                  coverInputRef.current?.click();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>

              <button
                onClick={() => setShowGalleryPickerModal(false)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FULLSCREEN COVER PHOTO VIEWER MODAL (See cover photo)                  */}
      {/* ========================================================================= */}
      {showCoverFullscreenModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setShowCoverFullscreenModal(false)}
        >
          {/* Top Bar */}
          <div 
            className="flex items-center justify-between text-white p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">{profileUser.name}'s Cover Photo</h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={currentCoverPhotoUrl}
                target="_blank"
                rel="noreferrer"
                download="cover-photo.jpg"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Download full image"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setShowCoverFullscreenModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Image Container */}
          <div className="flex-1 flex items-center justify-center p-2">
            <img
              src={currentCoverPhotoUrl}
              alt="Full Cover View"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Bar Info */}
          <div 
            className="text-center text-xs text-white/70 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span>High-definition banner view • Tap anywhere outside to dismiss</span>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Profile Details</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a bit about yourself..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs outline-hidden focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current City / Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work / Company</label>
                <input
                  type="text"
                  value={editWork}
                  onChange={(e) => setEditWork(e.target.value)}
                  placeholder="e.g. Lead Designer at NEMDAN Labs"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">College / Education</label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs outline-hidden focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      </div>
    </PullToRefresh>
  );
};

export const VerificationModal: React.FC = () => {
  const { 
    currentUser, 
    showVerificationModal, 
    setShowVerificationModal, 
    addToast 
  } = useApp() as any;

  const [category, setCategory] = useState('Creator / Digital Artist');
  const [documentType, setDocumentType] = useState('National ID');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showVerificationModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      await api.requestVerification({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        category,
        documentType,
        notes
      });
      setShowVerificationModal(false);
      addToast('Verification Request Submitted', 'NEMDAN Trust & Safety team will review your application within 24-48 hours.', 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Request Verified Blue Badge</h3>
          </div>
          <button onClick={() => setShowVerificationModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Verified badges confirm that this account is the authentic presence of a recognized creator, public figure, or verified business.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-hidden"
            >
              <option value="Creator / Digital Artist">Creator / Digital Artist</option>
              <option value="Journalist / Media">Journalist / Media</option>
              <option value="Verified Business / Brand">Verified Business / Brand</option>
              <option value="Community Leader">Community Leader</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proof of Identity Document</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-hidden"
            >
              <option value="National ID Card">National ID Card</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="Articles of Incorporation">Articles of Incorporation (Business)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Public Portfolio / Notability Links</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Include links to publications, verified social channels, or business website..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Submitting Application...' : 'Submit Verification Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
