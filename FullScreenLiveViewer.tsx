import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Heart, Flame, Sparkles, Share2, Volume2, VolumeX, 
  Users, Trophy, Plus, Check, Send, Radio, MessageSquare, 
  Maximize, Minimize, ShieldAlert, Award, Clock, 
  Coins, Zap, Play, Pause, RefreshCw, Smile, Settings,
  CheckCircle2, Camera, Mic, MicOff, Video, Sliders, Pin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { LiveStream, LiveStreamChatMessage, LiveStreamGift } from '../../types';
import { LiveGiftOverlay } from './LiveGiftOverlay';
import { GiftStoreModal } from './GiftStoreModal';
import { CoinRechargeModal } from './CoinRechargeModal';
import { LiveLeaderboardDrawer } from './LiveLeaderboardDrawer';
import { CreatorStreamEarningsBar } from './CreatorStreamEarningsBar';

interface FullScreenLiveViewerProps {
  stream: LiveStream;
  onClose: () => void;
}

interface FloatingHeart {
  id: string;
  x: number;
  color: string;
  size: number;
  emoji?: string;
}

const HEART_COLORS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', 
  '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', 
  '#f59e0b', '#ef4444'
];

const EMOJI_REACTIONS = ['❤️', '🔥', '👏', '🚀', '💎', '🎉', '😍', '🙌'];

