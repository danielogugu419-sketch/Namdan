import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Image as ImageIcon, Video, Music, 
  BarChart2, MapPin, Smile, Globe, Users, 
  Lock, Sparkles, AlertTriangle, ShieldCheck,
  Upload, RefreshCw, Plus, Check, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  validateImageFile, 
  processAndCompressImage, 
  ProcessedImage 
} from '../utils/imageUtils';

const BG_GRADIENTS = [
  { id: '', label: 'Plain' },
  { id: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-center text-xl p-8', label: 'Ocean' },
  { id: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-center text-xl p-8', label: 'Sunset' },
  { id: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-center text-xl p-8', label: 'Emerald' },
  { id: 'bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold text-center text-xl p-8', label: 'Flame' },
  { id: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-center text-xl p-8', label: 'Midnight' },
];

export const CreatePostModal: React.FC = () => {
  const { 
    currentUser, 
    showCreatePost, 
    setShowCreatePost, 
    pendingUploadFiles,
    setPendingUploadFiles,
    refreshPosts, 
    addToast 
  } = useApp() as any;

  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'public' | 'friends' | 'only_me'>('public');
  const [selectedBg, setSelectedBg] = useState('');
  
  // Images queue and preview state
  const [selectedImages, setSelectedImages] = useState<ProcessedImage[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(null);

  // URL fallback & location
  const [inputMediaUrl, setInputMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  // Poll creator
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Music audio preview
  const [audioUrl, setAudioUrl] = useState('');
  const [showAudioInput, setShowAudioInput] = useState(false);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  // Process incoming files from PostComposer or other triggers
  useEffect(() => {
    if (showCreatePost && pendingUploadFiles && pendingUploadFiles.length > 0) {
      handleFiles(pendingUploadFiles);
      setPendingUploadFiles(null);
    }
  }, [showCreatePost, pendingUploadFiles]);

  if (!showCreatePost) return null;

  const handleFiles = async (files: File[] | FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsProcessingFiles(true);
    const newProcessed: ProcessedImage[] = [];

    for (const file of fileArray) {
      const check = validateImageFile(file);
      if (!check.valid) {
        addToast('File Error', check.error || 'Invalid file format or size.', 'error');
        continue;
      }

      try {
        const processed = await processAndCompressImage(file);
        newProcessed.push(processed);
      } catch (err: any) {
        addToast('Processing Error', `Failed to process image "${file.name}"`, 'error');
      }
    }

    if (replacingImageIndex !== null) {
      if (newProcessed.length > 0) {
        setSelectedImages(prev => {
          const updated = [...prev];
          updated[replacingImageIndex] = newProcessed[0];
          return updated;
        });
        addToast('Image Replaced', 'Photo updated successfully.', 'success');
      }
      setReplacingImageIndex(null);
    } else {
      setSelectedImages(prev => [...prev, ...newProcessed]);
      if (newProcessed.length > 0) {
        addToast('Photo Added', `${newProcessed.length} photo${newProcessed.length > 1 ? 's' : ''} ready to post.`, 'info');
      }
    }

    setIsProcessingFiles(false);
  };

  const handleOpenPicker = () => {
    setReplacingImageIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleReplaceClick = (index: number) => {
    setReplacingImageIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrlMedia = () => {
    if (inputMediaUrl.trim()) {
      setSelectedImages(prev => [
        ...prev,
        {
          id: `url_${Date.now()}`,
          name: 'Remote Media',
          dataUrl: inputMediaUrl.trim(),
          fileSize: 0,
          width: 0,
          height: 0,
          mimeType: 'image/jpeg',
          uploadedUrl: inputMediaUrl.trim()
        }
      ]);
      setInputMediaUrl('');
      setShowMediaInput(false);
      addToast('Media Attached', 'Remote URL added to post.', 'info');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!content.trim() && selectedImages.length === 0 && !pollQuestion) {
      addToast('Empty Post', 'Please write something or attach a photo.', 'warning');
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      // 1. Upload local images to permanent server storage
      const uploadedMediaUrls: string[] = [];
      const totalImages = selectedImages.length;

      for (let i = 0; i < totalImages; i++) {
        const item = selectedImages[i];
        if (item.uploadedUrl) {
          uploadedMediaUrls.push(item.uploadedUrl);
        } else {
          // Upload base64 compressed dataUrl to server storage
          const result = await api.uploadImage(item.dataUrl, item.name, currentUser.id);
          uploadedMediaUrls.push(result.url);
        }
        setUploadProgress(Math.round(((i + 1) / totalImages) * 70) + 15);
      }

      setUploadProgress(90);

      // 2. Poll data if created
      const pollData = showPollCreator && pollQuestion ? {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map((text, idx) => ({
          id: `opt_${idx + 1}`,
          text,
          votes: 0,
          voterIds: []
        }))
      } : undefined;

      // 3. Create post via NEMDAN API
      const newPost = await api.createPost({
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        authorVerified: currentUser.isVerified,
        content,
        mediaUrls: uploadedMediaUrls,
        media: uploadedMediaUrls.map(url => ({
          type: (url.includes('.mp4') || url.includes('video')) ? 'video' : 'image',
          url
        })),
        audioUrl: audioUrl || undefined,
        location: location || undefined,
        backgroundColor: selectedBg || undefined,
        audience,
        poll: pollData
      });

      setUploadProgress(100);
      await refreshPosts();
      setShowCreatePost(false);

      if (newPost.moderationStatus === 'flagged') {
        addToast(
          'Post Submitted for Review', 
          'Our AI safety scanner noted potential community flags. An admin will review it shortly.', 
          'warning'
        );
      } else {
        addToast('Post Published!', 'Your photo and update are live on the NEMDAN feed.', 'success');
      }

      // Reset state
      setContent('');
      setSelectedImages([]);
      setSelectedBg('');
      setLocation('');
      setPollQuestion('');
      setShowPollCreator(false);
      setUploadProgress(null);
    } catch (err: any) {
      addToast('Error Posting', err.message || 'Failed to publish post.', 'error');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden Native File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      <div className={`bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border transition-all overflow-hidden relative my-auto max-h-[90vh] flex flex-col ${
        isDragging ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
      }`}>
        
        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="w-full bg-blue-100 dark:bg-blue-950 h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Post</h3>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              AI Guard Active
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setShowCreatePost(false)} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleCreate} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Author snippet & Audience selector */}
          <div className="flex items-center gap-3">
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{currentUser?.name}</p>
                {currentUser?.isVerified && (
                  <span className="w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={audience}
                  onChange={(e: any) => setAudience(e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-300 font-medium outline-hidden"
                >
                  <option value="public">🌍 Public (Everyone)</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="only_me">🔒 Only Me</option>
                </select>
                {location && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5">
                    • <MapPin className="w-3 h-3 text-red-500" /> {location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Text Content / Colored Background */}
          <div className={`rounded-2xl transition-all ${selectedBg || 'bg-transparent'}`}>
            <textarea
              rows={selectedBg ? 4 : selectedImages.length > 0 ? 2 : 4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's happening in your world, ${currentUser?.name.split(' ')[0]}?`}
              className={`w-full p-3 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-hidden resize-none ${
                selectedBg ? 'text-white placeholder-white/70 font-semibold text-center' : 'text-slate-900 dark:text-white'
              }`}
            />
          </div>

          {/* Background Card Gradient Selector (Only if no images selected) */}
          {selectedImages.length === 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Theme:</span>
              {BG_GRADIENTS.map((bg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedBg(bg.id)}
                  className={`w-6 h-6 rounded-full border-2 transition-all shrink-0 cursor-pointer ${
                    selectedBg === bg.id ? 'scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-80'
                  } ${bg.id ? bg.id.split(' ')[0] + ' ' + bg.id.split(' ')[1] : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}
                  title={bg.label}
                />
              ))}
            </div>
          )}

          {/* Processing / Compressing Spinner Indicator */}
          {isProcessingFiles && (
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Optimizing and compressing photos...</span>
            </div>
          )}

          {/* Image Previews & Management Gallery */}
          {selectedImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
                <span>Selected Photos ({selectedImages.length})</span>
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add more
                </button>
              </div>

              <div className={`grid gap-2 ${
                selectedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                {selectedImages.map((img, idx) => (
                  <div 
                    key={img.id || idx} 
                    className="relative rounded-2xl overflow-hidden group bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-44 sm:h-48"
                  >
                    <img 
                      src={img.dataUrl} 
                      alt={img.name} 
                      className="w-full h-full object-cover"
                    />

                    {/* Top Action Overlay (Replace / Delete) */}
                    <div className="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-black/70 via-black/30 to-transparent flex items-center justify-between">
                      <span className="text-[10px] text-white/90 font-medium px-2 py-0.5 bg-black/40 rounded-full truncate max-w-[120px]">
                        {img.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReplaceClick(idx)}
                          className="p-1.5 rounded-full bg-black/60 hover:bg-blue-600 text-white transition-colors cursor-pointer"
                          title="Replace Photo"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Metadata Info */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between text-[10px] text-white/90">
                      <span>{img.width > 0 ? `${img.width}×${img.height}px` : 'Photo'}</span>
                      {img.fileSize > 0 && (
                        <span>{(img.fileSize / 1024).toFixed(0)} KB</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drag & Drop Hint / Quick Upload Dropzone if no photos attached yet */}
          {selectedImages.length === 0 && (
            <div 
              onClick={handleOpenPicker}
              className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop photos here
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Supports high-res JPG, PNG, and WEBP (up to 15MB)
              </p>
            </div>
          )}

          {/* Image URL Input Popover */}
          {showMediaInput && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Attach Image or Video URL</p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={inputMediaUrl}
                  onChange={(e) => setInputMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddUrlMedia}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Location Input Popover */}
          {showLocationInput && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Check In Location</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Zurich, Switzerland or Tokyo Tech Hub"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationInput(false)}
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {/* Poll Creator */}
          {showPollCreator && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-600" /> Create Community Poll
                </p>
                <button type="button" onClick={() => setShowPollCreator(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium outline-hidden"
              />
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* Quick Attach Toolbar */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add to your post</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                id="create-modal-upload-photo-btn"
                onClick={handleOpenPicker}
                className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                title="Upload Photo (Device)"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowPollCreator(!showPollCreator)}
                className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                title="Create Poll"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="p-2 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Location Tag"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isProcessingFiles}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgress ? `Uploading (${uploadProgress}%)...` : 'Publishing...'}</span>
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
