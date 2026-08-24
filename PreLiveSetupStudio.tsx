import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, ArrowLeft, Radio, Camera, Video, VideoOff, Mic, MicOff, 
  FlipHorizontal, Sparkles, Sliders, Settings, Rocket, BarChart3, 
  Crown, Users, Share2, Target, Plus, Check, CheckCircle2, 
  AlertCircle, Image as ImageIcon, Wand2, Volume2, Globe, Shield, 
  Lock, Flame, Tag, RefreshCw, ChevronRight, Play, Eye, Layers, Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { LiveStreamCategory, LiveStream, VirtualGift } from '../../types';
import { LiveDiscoverySection } from './LiveDiscoverySection';
import { CoinRechargeModal } from './CoinRechargeModal';

// Categories Configuration
const CATEGORIES: { id: LiveStreamCategory; label: string; icon: string; desc: string }[] = [
  { id: 'chat', label: 'Just Chatting', icon: '💬', desc: 'Hangout, talk & AMA' },
  { id: 'gaming', label: 'Gaming & Esports', icon: '🎮', desc: 'Gameplay, ranked & speedruns' },
  { id: 'music', label: 'Music & DJ', icon: '🎵', desc: 'Singing, instruments & mixes' },
  { id: 'coding', label: 'Coding & Tech', icon: '💻', desc: 'Software, web & tech builds' },
  { id: 'crypto', label: 'Crypto & Web3', icon: '⚡', desc: 'Market analysis & blockchain' },
  { id: 'trading', label: 'Trading & Finance', icon: '📈', desc: 'Stocks, forex & investing' },
  { id: 'fitness', label: 'Fitness & Health', icon: '💪', desc: 'Workouts, yoga & wellness' },
  { id: 'lifestyle', label: 'Lifestyle & Travel', icon: '🌴', desc: 'Vlogging, cooking & daily life' },
  { id: 'education', label: 'Education & Masterclass', icon: '📚', desc: 'Tutorials & workshops' },
  { id: 'art', label: 'Art & Design', icon: '🎨', desc: 'Illustration, 3D & crafts' }
];

// Preset Aesthetic Cover Photos
const PRESET_COVERS = [
  {
    name: 'Modern Creator Studio',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    category: 'chat'
  },
  {
    name: 'Cyberpunk Neon Gaming',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    category: 'gaming'
  },
  {
    name: 'Electronic DJ Club',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    category: 'music'
  },
  {
    name: 'Tech & Code Workspace',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    category: 'coding'
  },
  {
    name: 'Global Finance & Crypto',
    url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
    category: 'crypto'
  },
  {
    name: 'Fitness & Energy Workout',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    category: 'fitness'
  }
];

// Smart title recommendations
const SMART_TITLES = [
  'Late Night Chill & Q&A! Drop Your Questions 🔴',
  'Building Full-Stack App Live • Code & Chill 💻',
  'Road to Champion Rank • Live Gameplay & Fun 🎮',
  'Live Music Jam & Song Requests • Let\'s Vibe 🎵',
  'Crypto & Market Breakdown • Live Trading Analysis 📈',
  'Interactive Talk & Sending Gifts Back to Viewers 🎁'
];

export interface PreLiveStudioProps {
  onClose?: () => void;
}