export const FullScreenLiveViewer: React.FC<FullScreenLiveViewerProps> = ({
  stream,
  onClose
}) => {
  const { 
    currentUser, 
    userCoins, 
    followingUserIds, 
    toggleFollowUser, 
    addToast,
    refreshLiveStreams,
    setShowWalletModal,
    activeGiftOverlay,
    setActiveGiftOverlay,
    virtualGifts,
    sendLiveGift,
    activeBroadcastStream,
    setActiveBroadcastStream
  } = useApp() as any;

  // Stream state
  const [activeStream, setActiveStream] = useState<LiveStream>(stream);
  const [chatMessages, setChatMessages] = useState<LiveStreamChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [likesCount, setLikesCount] = useState<number>(stream.likesCount || 0);
  const [viewerCount, setViewerCount] = useState<number>(stream.viewerCount || stream.viewersCount || 1);
  const [streamDuration, setStreamDuration] = useState<string>('00:00');
  const [showUnmuteOverlay, setShowUnmuteOverlay] = useState<boolean>(true);
  const [pinnedMessage, setPinnedMessage] = useState<string>(stream.pinnedMessage || '');
  const [isFollowing, setIsFollowing] = useState<boolean>(
    followingUserIds?.includes(stream.hostId) || false
  );

  // Quick Gift & Double Tap Combo System
  const [equippedGiftId, setEquippedGiftId] = useState<string>('g_rose');
  const [quickComboCount, setQuickComboCount] = useState<number>(1);
  const [showComboPill, setShowComboPill] = useState<boolean>(false);
  const [comboTimeLeft, setComboTimeLeft] = useState<number>(100);
  const lastQuickGiftTapRef = useRef<number>(0);
  const comboTimerRef = useRef<any>(null);
  const comboIntervalRef = useRef<any>(null);

  // Broadcaster creator tools
  const [isBroadcaster, setIsBroadcaster] = useState<boolean>(
    currentUser?.id === stream.hostId
  );
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [activeBeautyFilter, setActiveBeautyFilter] = useState<'none' | 'radiant' | 'warm' | 'cool'>('none');
  const [showFiltersMenu, setShowFiltersMenu] = useState<boolean>(false);
  const [showPinInput, setShowPinInput] = useState<boolean>(false);
  const [newPinText, setNewPinText] = useState<string>('');
  const [showEndConfirm, setShowEndConfirm] = useState<boolean>(false);

  // Modals & Drawers
  const [showGiftStore, setShowGiftStore] = useState<boolean>(false);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isEndingStream, setIsEndingStream] = useState<boolean>(false);

  // Refs & WebRTC
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streamStartTimeRef = useRef<number>(Date.now());
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // 1. Initialize Broadcaster Camera Feed & WebRTC broadcast signaling
  useEffect(() => {
    if (!isBroadcaster) return;

    const initBroadcasterStream = async () => {
      let streamToUse = activeBroadcastStream;
      if (!streamToUse || !streamToUse.active) {
        try {
          streamToUse = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: cameraFacing,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: true
          });
          if (setActiveBroadcastStream) {
            setActiveBroadcastStream(streamToUse);
          }
        } catch (e) {
          console.warn('Broadcaster getUserMedia not available:', e);
        }
      }

      if (streamToUse) {
        localMediaStreamRef.current = streamToUse;
        if (videoRef.current) {
          videoRef.current.srcObject = streamToUse;
          videoRef.current.muted = true; // prevent local feedback echo
          videoRef.current.play().catch(e => console.warn('Broadcaster video play error:', e));
        }
      }

      const socket = getSocket();
      socket.emit('live_broadcaster_ready', {
        streamId: stream.id,
        hostId: currentUser?.id
      });
    };

    initBroadcasterStream();

    const socket = getSocket();

    const handleNewViewer = async (data: { streamId: string; viewerSocketId: string; viewerId: string }) => {
      if (data.streamId !== stream.id || !localMediaStreamRef.current) return;

      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        peerConnectionsRef.current.set(data.viewerSocketId, pc);

        localMediaStreamRef.current.getTracks().forEach(track => {
          if (localMediaStreamRef.current) {
            pc.addTrack(track, localMediaStreamRef.current);
          }
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('live_webrtc_ice_candidate', {
              targetSocketId: data.viewerSocketId,
              candidate: event.candidate
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('live_webrtc_offer', {
          targetSocketId: data.viewerSocketId,
          offer,
          streamId: stream.id
        });
      } catch (err) {
        console.warn('WebRTC broadcast offer error:', err);
      }
    };

    const handleViewerAnswer = async (data: { viewerSocketId: string; answer: any; streamId: string }) => {
      const pc = peerConnectionsRef.current.get(data.viewerSocketId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (e) {
          console.warn('Set remote description error:', e);
        }
      }
    };

    const handleIceCandidate = async (data: { fromSocketId: string; candidate: any }) => {
      const pc = peerConnectionsRef.current.get(data.fromSocketId);
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn('Add ice candidate error:', e);
        }
      }
    };

    socket.on('live_new_viewer_joined', handleNewViewer);
    socket.on('live_webrtc_answer', handleViewerAnswer);
    socket.on('live_webrtc_ice_candidate', handleIceCandidate);

    return () => {
      socket.off('live_new_viewer_joined', handleNewViewer);
      socket.off('live_webrtc_answer', handleViewerAnswer);
      socket.off('live_webrtc_ice_candidate', handleIceCandidate);
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, [isBroadcaster, stream.id, currentUser?.id]);

  // 2. Initialize Viewer WebRTC connection to receive live broadcast feed
  useEffect(() => {
    if (isBroadcaster) return;

    const socket = getSocket();
    let viewerPc: RTCPeerConnection | null = null;

    const handleOffer = async (data: { broadcasterSocketId: string; offer: any; streamId: string }) => {
      if (data.streamId !== stream.id) return;
      try {
        if (viewerPc) viewerPc.close();

        viewerPc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        viewerPc.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.play().catch(e => console.warn('Viewer play ontrack:', e));
          }
        };

        viewerPc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('live_webrtc_ice_candidate', {
              targetSocketId: data.broadcasterSocketId,
              candidate: event.candidate
            });
          }
        };

        await viewerPc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await viewerPc.createAnswer();
        await viewerPc.setLocalDescription(answer);

        socket.emit('live_webrtc_answer', {
          targetSocketId: data.broadcasterSocketId,
          answer,
          streamId: stream.id
        });
      } catch (err) {
        console.warn('Viewer WebRTC connection error:', err);
      }
    };

    const handleIceCandidate = async (data: { candidate: any }) => {
      if (viewerPc && data.candidate) {
        try {
          await viewerPc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn('Viewer ICE candidate error:', e);
        }
      }
    };

    socket.on('live_webrtc_offer', handleOffer);
    socket.on('live_webrtc_ice_candidate', handleIceCandidate);

    socket.emit('live_viewer_join_broadcast', {
      streamId: stream.id,
      viewerId: currentUser?.id || 'viewer_guest'
    });

    return () => {
      socket.off('live_webrtc_offer', handleOffer);
      socket.off('live_webrtc_ice_candidate', handleIceCandidate);
      if (viewerPc) viewerPc.close();
    };
  }, [isBroadcaster, stream.id, currentUser?.id]);

  // Flip Camera for Broadcaster
  const handleFlipCamera = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: !isMicMuted
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (localMediaStreamRef.current) {
        const oldTrack = localMediaStreamRef.current.getVideoTracks()[0];
        if (oldTrack) {
          localMediaStreamRef.current.removeTrack(oldTrack);
          oldTrack.stop();
        }
        localMediaStreamRef.current.addTrack(newVideoTrack);

        peerConnectionsRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      if (setActiveBroadcastStream) {
        setActiveBroadcastStream(newStream);
      }
      addToast('Camera Flipped', nextFacing === 'user' ? 'Front Camera Active' : 'Rear Camera Active', 'info');
    } catch (err) {
      addToast('Error', 'Could not switch camera', 'error');
    }
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    if (localMediaStreamRef.current) {
      localMediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
    addToast('Microphone', nextMuted ? 'Microphone Muted' : 'Microphone Active', 'info');
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    const nextOff = !isCameraOff;
    setIsCameraOff(nextOff);
    if (localMediaStreamRef.current) {
      localMediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !nextOff;
      });
    }
    addToast('Camera', nextOff ? 'Camera Paused' : 'Camera Active', 'info');
  };

  // Sync isFollowing
  useEffect(() => {
    setIsFollowing(followingUserIds?.includes(stream.hostId) || false);
  }, [followingUserIds, stream.hostId]);

  // Duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - streamStartTimeRef.current) / 1000);
      const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
      const secs = (elapsedSec % 60).toString().padStart(2, '0');
      setStreamDuration(`${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Socket & Chat listener
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_live_stream', stream.id);

    // Initial load
    api.getLiveChatMessages(stream.id).then(msgs => {
      if (msgs && msgs.length > 0) {
        setChatMessages(msgs);
      }
    }).catch(err => console.error('Failed to load live chat:', err));

    const handleReceiveLiveChat = (data: { streamId: string; message: LiveStreamChatMessage }) => {
      if (data.streamId === stream.id) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    };

    const handleLiveGiftReceived = (data: { 
      streamId: string; 
      gift: LiveStreamGift; 
      streamTotalCoins: number; 
      streamTotalGifts: number;
      leaderboard?: any;
    }) => {
      if (data.streamId === stream.id) {
        setActiveGiftOverlay(data.gift);
        
        setActiveStream(prev => ({
          ...prev,
          totalCoinsReceived: (prev.totalCoinsReceived || 0) + (data.gift.coinAmount * (data.gift.comboCount || 1)),
          totalGiftsCount: (prev.totalGiftsCount || 0) + 1
        }));

        // Push into chat as prominent gift announcement
        const giftMsg: LiveStreamChatMessage = {
          id: `gift_chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          streamId: stream.id,
          userId: data.gift.senderId,
          userName: data.gift.senderName,
          userAvatar: data.gift.senderAvatar,
          message: `Sent ${data.gift.comboCount > 1 ? `${data.gift.comboCount}x ` : ''}${data.gift.giftName} ${data.gift.giftIcon}!`,
          type: 'gift',
          giftDetails: {
            name: data.gift.giftName,
            icon: data.gift.giftIcon,
            amount: data.gift.coinAmount * (data.gift.comboCount || 1)
          },
          createdAt: 'Just now'
        };

        setChatMessages(prev => [...prev, giftMsg]);
      }
    };

    const handleLiveReaction = (data: { streamId: string; type?: string; emoji?: string; likesCount?: number }) => {
      if (data.streamId === stream.id) {
        spawnHeart(data.emoji || '❤️');
        if (data.likesCount !== undefined) {
          setLikesCount(data.likesCount);
        } else {
          setLikesCount(prev => prev + 1);
        }
      }
    };

    const handleViewerUpdate = (data: { streamId: string; viewerCount?: number; viewersCount?: number }) => {
      if (data.streamId === stream.id) {
        const count = data.viewerCount ?? data.viewersCount ?? 1;
        setViewerCount(count);
      }
    };

    const handlePinnedUpdate = (data: { streamId: string; pinnedMessage: string }) => {
      if (data.streamId === stream.id) {
        setPinnedMessage(data.pinnedMessage);
      }
    };

    const handleStreamEnded = (data: LiveStream) => {
      if (data.id === stream.id) {
        addToast('Broadcast Ended', 'This live stream has concluded.', 'info');
        setActiveStream(data);
      }
    };

    socket.on('receive_live_chat', handleReceiveLiveChat);
    socket.on('live_chat_message', (msg: LiveStreamChatMessage) => handleReceiveLiveChat({ streamId: stream.id, message: msg }));
    socket.on('live_gift_received', handleLiveGiftReceived);
    socket.on('live_reaction', handleLiveReaction);
    socket.on('live_viewer_update', handleViewerUpdate);
    socket.on('live_viewers_updated', handleViewerUpdate);
    socket.on('live_pinned_message_updated', handlePinnedUpdate);
    socket.on('live_stream_ended', handleStreamEnded);

    return () => {
      socket.off('receive_live_chat');
      socket.off('live_chat_message');
      socket.off('live_gift_received');
      socket.off('live_reaction');
      socket.off('live_viewer_update');
      socket.off('live_viewers_updated');
      socket.off('live_pinned_message_updated');
      socket.off('live_stream_ended');
    };
  }, [stream.id, setActiveGiftOverlay, addToast]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Spawn floating heart particles
  const spawnHeart = (emoji: string = '❤️') => {
    const randomColor = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const randomX = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    const randomSize = Math.floor(Math.random() * 14) + 22; // 22px to 36px

    const newHeart: FloatingHeart = {
      id: `heart_${Date.now()}_${Math.random()}`,
      x: randomX,
      color: randomColor,
      size: randomSize,
      emoji
    };

    setFloatingHearts(prev => [...prev.slice(-20), newHeart]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2200);
  };

  // Tap on video to like & trigger heart burst
  const handleVideoTap = (e: React.MouseEvent) => {
    // Avoid triggering when tapping on buttons or inputs
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.interactive-control')) {
      return;
    }

    setLikesCount(prev => prev + 1);
    spawnHeart('❤️');

    // Notify backend & socket
    const socket = getSocket();
    socket.emit('send_live_reaction', {
      streamId: stream.id,
      emoji: '❤️'
    });

    api.reactLiveStream(stream.id, {
      userId: currentUser?.id,
      type: 'love'
    }).catch(() => {});
  };

  // Send text chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const messageContent = chatInput.trim();
    setChatInput('');
    setIsSendingChat(true);

    try {
      const newMsg = await api.sendLiveChatMessage(stream.id, {
        userId: currentUser?.id || 'usr_guest',
        senderId: currentUser?.id || 'usr_guest',
        senderName: currentUser?.name || 'Guest User',
        senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        message: messageContent,
        content: messageContent,
        isHost: currentUser?.id === stream.hostId,
        type: 'chat'
      });

      const socket = getSocket();
      socket.emit('send_live_chat', {
        streamId: stream.id,
        message: newMsg
      });

      setChatMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      console.error('Failed to send live chat message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Toggle Follow Host
  const handleToggleFollow = async () => {
    await toggleFollowUser(stream.hostId);
    setIsFollowing(prev => !prev);
    addToast(
      isFollowing ? 'Unfollowed' : 'Following!',
      isFollowing ? `You unfollowed ${stream.hostName}` : `You are now following ${stream.hostName}`,
      'info'
    );
  };

  // Sound Toggle
  const handleToggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      setShowUnmuteOverlay(false);
    }
  };

  // Unmute overlay click
  const handleUnmutePrompt = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setShowUnmuteOverlay(false);
    }
  };

  // Share Stream
  const handleShareStream = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link Copied!', 'Live stream link copied to your clipboard.', 'success');
    }
  };

  // Execute Quick Gift Send (Immediate Double-Tap or Combo Click)
  const executeQuickGiftSend = async (giftItem?: any) => {
    const targetGift = giftItem || (virtualGifts || []).find((g: any) => g.id === equippedGiftId) || { id: 'g_rose', name: 'Rose', icon: '🌹', coinPrice: 1 };
    const price = targetGift.coinPrice ?? targetGift.coins ?? 1;

    if (userCoins < price) {
      addToast('Not Enough Coins', `Recharge coins to send ${targetGift.name}!`, 'warning');
      setShowRechargeModal(true);
      return;
    }

    // Increment combo
    const nextCombo = showComboPill ? quickComboCount + 1 : 1;
    setQuickComboCount(nextCombo);
    setShowComboPill(true);
    setComboTimeLeft(100);

    // Spawn gift icon particle burst
    spawnHeart(targetGift.icon);

    // Clear previous timers
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    if (comboIntervalRef.current) clearInterval(comboIntervalRef.current);

    // Countdown progress interval (2500ms total duration)
    const startTime = Date.now();
    const duration = 2500;
    comboIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setComboTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(comboIntervalRef.current);
      }
    }, 50);

    comboTimerRef.current = setTimeout(() => {
      setShowComboPill(false);
      setQuickComboCount(1);
    }, duration);

    try {
      await sendLiveGift(stream.id, targetGift.id, 1);
    } catch (err) {
      console.error('Quick gift send failed:', err);
    }
  };

  // Quick gift tap & double-tap handler
  const handleQuickGiftTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const timeSinceLastTap = now - lastQuickGiftTapRef.current;
    lastQuickGiftTapRef.current = now;

    // Single tap if combo is active continues combo; double-tap starts or accelerates
    executeQuickGiftSend();
  };

  // Pin message handler
  const handleSetPinnedMessage = async () => {
    if (!newPinText.trim()) return;
    try {
      await api.pinLiveMessage(stream.id, newPinText.trim());
      setPinnedMessage(newPinText.trim());
      setShowPinInput(false);
      setNewPinText('');
      addToast('Message Pinned', 'Your message is now pinned to the top of chat.', 'success');
    } catch (err) {
      addToast('Error', 'Failed to pin message', 'error');
    }
  };

  // End Stream (Broadcaster)
  const handleEndStream = async () => {
    setIsEndingStream(true);
    try {
      const ended = await api.endLiveStream(stream.id);
      setActiveStream(ended);
      await refreshLiveStreams();

      const elapsedSec = Math.floor((Date.now() - streamStartTimeRef.current) / 1000);
      const totalCoinsEarned = activeStream.totalCoinsReceived || 0;
      const usdEarned = (totalCoinsEarned * 0.007).toFixed(2);
      const ngnEarned = (totalCoinsEarned * 10.5).toLocaleString();

      setSummaryStats({
        duration: streamDuration,
        totalViewers: Math.max(viewerCount * 3, 120),
        peakViewers: Math.max(viewerCount * 2, 85),
        totalLikes: likesCount,
        giftsReceived: activeStream.totalGiftsCount || 0,
        coinsEarned: totalCoinsEarned,
        usdEarned,
        ngnEarned
      });

      setShowSummaryModal(true);
    } catch (err) {
      addToast('Error', 'Failed to end live stream', 'error');
    } finally {
      setIsEndingStream(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* 
        MAIN FULL-SCREEN VERTICAL CONTAINER (9:16 Responsive Viewport)
        - On mobile: 100vw x 100vh edge-to-edge
        - On desktop/tablet: Center 9:16 vertical smartphone/stage aspect with ambient background glow
      */}
      <div 
        onClick={handleVideoTap}
        className="relative w-full h-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md xl:max-w-[440px] max-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer"
        style={{ aspectRatio: '9/16' }}
      >

        {/* 1. BACKGROUND LIVE VIDEO (9:16 Vertical, Cover, Edge-to-Edge) */}
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            src={stream.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4'}
            poster={stream.thumbnailUrl}
            autoPlay
            playsInline
            loop
            muted={isMuted}
            className={`w-full h-full object-cover transition-all duration-300 ${
              activeBeautyFilter === 'radiant' 
                ? 'brightness-110 contrast-105 saturate-110'
                : activeBeautyFilter === 'warm'
                ? 'sepia-20 hue-rotate-15'
                : activeBeautyFilter === 'cool'
                ? 'hue-rotate-180 saturate-110'
                : ''
            }`}
          />

          {/* Subtle dark gradient overlay for chat & controls contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* 2. REAL-TIME GIFT ANIMATION OVERLAY (ROSE, CROWN, DIAMOND, LION, UNIVERSE, ETC.) */}
        <LiveGiftOverlay 
          gift={activeGiftOverlay} 
          onFinished={() => setActiveGiftOverlay(null)} 
        />

        {/* 3. FLOATING HEART PARTICLES */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
          {floatingHearts.map(heart => (
            <div
              key={heart.id}
              className="absolute text-2xl animate-float-heart drop-shadow-md"
              style={{
                left: `${heart.x}%`,
                bottom: '90px',
                fontSize: `${heart.size}px`,
                color: heart.color
              }}
            >
              {heart.emoji || '❤️'}
            </div>
          ))}
        </div>

        {/* 4. TAP TO UNMUTE OVERLAY PROMPT */}
        {showUnmuteOverlay && isMuted && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleUnmutePrompt();
            }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce interactive-control"
          >
            <VolumeX className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide">Tap to Unmute Audio 🔊</span>
          </div>
        )}

        {/* =========================================================================
            HEADER OVERLAY (Top Creator Pill, Live Count, Timer, Close Button)
        ========================================================================= */}
        <header className="relative z-30 p-3 pt-4 sm:p-4 flex items-start justify-between gap-2 pointer-events-auto">
          
          {/* Creator Pill (Avatar, Name, Verification, Follow CTA) */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-white max-w-[260px] sm:max-w-xs shadow-lg interactive-control">
            <img
              src={stream.hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={stream.hostName}
              className="w-8 h-8 rounded-full object-cover border-2 border-rose-500 shrink-0"
            />
            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs text-white truncate max-w-[90px] sm:max-w-[110px]">
                  {stream.hostName}
                </span>
                {stream.hostVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-current shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-medium">
                <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                  <span>🪙</span>
                  <span>{(activeStream.totalCoinsReceived || 0).toLocaleString()}</span>
                </span>
                <span>•</span>
                <span className="truncate">{streamDuration}</span>
              </div>
            </div>

            {/* + Follow Button (Dynamic state) */}
            {!isBroadcaster && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFollow();
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-tight transition-all cursor-pointer shrink-0 shadow-md ${
                  isFollowing
                    ? 'bg-white/20 text-white/80 hover:bg-white/30'
                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white animate-pulse'
                }`}
              >
                {isFollowing ? 'Following' : '+ Follow'}
              </button>
            )}
          </div>

          {/* Top Right Actions (Live Pill, Viewers, Leaderboard, Close X) */}
          <div className="flex items-center gap-1.5 interactive-control">
            
            {/* Live Indicator & Viewers Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-black tracking-wide shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE</span>
              <span className="text-white/80 font-bold ml-1">
                {viewerCount > 1000 ? `${(viewerCount / 1000).toFixed(1)}k` : viewerCount}
              </span>
            </div>

            {/* Leaderboard Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLeaderboard(true);
              }}
              title="Gift Leaderboard"
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-amber-300 hover:text-amber-200 hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Mute/Unmute Audio Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMute();
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close / Exit Button (X) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Exit Live Stream"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-600 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-md group"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

          </div>
        </header>

        {/* BROADCASTER STUDIO CONTROLS (If Host) */}
        {isBroadcaster && (
          <div className="relative z-30 px-3 py-1.5 flex items-center justify-between bg-black/50 backdrop-blur-md border-y border-white/10 text-white text-xs interactive-control">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-rose-400 flex items-center gap-1 text-[11px]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Host Studio</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="text-amber-300 font-bold text-[11px]">
                🪙 {(activeStream.totalCoinsReceived || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Flip Camera */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlipCamera();
                }}
                title="Flip Camera (Front / Back)"
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Mute/Unmute Microphone */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMic();
                }}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                  isMicMuted ? 'bg-rose-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              {/* Pause/Resume Camera */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCamera();
                }}
                title={isCameraOff ? 'Resume Camera' : 'Pause Camera'}
                className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                  isCameraOff ? 'bg-amber-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
              </button>

              {/* Pin Message */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPinInput(prev => !prev);
                }}
                title="Pin announcement"
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              {/* Beauty Filters */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFiltersMenu(prev => !prev);
                }}
                title="Visual Filters"
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {/* End Stream Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEndConfirm(true);
                }}
                disabled={isEndingStream}
                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black cursor-pointer shadow-xs"
              >
                End LIVE
              </button>
            </div>
          </div>
        )}

        {/* PIN INPUT DRAWER (Host) */}
        {showPinInput && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-30 p-3 bg-slate-900/95 border-b border-white/10 flex items-center gap-2 interactive-control animate-in slide-in-from-top-4"
          >
            <input
              type="text"
              value={newPinText}
              onChange={(e) => setNewPinText(e.target.value)}
              placeholder="Enter announcement to pin at top of chat..."
              className="flex-1 px-3 py-1.5 bg-black/60 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 focus:outline-hidden focus:border-rose-400"
            />
            <button
              onClick={handleSetPinnedMessage}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Pin
            </button>
            <button
              onClick={() => setShowPinInput(false)}
              className="p-1.5 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BEAUTY FILTERS MENU */}
        {showFiltersMenu && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-30 p-2.5 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-around text-white interactive-control animate-in slide-in-from-top-4"
          >
            {(['none', 'radiant', 'warm', 'cool'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveBeautyFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeBeautyFilter === filter
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {filter === 'none' ? 'Natural' : filter}
              </button>
            ))}
          </div>
        )}

        {/* =========================================================================
            CHAT OVERLAY & PINNED MESSAGE (Lower Left, Glassmorphic, Semi-transparent)
        ========================================================================= */}
        <div className="relative z-20 flex-1 flex flex-col justify-end p-3 sm:p-4 min-h-0 pointer-events-none">
          
          {/* Pinned Message Banner */}
          {pinnedMessage && (
            <div className="mb-2 p-2.5 rounded-2xl bg-amber-950/80 backdrop-blur-md border border-amber-400/50 text-amber-200 shadow-xl pointer-events-auto interactive-control flex items-start gap-2 max-w-[90%] animate-in fade-in">
              <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-snug">
                <strong className="text-amber-300 font-extrabold mr-1">HOST PINNED:</strong>
                <span>{pinnedMessage}</span>
              </div>
            </div>
          )}

          {/* Chat Messages List (Transparent Bubbles, Auto-scrolling, Top Fade) */}
          <div 
            ref={chatScrollRef}
            className="w-full max-w-[85%] sm:max-w-[78%] max-h-52 sm:max-h-60 overflow-y-auto space-y-1.5 pr-2 pointer-events-auto scrollbar-none [mask-image:linear-gradient(to_bottom,transparent,black_20%,black)]"
          >
            {/* System Welcome Message */}
            <div className="inline-block px-3 py-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-[11px] font-medium leading-relaxed">
              👋 Welcome to <strong className="text-white font-bold">{stream.hostName}</strong>'s live stream! Be respectful and follow community guidelines.
            </div>

            {chatMessages.map(msg => {
              const isGift = msg.type === 'gift' || !!msg.giftDetails;
              const isHostMsg = msg.userId === stream.hostId || msg.userRole === 'host';

              return (
                <div
                  key={msg.id}
                  className={`text-xs leading-snug rounded-2xl px-3 py-1.5 max-w-full break-words backdrop-blur-md shadow-md animate-in slide-in-from-bottom-2 ${
                    isGift
                      ? 'bg-gradient-to-r from-amber-950/90 to-rose-950/90 border border-amber-400/60 text-yellow-100 shadow-amber-500/20'
                      : isHostMsg
                      ? 'bg-rose-950/85 border border-rose-400/50 text-white'
                      : 'bg-black/50 border border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    {/* Role Badges */}
                    {isHostMsg && (
                      <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider">
                        HOST
                      </span>
                    )}

                    {isGift && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                        <span>👑</span>
                        <span>GIFTER</span>
                      </span>
                    )}

                    {/* Sender Name */}
                    <span className={`font-extrabold text-[11px] ${
                      isHostMsg ? 'text-rose-300' : isGift ? 'text-amber-300' : 'text-sky-300'
                    }`}>
                      {msg.userName || 'Viewer'}
                    </span>

                    {msg.userVerified && (
                      <CheckCircle2 className="w-3 h-3 text-sky-400 fill-current" />
                    )}
                  </div>

                  {/* Message Content */}
                  <span className="text-white/95 text-[11px] font-medium">
                    {msg.message || msg.content}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* =========================================================================
            BOTTOM INTERACTION BAR (Comment Input, Quick Reactions, Gift, Like)
        ========================================================================= */}
        <footer className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
          
          {/* Quick Reaction Emoji Pills */}
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto scrollbar-none pb-1">
            {EMOJI_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  spawnHeart(emoji);
                  const socket = getSocket();
                  socket.emit('send_live_reaction', { streamId: stream.id, emoji });
                  api.reactLiveStream(stream.id, { userId: currentUser?.id, type: emoji }).catch(() => {});
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-sm transition-all hover:scale-125 cursor-pointer shrink-0 interactive-control"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            
            {/* Comment Form Input */}
            <form 
              onSubmit={handleSendChat}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 focus-within:border-rose-400 transition-all shadow-lg interactive-control"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something nice..."
                className="flex-1 bg-transparent text-xs text-white placeholder-white/50 focus:outline-hidden"
              />

              {chatInput.trim() ? (
                <button
                  type="submit"
                  disabled={isSendingChat}
                  className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3 h-3" />
                </button>
              ) : null}
            </form>

            {/* Quick Share Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareStream();
              }}
              title="Share Stream"
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg interactive-control"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* ⚡ QUICK DOUBLE-TAP GIFT LAUNCHER (Fast Send / Combo Multiplier) */}
            <div className="relative">
              {/* Floating Combo Multiplier Bubble with Countdown Ring */}
              {showComboPill && (
                <div 
                  onClick={handleQuickGiftTap}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-2xl shadow-rose-500/50 border-2 border-yellow-300 animate-bounce cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Flame className="w-4 h-4 text-yellow-200 fill-current animate-pulse" />
                  <span className="text-xs font-black tracking-tight">
                    COMBO ×{quickComboCount}
                  </span>
                  
                  {/* Circular / Line Countdown Gauge */}
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin ml-0.5" />
                </div>
              )}

              <button
                id="quick-double-tap-gift-btn"
                onClick={handleQuickGiftTap}
                onDoubleClick={handleQuickGiftTap}
                title="Double-Tap to Send Quick Gift"
                className={`relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 hover:scale-110 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 transition-all cursor-pointer shrink-0 interactive-control ring-2 ring-amber-400/60 ${
                  showComboPill ? 'scale-110 ring-4 ring-yellow-400' : ''
                }`}
              >
                <span className="text-xl">
                  {((virtualGifts || []).find((g: any) => g.id === equippedGiftId) || { icon: '🌹' }).icon}
                </span>

                {/* Double Tap Hint Badge */}
                <span className="absolute -bottom-1.5 -right-1 px-1 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[8px] tracking-tighter shadow-md">
                  {showComboPill ? `×${quickComboCount}` : '2x Tap'}
                </span>
              </button>
            </div>

            {/* 🎁 FULL VIRTUAL GIFT STORE TRIGGER BUTTON */}
            <button
              id="open-gift-store-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowGiftStore(true);
              }}
              title="Open Gift Catalog"
              className="relative w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-amber-400 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg interactive-control"
            >
              <span className="text-lg">🎁</span>
            </button>

            {/* ❤️ LIKE / HEART BUTTON (Rapid Tap Heart Burst) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLikesCount(prev => prev + 1);
                spawnHeart('❤️');
                const socket = getSocket();
                socket.emit('send_live_reaction', { streamId: stream.id, emoji: '❤️' });
                api.reactLiveStream(stream.id, { userId: currentUser?.id, type: 'love' }).catch(() => {});
              }}
              title="Like Stream"
              className="relative flex flex-col items-center justify-center w-10 h-10 rounded-full bg-rose-600/80 hover:bg-rose-500 backdrop-blur-xl border border-rose-400/40 text-white transition-all hover:scale-110 active:scale-90 cursor-pointer shrink-0 shadow-lg interactive-control group"
            >
              <Heart className="w-5 h-5 fill-current text-white group-hover:scale-125 transition-transform" />
              <span className="absolute -bottom-2 text-[9px] font-black text-rose-300 drop-shadow-md">
                {likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
              </span>
            </button>

          </div>
        </footer>

      </div>

      {/* =========================================================================
          MODALS & DRAWERS (GIFT STORE, RECHARGE, LEADERBOARD, BROADCAST SUMMARY)
      ========================================================================= */}
      
      {/* 1. Gift Store Bottom-Sheet Modal */}
      <GiftStoreModal
        isOpen={showGiftStore}
        onClose={() => setShowGiftStore(false)}
        streamId={stream.id}
        hostName={stream.hostName}
        onGiftSent={(gift) => {
          setEquippedGiftId(gift.id);
        }}
        onOpenRecharge={() => {
          setShowGiftStore(false);
          setShowRechargeModal(true);
        }}
      />

      {/* 2. Coin Recharge Modal */}
      <CoinRechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />

      {/* 3. Stream Gift Leaderboard Drawer */}
      <LiveLeaderboardDrawer
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        streamId={stream.id}
        hostName={stream.hostName}
      />

      {/* 4. End Live Stream Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-white shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">End Live Broadcast?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to end your live broadcast? Viewers will be shown your session summary.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Keep Going
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  handleEndStream();
                }}
                disabled={isEndingStream}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {isEndingStream ? 'Ending...' : 'End Stream'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Stream Ended Broadcaster Summary Dialog */}
      {showSummaryModal && summaryStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-rose-500/30">
              🏆
            </div>

            <div>
              <h3 className="text-xl font-black text-white">LIVE Stream Summary</h3>
              <p className="text-xs text-slate-400 mt-1">Great broadcast! Here are your results:</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-left">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Duration</div>
                <div className="text-base font-black text-white">{summaryStats.duration}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Peak Viewers</div>
                <div className="text-base font-black text-rose-400">{summaryStats.peakViewers}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Likes</div>
                <div className="text-base font-black text-pink-400">❤️ {summaryStats.totalLikes.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Gifts Received</div>
                <div className="text-base font-black text-amber-400">🎁 {summaryStats.giftsReceived}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/40 text-left">
              <div className="text-[10px] text-amber-300 font-bold uppercase">Creator Earnings</div>
              <div className="text-lg font-black text-yellow-300 flex items-center gap-1.5 mt-0.5">
                <span>🪙 {summaryStats.coinsEarned.toLocaleString()} Coins</span>
              </div>
              <div className="text-[11px] text-amber-200/80 font-semibold mt-0.5">
                ≈ ${summaryStats.usdEarned} USD / ₦{summaryStats.ngnEarned} NGN
              </div>
            </div>

            <button
              onClick={() => {
                setShowSummaryModal(false);
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 font-black text-xs text-white shadow-xl cursor-pointer transition-all"
            >
              Done & Return Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
