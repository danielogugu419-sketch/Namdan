import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, Upload, Image as ImageIcon, Sparkles, Type, 
  Palette, Music, RotateCw, FlipHorizontal, Sliders, Smile, 
  MapPin, AtSign, Clock, Trash2, Plus, Check, Loader2, 
  Volume2, VolumeX, ZoomIn, ZoomOut, Move, RefreshCw, Send,
  HelpCircle, Sparkle, Tag, ShieldCheck, Flame, Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { StoryOverlayText, StorySticker } from '../types';

// Preset filters
const FILTER_PRESETS = [
  { id: 'normal', label: 'Normal', css: 'none' },
  { id: 'radiant', label: 'Radiant', css: 'brightness(1.1) contrast(1.1) saturate(1.25)' },
  { id: 'golden', label: 'Golden Hour', css: 'sepia(0.25) saturate(1.4) brightness(1.05) hue-rotate(-10deg)' },
  { id: 'neon', label: 'Cyber Neon', css: 'contrast(1.3) saturate(1.6) hue-rotate(15deg)' },
  { id: 'noir', label: 'Noir B&W', css: 'grayscale(1) contrast(1.25) brightness(0.95)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.4) contrast(0.95) brightness(1.05) saturate(1.1)' },
  { id: 'emerald', label: 'Emerald', css: 'hue-rotate(50deg) saturate(1.2) contrast(1.1)' },
  { id: 'vivid', label: 'Vivid', css: 'contrast(1.25) saturate(1.5) brightness(1.02)' }
];

// Preset gradient backgrounds
const GRADIENT_PRESETS = [
  { id: 'sunset', label: 'Sunset Glow', class: 'from-rose-500 via-purple-600 to-amber-500' },
  { id: 'ocean', label: 'Deep Ocean', class: 'from-blue-600 via-indigo-700 to-cyan-500' },
  { id: 'neon_night', label: 'Cyber Violet', class: 'from-fuchsia-600 via-purple-700 to-indigo-900' },
  { id: 'emerald', label: 'Aurora Teal', class: 'from-emerald-600 via-teal-700 to-slate-950' },
  { id: 'luxury_dark', label: 'Dark Onyx', class: 'from-slate-900 via-slate-800 to-zinc-950' },
  { id: 'flame', label: 'Solar Flare', class: 'from-red-600 via-amber-600 to-yellow-500' },
  { id: 'candy', label: 'Candy Pastel', class: 'from-pink-500 via-rose-400 to-indigo-500' }
];

