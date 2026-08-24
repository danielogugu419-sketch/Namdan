import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Phone, Video, MoreVertical, Image as ImageIcon, 
  Mic, Smile, Send, CheckCircle, Check, CheckCheck, 
  Play, Pause, Paperclip, Sparkles, X, User, ArrowLeft,
  Camera, Info, Shield, Trash2, Bell, AlertCircle, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUsers } from '../server/db';
import { Conversation, User as UserType, Message } from '../types';
import { api } from '../services/api';
import { PullToRefresh } from './PullToRefresh';

export const MessengerView: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
    refreshConversations,
    activeConversation, 
    setActiveConversation, 
    messages, 
    sendMessage, 
    startCall, 
    addToast,
    setSelectedUserId,
    setCurrentTab
  } = useApp() as any;

  const [inputMsg, setInputMsg] = useState('');
  const [searchConv, setSearchConv] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll messages list to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);

  // Selected participant in 1-on-1 chat
  const targetUser: UserType | undefined = activeConversation 
    ? (activeConversation.participants.find((p: UserType) => p.id !== currentUser?.id) || activeConversation.participants[0])
    : undefined;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() && !photoUrl.trim()) return;

    if (photoUrl.trim()) {
      await sendMessage(inputMsg.trim() || 'Sent a photo', 'image', photoUrl.trim());
      setPhotoUrl('');
      setShowPhotoInput(false);
    } else {
      await sendMessage(inputMsg.trim(), 'text');
    }
    setInputMsg('');
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMsg(e.target.value);
    // Auto-resize textarea height up to 120px
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle Photo Picker Upload
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast('Invalid Format', 'Please choose a JPG, PNG, or WEBP image.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('File Too Large', 'Maximum image size is 15MB.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    addToast('Uploading Image', 'Processing photo attachment...', 'info');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, file.name, currentUser?.id);
        if (uploadRes?.url) {
          await sendMessage('Sent a photo', 'image', uploadRes.url);
          addToast('Photo Delivered', 'Image sent in chat.', 'success');
        }
      } catch (err: any) {
        addToast('Upload Error', err.message || 'Failed to upload photo', 'error');
      } finally {
        setIsUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendVoiceNote = async () => {
    setIsRecordingAudio(true);
    addToast('Recording Voice Note...', 'Simulating 4s voice message...', 'info');
    setTimeout(async () => {
      setIsRecordingAudio(false);
      await sendMessage('🎤 Voice Note (0:04)', 'audio', 'https://actions.google.com/sounds/v1/water/air_woosh_underwater.ogg');
      addToast('Voice Note Sent', 'Audio message delivered.', 'success');
    }, 2000);
  };

  const quickEmojis = ['❤️', '👍', '🔥', '😂', '👏', '🎉', '🙌', '✨', '😍', '🚀'];

  const filteredConversations = conversations.filter((c: Conversation) => {
    const otherUser = c.participants.find(p => p.id !== currentUser?.id);
    if (!otherUser) return true;
    return otherUser.name.toLowerCase().includes(searchConv.toLowerCase());
  });

  return (
    <div className="w-full">
      {/* Hidden file input for native image picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* Main Messenger Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden h-[calc(100vh-148px)] sm:h-[calc(100vh-160px)] min-h-[500px] flex">
        
        {/* ========================================================================= */}
        {/* 1. LEFT CONVERSATION LIST (Hidden on mobile when conversation is active)  */}
        {/* ========================================================================= */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shrink-0 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Messages</h2>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-900">
                End-to-End
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchConv}
                onChange={(e) => setSearchConv(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:bg-white dark:focus:bg-slate-800/90 border border-transparent focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <PullToRefresh 
            onRefresh={async () => {
              if (refreshConversations) await refreshConversations();
              addToast('Messages Refreshed', 'Loaded latest conversations.', 'info');
            }} 
            isWindowScroll={false}
            label="Conversations"
            className="flex-1 overflow-y-auto"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredConversations.map((conv: Conversation) => {
                const other = conv.participants.find(p => p.id !== currentUser?.id) || conv.participants[0];
                const isActive = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    id={`conversation-item-${conv.id}`}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50/90 dark:bg-blue-950/60 border-l-4 border-blue-600' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={other.avatar} 
                        alt={other.name} 
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                          <span>{other.name}</span>
                          {other.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">{conv.updatedAt || 'Just now'}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {conv.lastMessage?.content || 'Started a conversation'}
                      </p>
                    </div>
                    {conv.unreadCount ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </PullToRefresh>

        </div>

        {/* ========================================================================= */}
        {/* 2. FULL-SCREEN CHAT PANE (Active Viewport on mobile, main area on desktop) */}
        {/* ========================================================================= */}
        <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation && targetUser ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              
              {/* CHAT HEADER — Fixed at the top */}
              <div 
                id="chat-active-header"
                className="px-4 py-3 sm:py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs z-20"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Back Button (Returns to Conversations List) */}
                  <button 
                    id="chat-back-to-list-btn"
                    onClick={() => setActiveConversation(null)}
                    className="p-2 -ml-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                    title="Back to conversation list"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Profile Picture, Name, Online Status */}
                  <div 
                    onClick={() => { 
                      setSelectedUserId(targetUser.id); 
                      setCurrentTab('profile'); 
                    }}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={targetUser.avatar} 
                        alt={targetUser.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform" 
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                        <span className="truncate">{targetUser.name}</span>
                        {targetUser.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />}
                      </h3>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active now</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons (Audio Call, Video Call, More Menu) */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Audio Call Button */}
                  <button
                    id="chat-header-voice-call-btn"
                    onClick={() => startCall(targetUser, 'voice')}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center justify-center transition-colors cursor-pointer"
                    title="Audio Call"
                    aria-label="Start Voice Call"
                  >
                    <Phone className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  {/* Video Call Button */}
                  <button
                    id="chat-header-video-call-btn"
                    onClick={() => startCall(targetUser, 'video')}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center justify-center transition-colors cursor-pointer"
                    title="Video Call"
                    aria-label="Start Video Call"
                  >
                    <Video className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  {/* More Options Dropdown */}
                  <div className="relative">
                    <button
                      id="chat-header-more-btn"
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="More Options"
                      aria-label="More"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {showChatMenu && (
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={() => {
                            setSelectedUserId(targetUser.id);
                            setCurrentTab('profile');
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                        >
                          <User className="w-4 h-4 text-blue-500" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            addToast('End-to-End Encryption', 'Messages and calls are secured with end-to-end encryption.', 'info');
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                        >
                          <Shield className="w-4 h-4 text-emerald-500" />
                          <span>Encryption Info</span>
                        </button>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                        <button
                          onClick={() => {
                            addToast('Notifications Muted', `Muted notifications for ${targetUser.name}.`, 'info');
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5"
                        >
                          <Bell className="w-4 h-4 text-slate-400" />
                          <span>Mute Notifications</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MESSAGE LIST — Occupies the available middle area with smooth scrolling */}
              <div 
                id="chat-message-list"
                className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth"
              >
                {/* Security encryption banner */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-3.5 py-1.5 rounded-full shadow-2xs">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span>End-to-End Encrypted NEMDAN Messenger</span>
                  </span>
                </div>

                {/* Message items */}
                {messages.map((msg: Message) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-150`}
                    >
                      {/* Incoming sender avatar */}
                      {!isMe && (
                        <img 
                          src={msg.senderAvatar || targetUser.avatar} 
                          alt="Sender" 
                          className="w-7 h-7 rounded-full object-cover mb-1 border border-slate-200 dark:border-slate-700 shrink-0" 
                        />
                      )}

                      <div className={`max-w-[78%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        
                        {/* Image media bubble */}
                        {msg.type === 'image' && msg.mediaUrl && (
                          <div className="rounded-2xl overflow-hidden mb-1 border border-slate-200 dark:border-slate-800 shadow-sm max-h-72 bg-black/5">
                            <img 
                              src={msg.mediaUrl} 
                              alt="Attached photo" 
                              className="w-full h-full object-cover hover:scale-102 transition-transform cursor-pointer"
                              onClick={() => window.open(msg.mediaUrl, '_blank')} 
                            />
                          </div>
                        )}

                        {/* Audio voice note bubble */}
                        {msg.type === 'audio' && msg.mediaUrl && (
                          <div className={`p-3 rounded-2xl flex items-center gap-3 shadow-xs ${
                            isMe 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                          }`}>
                            <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Mic className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                              <p className="font-bold mb-1">Voice Recording (0:04)</p>
                              <audio src={msg.mediaUrl} controls className="h-6 w-44 mt-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Text bubble */}
                        {msg.type !== 'audio' && msg.content && (
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${
                              isMe 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-xs' 
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-700 rounded-bl-xs shadow-2xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        )}

                        {/* Timestamp & read checkmarks */}
                        <div className={`flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{msg.createdAt || 'Just now'}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>

                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Emoji Bar if toggled */}
              {showEmojiPicker && (
                <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                  {quickEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputMsg(prev => prev + emoji)}
                      className="p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Photo URL Input Bar if triggered */}
              {showPhotoInput && (
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Paste image link or use device picker..."
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900 cursor-pointer"
                  >
                    From Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhotoInput(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* MESSAGE COMPOSER — Fixed at the bottom */}
              <div 
                id="chat-composer-container"
                className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 shrink-0"
              >
                <form onSubmit={handleSend} className="flex items-end gap-1.5 sm:gap-2">
                  
                  {/* Photo picker trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="p-2 sm:p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
                    title="Upload Photo / File"
                    aria-label="Upload Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>

                  {/* Emoji picker toggle */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 sm:p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
                    title="Add Emoji"
                    aria-label="Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Voice recording trigger */}
                  <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    className={`p-2 sm:p-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
                      isRecordingAudio 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Send Voice Note"
                    aria-label="Voice Note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Expanding Text Area */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputMsg}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a message..."
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800/95 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-hidden transition-all resize-none max-h-28"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!inputMsg.trim() && !photoUrl.trim()) || isUploadingPhoto}
                    className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-full transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer shrink-0"
                    title="Send Message"
                    aria-label="Send Message"
                  >
                    <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>

                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
                <Send className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Select a Conversation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  Choose a chat on the left to start sending instant messages, voice notes, and photos in real time.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const FloatingChatDock: React.FC = () => {
  const { 
    currentUser, 
    floatingChatUser, 
    setFloatingChatUser, 
    sendMessage,
    startCall
  } = useApp() as any;

  const [text, setText] = useState('');

  if (!floatingChatUser || !currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img src={floatingChatUser.avatar} alt={floatingChatUser.name} className="w-7 h-7 rounded-full object-cover border border-white/40" />
          <span className="text-xs font-bold truncate">{floatingChatUser.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => startCall(floatingChatUser, 'video')} 
            className="p-1 hover:bg-white/20 rounded-full"
            title="Video Call"
          >
            <Video className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setFloatingChatUser(null)} 
            className="p-1 hover:bg-white/20 rounded-full"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Messages */}
      <div className="h-44 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 text-xs space-y-2 text-slate-800 dark:text-slate-200">
        <div className="bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 p-2.5 rounded-xl text-left border border-blue-200/50 dark:border-blue-900">
          Hello! How can I help you today?
        </div>
      </div>

      {/* Mini Input */}
      <form onSubmit={handleSend} className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-xs outline-hidden"
        />
        <button type="submit" className="p-1.5 bg-blue-600 text-white rounded-full">
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