export const PreLiveSetupStudio: React.FC<PreLiveStudioProps> = ({ onClose }) => {
  const { 
    currentUser, 
    setCurrentTab, 
    setActiveLiveStream, 
    setActiveBroadcastStream,
    refreshLiveStreams,
    addToast,
    userCoins,
    virtualGifts
  } = useApp() as any;

  // View state: 'studio' (Broadcast Setup) | 'explore' (Live Discovery Hub)
  const [activeTab, setActiveTab] = useState<'studio' | 'explore'>('studio');

  // Stream Configuration Fields
  const [title, setTitle] = useState<string>('Late Night Chill & AMA Session 🎙️');
  const [coverUrl, setCoverUrl] = useState<string>(
    currentUser?.avatar || PRESET_COVERS[0].url
  );
  const [category, setCategory] = useState<LiveStreamCategory>('chat');
  const [tags, setTags] = useState<string[]>(['nemdan', 'live', 'creator']);
  const [tagInput, setTagInput] = useState<string>('');
  const [streamSource, setStreamSource] = useState<'camera' | 'gaming' | 'studio'>('camera');
  
  // LIVE Goal Config
  const [liveGoal, setLiveGoal] = useState<{
    enabled: boolean;
    type: 'coins' | 'gift' | 'followers';
    target: number;
    current: number;
    giftId?: string;
    giftIcon?: string;
    giftName?: string;
    description: string;
  }>({
    enabled: true,
    type: 'gift',
    target: 50,
    current: 0,
    giftId: 'g_rose',
    giftIcon: '🌹',
    giftName: 'Rose',
    description: 'Special shoutout and song request for all gifters!'
  });

  // Creator Tools & Stream Settings
  const [streamSettings, setStreamSettings] = useState({
    allowComments: true,
    allowGifts: true,
    subscriberOnlyChat: false,
    ageRestricted: false,
    autoRecordVod: true,
    multiGuestEnabled: true,
    bannedWords: 'spam, hate, scam'
  });

  // Active Poll
  const [activePoll, setActivePoll] = useState<{
    enabled: boolean;
    question: string;
    options: string[];
    durationMinutes: number;
  }>({
    enabled: false,
    question: 'What should we do next on stream?',
    options: ['Live Q&A Session', 'Code New Feature', 'Play Music'],
    durationMinutes: 10
  });

  // Media & Hardware State
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [activeBeautyFilter, setActiveBeautyFilter] = useState<'natural' | 'radiant' | 'warm' | 'studio' | 'cool'>('natural');
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isGoingLive, setIsGoingLive] = useState<boolean>(false);

  // Modals & Sheets
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPromoteModal, setShowPromoteModal] = useState<boolean>(false);
  const [showPollModal, setShowPollModal] = useState<boolean>(false);
  const [showGuestModal, setShowGuestModal] = useState<boolean>(false);
  const [showCoverPicker, setShowCoverPicker] = useState<boolean>(false);
  const [showBeautyDrawer, setShowBeautyDrawer] = useState<boolean>(false);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);

  // Promotion Booster
  const [boostAudience, setBoostAudience] = useState<number>(5000);
  const [isPromoted, setIsPromoted] = useState<boolean>(false);

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Initialize and manage real camera/mic preview
  useEffect(() => {
    if (activeTab !== 'studio') {
      stopMediaStream();
      return;
    }

    if (cameraEnabled || micEnabled) {
      initMediaStream();
    } else {
      stopMediaStream();
    }

    return () => {
      stopMediaStream();
    };
  }, [activeTab, cameraEnabled, micEnabled, cameraFacing]);

  const initMediaStream = async () => {
    try {
      setPermissionError(null);
      stopMediaStream();

      // Request media stream with exact constraints
      const constraints: MediaStreamConstraints = {
        video: cameraEnabled ? {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: micEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setHasCameraPermission(cameraEnabled ? true : null);
      setHasMicPermission(micEnabled ? true : null);

      if (videoPreviewRef.current && cameraEnabled) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(e => console.warn('Preview autoPlay prevented:', e));
      }

      // Initialize Audio Meter if microphone is active
      if (micEnabled && stream.getAudioTracks().length > 0) {
        setupAudioAnalyser(stream);
      }
    } catch (err: any) {
      console.warn('Camera/Mic permission error or device unavailable:', err);
      setHasCameraPermission(false);
      setHasMicPermission(false);
      setPermissionError(
        'Camera or microphone access is restricted in this browser session. You can still preview and broadcast using our High-Definition Studio Feed.'
      );
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolumeLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio analyser setup failed:', e);
    }
  };

  const stopMediaStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  // Flip camera front / back
  const handleFlipCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
    addToast('Camera Flipped', cameraFacing === 'user' ? 'Switched to Rear Camera' : 'Switched to Front Camera', 'info');
  };

  // Handle Cover Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverUrl(event.target.result as string);
          setShowCoverPicker(false);
          addToast('Cover Updated', 'Custom broadcast thumbnail set.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture Snapshot from Camera Preview
  const handleCaptureSnapshot = () => {
    if (videoPreviewRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoPreviewRef.current.videoWidth || 720;
        canvas.height = videoPreviewRef.current.videoHeight || 1280;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoPreviewRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCoverUrl(dataUrl);
          setShowCoverPicker(false);
          addToast('Snapshot Saved', 'Camera snapshot set as live cover thumbnail.', 'success');
        }
      } catch (err) {
        addToast('Snapshot Error', 'Could not capture snapshot from video feed.', 'error');
      }
    }
  };

  // Tags management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Handle Close / Back
  const handleClose = () => {
    stopMediaStream();
    if (onClose) {
      onClose();
    } else {
      setCurrentTab('feed');
    }
  };

  // 🚀 EXECUTE "GO LIVE" BROADCAST
  const handleGoLive = async () => {
    if (!title.trim()) {
      addToast('Title Required', 'Please enter an engaging title for your live stream.', 'warning');
      return;
    }

    setIsGoingLive(true);

    try {
      // 1. Determine stream video URL & thumbnail
      const streamUrl = 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4';
      const finalThumbnail = coverUrl || currentUser?.avatar || PRESET_COVERS[0].url;

      // 2. Prepare payload
      const liveStreamPayload: Partial<LiveStream> = {
        title: title.trim(),
        description: `Live broadcast by @${currentUser?.username || 'creator'} in #${category}`,
        category,
        streamUrl,
        videoUrl: streamUrl,
        thumbnailUrl: finalThumbnail,
        tags: tags.length > 0 ? tags : [category, 'nemdan', 'live'],
        hostId: currentUser?.id || 'usr_super_admin',
        hostName: currentUser?.name || 'Live Broadcaster',
        hostUsername: currentUser?.username || 'creator',
        hostAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        hostRole: currentUser?.role || 'creator',
        hostVerified: currentUser?.isVerified ?? true,
        pinnedMessage: liveGoal.enabled 
          ? `🎯 LIVE Goal: ${liveGoal.target} ${liveGoal.giftName || 'Coins'} — ${liveGoal.description}` 
          : `Welcome to ${currentUser?.name || 'our'} Live Stream! Type in chat & send gifts to support! 💖`
      };

      // 3. Call backend API to create and activate live session
      const createdStream: LiveStream = await api.createLiveStream(liveStreamPayload);

      addToast('🔴 You are LIVE!', `Broadcasting "${createdStream.title}" to NEMDAN community!`, 'success');

      // 4. Pass active live camera MediaStream to the broadcaster session
      if (mediaStreamRef.current && mediaStreamRef.current.active) {
        setActiveBroadcastStream(mediaStreamRef.current);
      }

      // 5. Refresh global streams & immediately transition into Full-Screen Broadcaster screen
      await refreshLiveStreams();
      setActiveLiveStream(createdStream);
      setCurrentTab('live');

    } catch (err: any) {
      console.error('Failed to start live stream broadcast:', err);
      addToast('Broadcast Error', err.message || 'Unable to start live stream session. Please retry.', 'error');
    } finally {
      setIsGoingLive(false);
    }
  };

  // If user chooses to switch to the Live Discovery Hub
  if (activeTab === 'explore') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Sub-header to switch back to Studio */}
        <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('studio')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all cursor-pointer shadow-md"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Open Pre-Live Studio</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Explore All Streams</span>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <LiveDiscoverySection />
      </div>
    );
  }

  const selectedCategoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] sm:h-screen max-h-screen bg-slate-950 text-white overflow-hidden flex flex-col items-center justify-center select-none font-sans">
      
      {/* 1. FULL-SCREEN BACKGROUND CAMERA PREVIEW / STUDIO CANVAS */}
      <div className="relative w-full h-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md xl:max-w-[460px] bg-black flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* Real-time Video Preview Element */}
        {cameraEnabled && !permissionError ? (
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
              cameraFacing === 'user' ? 'scale-x-[-1]' : ''
            } ${
              activeBeautyFilter === 'radiant'
                ? 'brightness-110 contrast-105 saturate-110'
                : activeBeautyFilter === 'warm'
                ? 'sepia-20 hue-rotate-15'
                : activeBeautyFilter === 'studio'
                ? 'contrast-115 brightness-105'
                : activeBeautyFilter === 'cool'
                ? 'hue-rotate-180 saturate-110'
                : ''
            }`}
          />
        ) : (
          /* Fallback Ambient Studio Canvas */
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src={coverUrl}
              alt="Studio Backdrop"
              className="w-full h-full object-cover opacity-60 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
            
            {permissionError && (
              <div className="absolute inset-x-6 top-1/3 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-200 text-xs text-center space-y-2 z-20">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto animate-bounce" />
                <p className="font-semibold">{permissionError}</p>
                <button
                  type="button"
                  onClick={initMediaStream}
                  className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 cursor-pointer shadow-md"
                >
                  Enable Camera & Mic
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dark Vignette Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90 pointer-events-none z-10" />

        {/* 2. TOP ACTION HEADER */}
        <header className="relative z-20 px-4 pt-3.5 pb-2 flex items-center justify-between gap-3">
          
          {/* Close / Back Button */}
          <button
            id="prelive-back-btn"
            onClick={handleClose}
            title="Close / Back to Feed"
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Switcher Tabs (Studio Setup | Explore) */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl p-1 rounded-full border border-white/15 shadow-xl">
            <button
              onClick={() => setActiveTab('studio')}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Go Live</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Watch</span>
            </button>
          </div>

          {/* Flip Camera Quick Button */}
          <button
            id="prelive-flip-camera-top-btn"
            onClick={handleFlipCamera}
            title="Flip Front/Rear Camera"
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
          >
            <FlipHorizontal className="w-4.5 h-4.5 text-amber-400" />
          </button>
        </header>

        {/* 3. MAIN PRE-LIVE CONFIGURATION CARD (Title, Cover, Category, Goal) */}
        <div className="relative z-20 px-4 pt-1 space-y-3">
          
          {/* Card Container with Gloss & Dark Frost Backdrop */}
          <div className="p-3.5 rounded-3xl bg-black/65 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3">
            
            {/* Row 1: Thumbnail/Cover + Editable Title */}
            <div className="flex items-start gap-3">
              
              {/* Cover Photo Box with 'Change' badge */}
              <div 
                onClick={() => setShowCoverPicker(true)}
                className="relative w-16 h-20 rounded-2xl overflow-hidden border border-white/25 group cursor-pointer shrink-0 shadow-md hover:border-amber-400 transition-all"
              >
                <img
                  src={coverUrl}
                  alt="Live Cover"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex flex-col items-center justify-end p-1 transition-colors">
                  <span className="text-[9px] font-black uppercase tracking-tight bg-black/80 text-amber-300 px-1.5 py-0.5 rounded-md border border-white/20">
                    Change
                  </span>
                </div>
              </div>

              {/* Title Field + Character Counter */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <span>Live Title</span>
                    <Wand2 className="w-3 h-3 text-amber-400" />
                  </span>
                  <span className="text-[10px] text-slate-400">{title.length}/100</span>
                </div>

                <input
                  type="text"
                  id="prelive-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a title to attract viewers..."
                  maxLength={100}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-rose-500 text-white placeholder-white/50 text-xs font-bold focus:outline-hidden transition-all"
                />

                {/* Quick Title Suggestion Generator */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const next = SMART_TITLES[Math.floor(Math.random() * SMART_TITLES.length)];
                      setTitle(next);
                    }}
                    className="text-[9px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md whitespace-nowrap cursor-pointer flex items-center gap-1"
                  >
                    <span>✨ Random Title</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Category Selector Pill + LIVE Goal Option */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              
              {/* Category Selector Pill */}
              <button
                type="button"
                id="prelive-category-selector-btn"
                onClick={() => setShowCategoryPicker(true)}
                className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{selectedCategoryObj.icon}</span>
                  <span className="text-[11px] font-bold text-white truncate">
                    {selectedCategoryObj.label}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white shrink-0" />
              </button>

              {/* LIVE Goal Pill / Button */}
              <button
                type="button"
                id="prelive-live-goal-btn"
                onClick={() => setShowGoalModal(true)}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl border text-left transition-all cursor-pointer group ${
                  liveGoal.enabled
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-400/40 text-amber-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{liveGoal.giftIcon || '🎯'}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black truncate leading-tight">
                      {liveGoal.enabled ? `Goal: ${liveGoal.target} ${liveGoal.giftName || 'Coins'}` : 'Add LIVE Goal'}
                    </p>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 shrink-0" />
              </button>

            </div>

            {/* Active Live Goal Summary Bar (if configured) */}
            {liveGoal.enabled && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between text-[11px] text-amber-200">
                <div className="flex items-center gap-2 truncate">
                  <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{liveGoal.description}</span>
                </div>
                <span className="font-extrabold shrink-0 ml-2">0/{liveGoal.target}</span>
              </div>
            )}

            {/* Promotion Badge Banner (if boosted) */}
            {isPromoted && (
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 flex items-center justify-between text-[11px] text-purple-200 animate-pulse">
                <div className="flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-purple-300" />
                  <span className="font-bold">NEMDAN Boost Active (+{boostAudience.toLocaleString()} Reach)</span>
                </div>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-purple-500 text-white">
                  PROMOTED
                </span>
              </div>
            )}

          </div>

        </div>

        {/* 4. RIGHT-SIDE FLOATING CREATOR TOOLS TOOLBAR */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 items-center">
          
          {/* Flip Camera */}
          <button
            type="button"
            id="tool-flip-camera"
            onClick={handleFlipCamera}
            className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white shadow-xl transition-all cursor-pointer active:scale-90 group"
          >
            <FlipHorizontal className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors" />
            <span className="text-[9px] font-bold text-white/80">Flip</span>
          </button>

          {/* Beautify / Enhance */}
          <button
            type="button"
            id="tool-beauty-filters"
            onClick={() => setShowBeautyDrawer(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white shadow-xl transition-all cursor-pointer active:scale-90 group"
          >
            <Sparkles className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-white/80">Enhance</span>
          </button>

          {/* Microphone Status & VU Meter */}
          <button
            type="button"
            id="tool-toggle-mic"
            onClick={() => setMicEnabled(!micEnabled)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl backdrop-blur-xl border shadow-xl transition-all cursor-pointer active:scale-90 relative ${
              micEnabled 
                ? 'bg-black/60 hover:bg-black/90 border-white/20 text-white' 
                : 'bg-rose-600/90 border-rose-400 text-white'
            }`}
          >
            {micEnabled ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5 text-white" />}
            <span className="text-[9px] font-bold text-white/80">{micEnabled ? 'Mic ON' : 'Muted'}</span>
            
            {/* Live Audio Volume indicator dot */}
            {micEnabled && (
              <span 
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping"
                style={{ opacity: micVolumeLevel > 15 ? 1 : 0.4 }}
              />
            )}
          </button>

          {/* Promote Stream */}
          <button
            type="button"
            id="tool-promote-stream"
            onClick={() => setShowPromoteModal(true)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl backdrop-blur-xl border shadow-xl transition-all cursor-pointer active:scale-90 group ${
              isPromoted ? 'bg-purple-600/80 border-purple-400 text-white' : 'bg-black/60 hover:bg-black/90 border-white/20 text-white'
            }`}
          >
            <Rocket className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-white/80">Promote</span>
          </button>

          {/* Interactive Poll */}
          <button
            type="button"
            id="tool-create-poll"
            onClick={() => setShowPollModal(true)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-2xl backdrop-blur-xl border shadow-xl transition-all cursor-pointer active:scale-90 group ${
              activePoll.enabled ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-black/60 hover:bg-black/90 border-white/20 text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-white/80">Poll</span>
          </button>

          {/* Multi-Guest & Co-Hosts */}
          <button
            type="button"
            id="tool-guests-cohost"
            onClick={() => setShowGuestModal(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white shadow-xl transition-all cursor-pointer active:scale-90 group"
          >
            <Users className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-white/80">Guests</span>
          </button>

          {/* Stream Settings */}
          <button
            type="button"
            id="tool-stream-settings"
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white shadow-xl transition-all cursor-pointer active:scale-90 group"
          >
            <Settings className="w-5 h-5 text-slate-300 group-hover:rotate-45 transition-transform" />
            <span className="text-[9px] font-bold text-white/80">Settings</span>
          </button>

        </div>

        {/* 5. BOTTOM BROADCAST CONTROL SECTION */}
        <div className="relative z-20 px-5 pb-6 pt-2 space-y-4">
          
          {/* Stream Source Mode Selector */}
          <div className="flex items-center justify-center gap-6 text-xs font-extrabold text-white/70">
            <button
              type="button"
              onClick={() => {
                setStreamSource('camera');
                setCameraEnabled(true);
              }}
              className={`transition-all cursor-pointer ${
                streamSource === 'camera' 
                  ? 'text-white scale-110 border-b-2 border-rose-500 pb-0.5' 
                  : 'hover:text-white'
              }`}
            >
              DEVICE CAMERA
            </button>

            <button
              type="button"
              onClick={() => {
                setStreamSource('gaming');
                addToast('Gaming Screen Share', 'Mobile Gaming broadcast mode selected.', 'info');
              }}
              className={`transition-all cursor-pointer ${
                streamSource === 'gaming' 
                  ? 'text-white scale-110 border-b-2 border-rose-500 pb-0.5' 
                  : 'hover:text-white'
              }`}
            >
              MOBILE GAMING
            </button>

            <button
              type="button"
              onClick={() => {
                setStreamSource('studio');
                addToast('Studio HD Feed', 'High-Definition studio broadcast feed selected.', 'info');
              }}
              className={`transition-all cursor-pointer ${
                streamSource === 'studio' 
                  ? 'text-white scale-110 border-b-2 border-rose-500 pb-0.5' 
                  : 'hover:text-white'
              }`}
            >
              LIVE STUDIO
            </button>
          </div>

          {/* 🔴 LARGE, HIGHLY VISIBLE "GO LIVE" BUTTON */}
          <button
            id="go-live-master-broadcast-btn"
            onClick={handleGoLive}
            disabled={isGoingLive || !title.trim()}
            className="w-full py-4 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:brightness-110 active:scale-98 text-white font-black text-base uppercase tracking-wider shadow-2xl shadow-rose-600/60 border-2 border-rose-400/40 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {/* Shimmer flare effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="w-7 h-7 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-md shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>

            <span className="drop-shadow-md">
              {isGoingLive ? 'Connecting Studio & Starting...' : 'GO LIVE'}
            </span>

            {/* Pulsing broadcast ring */}
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </button>

          {/* Micro Status Summary info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Broadcast 1080p • 60 FPS</span>
            </div>
            <span>Auto-saving VOD replay</span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CATEGORY PICKER SHEET                                            */}
      {/* ========================================================================= */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                <div>
                  <h3 className="text-base font-black text-white">Select Live Category</h3>
                  <p className="text-xs text-slate-400">Help viewers discover your stream</p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setShowCategoryPicker(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-rose-600/20 border-rose-500 text-white ring-1 ring-rose-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-black text-xs text-white">{cat.label}</p>
                      <p className="text-[11px] text-slate-400">{cat.desc}</p>
                    </div>
                  </div>
                  {category === cat.id && (
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIVE GOAL CONFIGURATOR                                           */}
      {/* ========================================================================= */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[88vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-white">Configure LIVE Goal</h3>
                  <p className="text-xs text-slate-400">Set interactive gift or coin target for chat</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
              
              {/* Enable Goal Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs font-bold text-white">Enable LIVE Goal Overlay</span>
                <input
                  type="checkbox"
                  checked={liveGoal.enabled}
                  onChange={(e) => setLiveGoal({ ...liveGoal, enabled: e.target.checked })}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Goal Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Goal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'gift' as const, label: 'Virtual Gift', icon: '🌹' },
                    { type: 'coins' as const, label: 'Total Coins', icon: '🪙' },
                    { type: 'followers' as const, label: 'New Followers', icon: '👥' }
                  ].map(item => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setLiveGoal({ ...liveGoal, type: item.type })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        liveGoal.type === item.type
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{item.icon}</span>
                      <span className="text-[10px] block truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Selector if Gift Type */}
              {liveGoal.type === 'gift' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Target Gift</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(virtualGifts || [
                      { id: 'g_rose', name: 'Rose', icon: '🌹' },
                      { id: 'g_kiss', name: 'Flying Kiss', icon: '💋' },
                      { id: 'g_diamond', name: 'Diamond Ring', icon: '💍' },
                      { id: 'g_galaxy', name: 'Galaxy Universe', icon: '🌌' }
                    ]).slice(0, 8).map((g: any) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setLiveGoal({
                          ...liveGoal,
                          giftId: g.id,
                          giftIcon: g.icon,
                          giftName: g.name
                        })}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          liveGoal.giftId === g.id
                            ? 'bg-rose-600/30 border-rose-500 text-white font-bold ring-2 ring-rose-500'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-xl block">{g.icon}</span>
                        <span className="text-[9px] block truncate">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Count</label>
                <div className="flex items-center gap-2">
                  {[20, 50, 100, 500, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLiveGoal({ ...liveGoal, target: val })}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        liveGoal.target === val
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward / Benefit Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Goal Perk / Reward Note</label>
                <input
                  type="text"
                  value={liveGoal.description}
                  onChange={(e) => setLiveGoal({ ...liveGoal, description: e.target.value })}
                  placeholder="e.g. Special song request + VIP shoutout!"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

            </div>

            <button
              onClick={() => {
                setShowGoalModal(false);
                addToast('LIVE Goal Set', `Target of ${liveGoal.target} ${liveGoal.giftName || 'Coins'} saved.`, 'success');
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer"
            >
              Save LIVE Goal
            </button>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BEAUTY & STUDIO FILTERS DRAWER                                   */}
      {/* ========================================================================= */}
      {showBeautyDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900/95 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-black text-white">Camera Enhancement & Studio Filters</h3>
              </div>
              <button
                onClick={() => setShowBeautyDrawer(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'natural' as const, label: 'Natural', icon: '🌿' },
                { id: 'radiant' as const, label: 'Radiant', icon: '✨' },
                { id: 'warm' as const, label: 'Warm Glow', icon: '🌅' },
                { id: 'studio' as const, label: 'Studio HD', icon: '💡' },
                { id: 'cool' as const, label: 'Cyber Cool', icon: '❄️' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveBeautyFilter(f.id)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeBeautyFilter === f.id
                      ? 'bg-rose-600/30 border-rose-500 text-white font-bold ring-2 ring-rose-500 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xl block mb-1">{f.icon}</span>
                  <span className="text-[10px] block truncate">{f.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBeautyDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: STREAM SETTINGS & MODERATION                                     */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-300" />
                <h3 className="text-base font-black text-white">Live Broadcast Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 text-xs">
              
              {/* Allow Comments */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div>
                  <p className="font-bold text-white">Live Chat & Comments</p>
                  <p className="text-[11px] text-slate-400">Allow viewers to send real-time chat</p>
                </div>
                <input
                  type="checkbox"
                  checked={streamSettings.allowComments}
                  onChange={(e) => setStreamSettings({ ...streamSettings, allowComments: e.target.checked })}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Allow Virtual Gifts */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div>
                  <p className="font-bold text-white">Virtual Gifting & Tips</p>
                  <p className="text-[11px] text-slate-400">Allow viewers to send 3D animated gifts & coins</p>
                </div>
                <input
                  type="checkbox"
                  checked={streamSettings.allowGifts}
                  onChange={(e) => setStreamSettings({ ...streamSettings, allowGifts: e.target.checked })}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Subscriber-only Chat */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div>
                  <p className="font-bold text-white">Subscriber-Only Chat</p>
                  <p className="text-[11px] text-slate-400">Restrict chat messages to paid subscribers</p>
                </div>
                <input
                  type="checkbox"
                  checked={streamSettings.subscriberOnlyChat}
                  onChange={(e) => setStreamSettings({ ...streamSettings, subscriberOnlyChat: e.target.checked })}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Age Restriction */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div>
                  <p className="font-bold text-white">18+ Age Restricted</p>
                  <p className="text-[11px] text-slate-400">Mark stream for mature audiences only</p>
                </div>
                <input
                  type="checkbox"
                  checked={streamSettings.ageRestricted}
                  onChange={(e) => setStreamSettings({ ...streamSettings, ageRestricted: e.target.checked })}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Auto Save VOD Replay */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div>
                  <p className="font-bold text-white">Auto-Save Broadcast Replay</p>
                  <p className="text-[11px] text-slate-400">Save full video replay + chat log for followers</p>
                </div>
                <input
                  type="checkbox"
                  checked={streamSettings.autoRecordVod}
                  onChange={(e) => setStreamSettings({ ...streamSettings, autoRecordVod: e.target.checked })}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Banned Words Filter */}
              <div className="space-y-1 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <label className="font-bold text-white block">Automated Chat Filter (Banned Words)</label>
                <input
                  type="text"
                  value={streamSettings.bannedWords}
                  onChange={(e) => setStreamSettings({ ...streamSettings, bannedWords: e.target.value })}
                  placeholder="Comma separated words to block..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-hidden"
                />
              </div>

            </div>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                addToast('Settings Saved', 'Live studio settings applied.', 'success');
              }}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase cursor-pointer shadow-md"
            >
              Save Settings
            </button>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PROMOTE & NEMDAN BOOST                                           */}
      {/* ========================================================================= */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-black text-white">NEMDAN Stream Booster</h3>
                  <p className="text-xs text-slate-400">Promote your stream to 10x more viewers</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { reach: 2500, coins: 50, badge: 'Standard Boost' },
                { reach: 5000, coins: 100, badge: 'Popular 🔥' },
                { reach: 15000, coins: 250, badge: 'Mega Spotlight 👑' }
              ].map(opt => (
                <button
                  key={opt.reach}
                  type="button"
                  onClick={() => setBoostAudience(opt.reach)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    boostAudience === opt.reach
                      ? 'bg-purple-600/30 border-purple-400 text-white ring-2 ring-purple-500'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">+{opt.reach.toLocaleString()} Viewers</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 font-bold border border-purple-400/30">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Featured in Top Live Discover & Follower Alerts</p>
                  </div>
                  <span className="font-extrabold text-amber-300 text-sm">{opt.coins} Coins</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 text-xs">
              <span className="text-slate-300">Your Coin Balance:</span>
              <span className="font-black text-amber-300">🪙 {userCoins.toLocaleString()} Coins</span>
            </div>

            <button
              onClick={() => {
                if (userCoins < 50) {
                  addToast('Insufficient Coins', 'Recharge wallet coins to activate booster.', 'warning');
                  setShowRechargeModal(true);
                  return;
                }
                setIsPromoted(true);
                setShowPromoteModal(false);
                addToast('Stream Boosted! 🚀', `Your stream will be promoted to +${boostAudience.toLocaleString()} viewers!`, 'success');
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
            >
              Activate Booster Now
            </button>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: COVER THUMBNAIL PICKER                                           */}
      {/* ========================================================================= */}
      {showCoverPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Change Live Cover Photo</h3>
              </div>
              <button
                onClick={() => setShowCoverPicker(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-bold text-white">Upload from Device</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-6 h-6 text-emerald-400" />
                <span className="text-xs font-bold text-white">Take Camera Snapshot</span>
              </button>
            </div>

            {/* Curated Preset Covers */}
            <div className="space-y-2 overflow-y-auto flex-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Preset Themes</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCoverUrl(preset.url);
                      setShowCoverPicker(false);
                      addToast('Cover Selected', preset.name, 'info');
                    }}
                    className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 transition-all group cursor-pointer"
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white truncate bg-black/60 px-1 rounded">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: LIVE POLL MODAL                                                  */}
      {/* ========================================================================= */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white">Create Live Poll</h3>
              </div>
              <button
                onClick={() => setShowPollModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Poll Question</label>
                <input
                  type="text"
                  value={activePoll.question}
                  onChange={(e) => setActivePoll({ ...activePoll, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Options</label>
                {activePoll.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...activePoll.options];
                      newOpts[idx] = e.target.value;
                      setActivePoll({ ...activePoll, options: newOpts });
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActivePoll({ ...activePoll, enabled: true });
                setShowPollModal(false);
                addToast('Live Poll Active', 'Poll will appear on screen when you go live.', 'success');
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Launch Live Poll
            </button>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: MULTI-GUEST & CO-HOST                                            */}
      {/* ========================================================================= */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">Multi-Guest & Co-Hosts</h3>
              </div>
              <button
                onClick={() => setShowGuestModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Allow Multi-Guest Video Boxes</p>
                  <p className="text-[11px] text-slate-400">Up to 4 viewers can join your live stage</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500 rounded" />
              </div>

              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Enable Co-Host PK Battles</p>
                  <p className="text-[11px] text-slate-400">Compete with other streamers in timed gift battles</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500 rounded" />
              </div>
            </div>

            <button
              onClick={() => {
                setShowGuestModal(false);
                addToast('Guest Settings Applied', 'Multi-guest video boxes enabled.', 'success');
              }}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Confirm Guest Settings
            </button>

          </div>
        </div>
      )}

      {/* Coin Recharge Modal */}
      <CoinRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />

    </div>
  );
};