// Preset sample photos
const SAMPLE_PHOTOS = [
  { label: 'Tokyo Neon', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80' },
  { label: 'Creative Studio', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=80' },
  { label: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&auto=format&fit=crop&q=80' },
  { label: 'Urban Golden', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&auto=format&fit=crop&q=80' },
  { label: 'Artisanal Clay', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&auto=format&fit=crop&q=80' },
  { label: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80' }
];

// Preset music tracks
const MUSIC_TRACKS = [
  { id: '1', title: 'Afrobeats Sunset Vibes', artist: 'NEMDAN Sounds', genre: 'Afrobeats' },
  { id: '2', title: 'Midnight Waves - LoFi Drift', artist: 'Chill Beats', genre: 'Lo-Fi' },
  { id: '3', title: 'Cyberpunk Neon Tokyo', artist: 'Synthwave Odyssey', genre: 'Electronic' },
  { id: '4', title: 'Nordic Calm - Ambient Piano', artist: 'Acoustic Soul', genre: 'Ambient' },
  { id: '5', title: 'Golden Hour Acoustic', artist: 'Sunset Sessions', genre: 'Acoustic' },
  { id: '6', title: 'Energy Trap Anthem 2026', artist: 'Club Bangers', genre: 'Trap' }
];

// Sticker options
const EMOJI_STICKERS = ['🔥', '❤️', '😍', '✨', '👏', '😂', '🎉', '💯', '👑', '🚀', '⚡', '💫', '🏝️', '💎', '🥳', '🙌'];

export const CreateStoryModal: React.FC = () => {
  const { 
    currentUser, 
    showCreateStory, 
    setShowCreateStory, 
    refreshStories, 
    addToast 
  } = useApp() as any;

  // Mode: 'media' | 'camera' | 'text'
  const [activeTab, setActiveTab] = useState<'media' | 'camera' | 'text'>('media');
  
  // Story core data
  const [mediaUrl, setMediaUrl] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [caption, setCaption] = useState<string>('');
  const [selectedGradient, setSelectedGradient] = useState<string>(GRADIENT_PRESETS[0].class);
  const [selectedMusic, setSelectedMusic] = useState<string>(MUSIC_TRACKS[0].title);
  
  // Transform & crop controls
  const [cropAspect, setCropAspect] = useState<'9:16' | '1:1' | '4:5' | 'original'>('9:16');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  
  // Overlay items (text & stickers)
  const [textOverlays, setTextOverlays] = useState<StoryOverlayText[]>([]);
  const [stickers, setStickers] = useState<StorySticker[]>([]);
  
  // Text Editor sub-modal state
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [currentTextDraft, setCurrentTextDraft] = useState<string>('');
  const [currentTextColor, setCurrentTextColor] = useState<string>('#ffffff');
  const [currentTextBg, setCurrentTextBg] = useState<string>('rgba(0,0,0,0.6)');
  const [currentFontStyle, setCurrentFontStyle] = useState<'bold' | 'classic' | 'neon' | 'typewriter' | 'handwriting' | 'impact'>('bold');
  const [currentFontSize, setCurrentFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Sticker tray drawer state
  const [showStickerTray, setShowStickerTray] = useState<boolean>(false);
  const [customLocationText, setCustomLocationText] = useState<string>('Lagos, Nigeria 🇳🇬');
  const [customMentionText, setCustomMentionText] = useState<string>('@nemdan');

  // Camera Live Hardware state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Active draggable item tracking
  const [draggedItem, setDraggedItem] = useState<{ type: 'text' | 'sticker'; id: string } | null>(null);
  const storyFrameRef = useRef<HTMLDivElement | null>(null);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    if (activeTab === 'camera' && showCreateStory) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing, showCreateStory]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
      addToast('Camera Notice', 'Could not open live camera. You can select from gallery or sample photos.', 'info');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCaptureSnapshot = () => {
    if (!cameraVideoRef.current) return;
    
    // 3-second countdown effect
    setCameraCountdown(3);
    const interval = setInterval(() => {
      setCameraCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          performCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const performCapture = () => {
    if (!cameraVideoRef.current) return;
    const video = cameraVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacing === 'user') {
        // mirror selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setMediaUrl(dataUrl);
      setActiveTab('media');
      stopCamera();
      addToast('Snapshot Captured!', 'Photo ready for your story.', 'success');
    }
  };

  const handleFlipCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      addToast('Invalid File', 'Please select a valid image or video file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrl(event.target.result as string);
        setActiveTab('media');
        addToast('Media Uploaded', file.name, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Add / Edit Text Overlay
  const handleOpenTextEditor = (existing?: StoryOverlayText) => {
    if (existing) {
      setEditingTextId(existing.id);
      setCurrentTextDraft(existing.text);
      setCurrentTextColor(existing.color);
      setCurrentTextBg(existing.bgColor || 'rgba(0,0,0,0.6)');
      setCurrentFontStyle(existing.fontStyle || 'bold');
      setCurrentFontSize(existing.fontSize || 'md');
    } else {
      setEditingTextId(null);
      setCurrentTextDraft('');
      setCurrentTextColor('#ffffff');
      setCurrentTextBg('rgba(0,0,0,0.6)');
      setCurrentFontStyle('bold');
      setCurrentFontSize('md');
    }
    setIsEditingText(true);
  };

  const handleSaveTextOverlay = () => {
    if (!currentTextDraft.trim()) {
      if (editingTextId) {
        setTextOverlays(prev => prev.filter(t => t.id !== editingTextId));
      }
      setIsEditingText(false);
      return;
    }

    if (editingTextId) {
      setTextOverlays(prev => prev.map(t => t.id === editingTextId ? {
        ...t,
        text: currentTextDraft.trim(),
        color: currentTextColor,
        bgColor: currentTextBg,
        fontStyle: currentFontStyle,
        fontSize: currentFontSize
      } : t));
    } else {
      const newOverlay: StoryOverlayText = {
        id: `txt_${Date.now()}`,
        text: currentTextDraft.trim(),
        x: 50,
        y: 45 + (textOverlays.length * 8) % 30,
        color: currentTextColor,
        bgColor: currentTextBg,
        fontStyle: currentFontStyle,
        fontSize: currentFontSize,
        align: 'center'
      };
      setTextOverlays(prev => [...prev, newOverlay]);
    }
    setIsEditingText(false);
  };

  // Add Sticker
  const handleAddSticker = (type: StorySticker['type'], content: string, extra?: any) => {
    const newSticker: StorySticker = {
      id: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      content,
      x: 50,
      y: 35 + (stickers.length * 10) % 40,
      scale: 1,
      rotation: 0,
      extraData: extra
    };
    setStickers(prev => [...prev, newSticker]);
    setShowStickerTray(false);
    addToast('Sticker Added', 'Drag to place on your story', 'info');
  };

  // Drag on Canvas
  const handlePointerDown = (type: 'text' | 'sticker', id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggedItem({ type, id });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedItem || !storyFrameRef.current) return;
    const rect = storyFrameRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggedItem.type === 'text') {
      setTextOverlays(prev => prev.map(item => item.id === draggedItem.id ? { ...item, x, y } : item));
    } else {
      setStickers(prev => prev.map(item => item.id === draggedItem.id ? { ...item, x, y } : item));
    }
  };

  const handlePointerUp = () => {
    setDraggedItem(null);
  };

  // Delete Overlay Item
  const handleDeleteText = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTextOverlays(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  // Rotate & Zoom
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  // Publish Story to Server
  const handlePublishStory = async () => {
    if (!currentUser) {
      addToast('Authentication Required', 'Please sign in to publish stories.', 'error');
      return;
    }

    setPublishing(true);
    try {
      const currentFilterObj = FILTER_PRESETS.find(f => f.id === selectedFilter);
      const isTextMode = activeTab === 'text';

      await api.createStory({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userVerified: currentUser.isVerified,
        mediaUrl: isTextMode ? '' : mediaUrl,
        mediaType: 'image',
        caption: caption.trim() || undefined,
        backgroundGradient: isTextMode ? selectedGradient : undefined,
        musicTitle: selectedMusic || undefined,
        filter: currentFilterObj ? currentFilterObj.css : 'none',
        cropAspect,
        rotation,
        zoom,
        textOverlays,
        stickers
      });

      await refreshStories();
      setShowCreateStory(false);
      addToast('Story Published! 🌟', 'Your story is live for the next 24 hours.', 'success');
    } catch (err: any) {
      addToast('Upload Failed', err.message || 'Could not publish story.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  if (!showCreateStory) return null;

  const currentFilterObj = FILTER_PRESETS.find(f => f.id === selectedFilter);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[94vh] max-h-[820px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white animate-in zoom-in-95">
        
        {/* ============================================================ */}
        {/* LEFT / CENTER: INTERACTIVE STORY 9:16 STAGE CANVAS */}
        {/* ============================================================ */}
        <div className="flex-1 bg-black flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          
          {/* Top Quick Actions Bar over Canvas */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>NEMDAN Story</span>
              </span>
              {selectedMusic && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-medium truncate max-w-[160px]">
                  <Music className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span className="truncate">{selectedMusic}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Add Text overlay button */}
              <button
                id="story-add-text-btn"
                onClick={() => handleOpenTextEditor()}
                className="p-2 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Add Text"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Add Stickers button */}
              <button
                id="story-add-sticker-btn"
                onClick={() => setShowStickerTray(true)}
                className="p-2 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Add Stickers & Emojis"
              >
                <Smile className="w-4 h-4 text-amber-400" />
              </button>

              {/* Rotate */}
              {activeTab === 'media' && (
                <button
                  onClick={handleRotate}
                  className="p-2 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer hover:scale-105"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              {/* Flip */}
              {activeTab === 'media' && (
                <button
                  onClick={handleFlip}
                  className="p-2 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer hover:scale-105"
                  title="Flip Image"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  stopCamera();
                  setShowCreateStory(false);
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-rose-600 backdrop-blur-md border border-white/10 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 9:16 PREVIEW CANVAS FRAME */}
          <div 
            ref={storyFrameRef}
            className={`relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700/60 transition-all duration-300 ${
              cropAspect === '9:16' ? 'w-[260px] sm:w-[300px] h-[460px] sm:h-[530px]' :
              cropAspect === '1:1' ? 'w-[280px] sm:w-[340px] h-[280px] sm:h-[340px]' :
              cropAspect === '4:5' ? 'w-[270px] sm:w-[320px] h-[340px] sm:h-[400px]' :
              'w-[270px] sm:w-[310px] h-[440px] sm:h-[500px]'
            }`}
          >
            {/* LIVE CAMERA MODE */}
            {activeTab === 'camera' ? (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                {/* Camera Countdown Overlay */}
                {cameraCountdown !== null && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-40">
                    <span className="text-7xl font-black text-white animate-ping">
                      {cameraCountdown}
                    </span>
                  </div>
                )}

                {/* Live Camera Bottom Trigger Bar */}
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-6 z-30">
                  <button
                    onClick={handleFlipCamera}
                    className="p-3 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-transform active:scale-90 cursor-pointer"
                    title="Flip Front/Rear Camera"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleCaptureSnapshot}
                    className="w-16 h-16 rounded-full bg-white border-4 border-blue-500 shadow-xl flex items-center justify-center group active:scale-95 transition-all cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600 group-hover:scale-90 transition-transform" />
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-transform active:scale-90 cursor-pointer"
                    title="Upload from Device Gallery"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : activeTab === 'text' ? (
              /* TEXT & GRADIENT MODE */
              <div className={`absolute inset-0 bg-gradient-to-tr ${selectedGradient} flex flex-col justify-between p-6`}>
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="text-left">
                    <p className="text-white text-xs font-bold leading-tight drop-shadow-sm">{currentUser?.name}</p>
                    <p className="text-white/70 text-[10px]">Your 24h Story</p>
                  </div>
                </div>

                <div className="text-center my-auto">
                  <p className="text-white text-lg sm:text-xl font-black leading-snug drop-shadow-lg break-words">
                    {caption || 'Tap on the text editor or caption input to write your thought...'}
                  </p>
                </div>

                <div className="text-center text-[11px] text-white/60 font-medium">
                  Disappears after 24 hours
                </div>
              </div>
            ) : (
              /* PHOTO / MEDIA MODE */
              <div className="absolute inset-0 bg-slate-950 overflow-hidden">
                <img
                  src={mediaUrl}
                  alt="Story Visual Preview"
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    filter: currentFilterObj ? currentFilterObj.css : 'none',
                    transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

                {/* Top User Info */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="text-white text-xs font-bold drop-shadow-sm leading-tight">{currentUser?.name}</p>
                    <p className="text-white/70 text-[10px]">Your Story • 24h</p>
                  </div>
                </div>

                {/* Optional Bottom Caption Pill */}
                {caption && (
                  <div className="absolute bottom-4 inset-x-4 z-20 text-center">
                    <p className="inline-block px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium drop-shadow-md">
                      {caption}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* OVERLAY LAYERS: TEXT OVERLAYS & DRAGGABLE STICKERS */}
            {/* ============================================================ */}
            {textOverlays.map((item) => (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown('text', item.id, e)}
                onClick={() => handleOpenTextEditor(item)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: item.color,
                  backgroundColor: item.bgColor || 'transparent'
                }}
                className={`absolute z-30 px-3 py-1.5 rounded-xl text-center max-w-[85%] cursor-move transition-shadow hover:ring-2 hover:ring-blue-400 group shadow-lg ${
                  item.fontStyle === 'neon' ? 'shadow-blue-500/50 font-black tracking-wider' :
                  item.fontStyle === 'classic' ? 'font-serif italic' :
                  item.fontStyle === 'typewriter' ? 'font-mono' :
                  item.fontStyle === 'impact' ? 'font-black uppercase tracking-tight' :
                  'font-bold'
                } ${
                  item.fontSize === 'xl' ? 'text-xl' :
                  item.fontSize === 'lg' ? 'text-base' :
                  item.fontSize === 'sm' ? 'text-xs' : 'text-sm'
                }`}
              >
                <span className="drop-shadow-md break-words">{item.text}</span>
                <button
                  onClick={(e) => handleDeleteText(item.id, e)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {stickers.map((stk) => (
              <div
                key={stk.id}
                onPointerDown={(e) => handlePointerDown('sticker', stk.id, e)}
                style={{
                  left: `${stk.x}%`,
                  top: `${stk.y}%`,
                  transform: `translate(-50%, -50%) scale(${stk.scale || 1})`
                }}
                className="absolute z-30 cursor-move group hover:ring-2 hover:ring-amber-400 rounded-2xl transition-shadow p-1 select-none"
              >
                {stk.type === 'emoji' ? (
                  <span className="text-4xl drop-shadow-lg">{stk.content}</span>
                ) : stk.type === 'location' ? (
                  <div className="px-3 py-1.5 rounded-full bg-rose-600/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-white/20">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{stk.content}</span>
                  </div>
                ) : stk.type === 'mention' ? (
                  <div className="px-3 py-1.5 rounded-full bg-blue-600/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-white/20">
                    <AtSign className="w-3.5 h-3.5" />
                    <span>{stk.content}</span>
                  </div>
                ) : stk.type === 'time' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white font-black text-xs flex items-center gap-1.5 shadow-lg border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{stk.content}</span>
                  </div>
                ) : stk.type === 'badge' ? (
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-lg border border-white/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{stk.content}</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white font-bold text-xs shadow-lg border border-white/20">
                    {stk.content}
                  </div>
                )}

                <button
                  onClick={(e) => handleDeleteSticker(stk.id, e)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

          </div>

          {/* Bottom helper tip */}
          <p className="text-[11px] text-slate-400 mt-3 text-center">
            💡 Tap elements to edit or drag them to reposition anywhere on your story.
          </p>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDEBAR: EDITING SUITE & PUBLISHING CONTROLS */}
        {/* ============================================================ */}
        <div className="w-full md:w-96 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white">Create NEMDAN Story</h3>
              <p className="text-xs text-slate-400">Expiring in 24 hours with viewer tracking</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
            />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('media')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
          </div>

          {/* TAB 1: MEDIA CONTROLS */}
          {activeTab === 'media' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Upload Button + Sample Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">Choose Media Source:</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Device File</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMediaUrl(sample.url)}
                      className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer group ${
                        mediaUrl === sample.url ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 py-0.5 bg-black/70 text-[9px] font-bold text-center text-white truncate px-1">
                        {sample.label}
                      </span>
                      {mediaUrl === sample.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Visual Color Filter:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        selectedFilter === f.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop Aspect Ratio & Zoom */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Aspect Ratio:</label>
                  <select
                    value={cropAspect}
                    onChange={(e: any) => setCropAspect(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-hidden cursor-pointer"
                  >
                    <option value="9:16">9:16 Story</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="4:5">4:5 Portrait</option>
                    <option value="original">Original</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Zoom:</label>
                    <span className="text-[11px] text-slate-400 font-mono">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CAMERA HELP */}
          {activeTab === 'camera' && (
            <div className="space-y-3 p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Live Hardware Camera</span>
              </div>
              <p>
                Capture real selfies or landscape shots using your device webcam. Flip front/back camera with the flip button.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCaptureSnapshot}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>3s Snapshot</span>
                </button>
                <button
                  onClick={handleFlipCamera}
                  className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Flip Camera</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TEXT & GRADIENTS */}
          {activeTab === 'text' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Background Palette:</label>
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGradient(g.class)}
                      className={`h-12 rounded-xl bg-gradient-to-tr ${g.class} transition-all cursor-pointer relative ${
                        selectedGradient === g.class ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {selectedGradient === g.class && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Background Audio Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Music className="w-3.5 h-3.5 text-rose-400" />
              <span>Background Track (Audio):</span>
            </label>
            <select
              value={selectedMusic}
              onChange={(e) => setSelectedMusic(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-hidden cursor-pointer"
            >
              {MUSIC_TRACKS.map((m) => (
                <option key={m.id} value={m.title}>
                  🎵 {m.title} ({m.artist})
                </option>
              ))}
            </select>
          </div>

          {/* Caption Input */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Story Message / Caption:</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add your thoughts, mood or tags..."
              maxLength={120}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Footer: Share to NEMDAN Story Button */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              id="publish-story-submit-btn"
              onClick={handlePublishStory}
              disabled={publishing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sharing to NEMDAN Story...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Share to Your Story (24h)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Visible to all friends and followers at the top of their feed.
            </p>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* MODAL 1: TEXT OVERLAY CUSTOMIZER MODAL */}
      {/* ============================================================ */}
      {isEditingText && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" />
                <span>Text Overlay Styling</span>
              </h4>
              <button onClick={() => setIsEditingText(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Text Preview Box */}
            <div 
              style={{ 
                color: currentTextColor, 
                backgroundColor: currentTextBg 
              }}
              className={`p-4 rounded-2xl text-center min-h-[80px] flex items-center justify-center font-bold text-base shadow-inner ${
                currentFontStyle === 'neon' ? 'font-black tracking-wider text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' :
                currentFontStyle === 'classic' ? 'font-serif italic' :
                currentFontStyle === 'typewriter' ? 'font-mono' :
                currentFontStyle === 'impact' ? 'font-black uppercase tracking-tight' : 'font-bold'
              }`}
            >
              {currentTextDraft || 'Your story text here...'}
            </div>

            {/* Text Input */}
            <input
              type="text"
              autoFocus
              value={currentTextDraft}
              onChange={(e) => setCurrentTextDraft(e.target.value)}
              placeholder="Type your overlay message..."
              maxLength={80}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-hidden focus:ring-2 focus:ring-blue-500"
            />

            {/* Font Style Switcher */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Font Style:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'bold', label: 'Modern' },
                  { id: 'classic', label: 'Serif' },
                  { id: 'neon', label: 'Neon' },
                  { id: 'typewriter', label: 'Typewriter' },
                  { id: 'impact', label: 'Impact' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentFontStyle(s.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      currentFontStyle === s.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Colors */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Text Color:</label>
              <div className="flex items-center gap-2">
                {['#ffffff', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#000000'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrentTextColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      currentTextColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Highlight Background Color */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Highlight Background:</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'rgba(0,0,0,0.6)', label: 'Dark' },
                  { id: 'rgba(255,255,255,0.85)', label: 'White' },
                  { id: 'rgba(37,99,235,0.8)', label: 'Blue' },
                  { id: 'rgba(225,29,72,0.8)', label: 'Rose' },
                  { id: 'transparent', label: 'None' }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setCurrentTextBg(bg.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      currentTextBg === bg.id
                        ? 'bg-white text-slate-900 border-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsEditingText(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTextOverlay}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Save Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: STICKERS & INTERACTIVE WIDGETS TRAY */}
      {/* ============================================================ */}
      {showStickerTray && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-400" />
                <span>Stickers & Widgets</span>
              </h4>
              <button onClick={() => setShowStickerTray(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Tags */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 block">Interactive Badges:</label>
              
              {/* Location Sticker */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customLocationText}
                  onChange={(e) => setCustomLocationText(e.target.value)}
                  placeholder="Location name..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                />
                <button
                  onClick={() => handleAddSticker('location', customLocationText)}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Mention Sticker */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customMentionText}
                  onChange={(e) => setCustomMentionText(e.target.value)}
                  placeholder="@username..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                />
                <button
                  onClick={() => handleAddSticker('mention', customMentionText)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <AtSign className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Time Stamp Sticker */}
              <button
                onClick={() => handleAddSticker('time', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-white flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Current Time Badge</span>
                </span>
                <span className="text-slate-400 font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>

              {/* Verified Badge Sticker */}
              <button
                onClick={() => handleAddSticker('badge', 'NEMDAN 2026 Verified 🌟')}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>NEMDAN Verified Badge</span>
                </span>
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Popular Emojis */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-2">Emoji Stamps:</label>
              <div className="grid grid-cols-4 gap-2">
                {EMOJI_STICKERS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddSticker('emoji', emoji)}
                    className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-2xl hover:scale-115 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
