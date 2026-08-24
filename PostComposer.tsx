import React, { useRef } from 'react';
import { 
  Image as ImageIcon, Video, Film, Smile, 
  BarChart2, Sparkles, PlusCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateImageFile } from '../utils/imageUtils';

export const PostComposer: React.FC = () => {
  const { 
    currentUser, 
    setShowCreatePost, 
    setPendingUploadFiles,
    setShowUploadReel, 
    setShowCreateStory, 
    setCurrentTab, 
    setSelectedUserId,
    addToast
  } = useApp() as any;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) return null;

  const firstName = currentUser.name.split(' ')[0];

  const handlePhotoBtnClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    } else {
      setShowCreatePost(true);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const check = validateImageFile(file);
      if (!check.valid) {
        addToast('Invalid Image', check.error || 'Please select valid JPG, PNG, or WEBP files.', 'error');
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setPendingUploadFiles(validFiles);
      setShowCreatePost(true);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      
      {/* Hidden Native File Input for Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        className="hidden"
      />

      {/* Top Input Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setSelectedUserId(currentUser.id);
            setCurrentTab('profile');
          }}
          className="shrink-0 cursor-pointer"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-all"
          />
        </button>

        <button
          id="composer-open-modal-btn"
          onClick={() => setShowCreatePost(true)}
          className="flex-1 text-left px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          What's on your mind, {firstName}?
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-4 gap-1">
        
        {/* 1. Photo Upload Button */}
        <button
          id="composer-photo-btn"
          onClick={handlePhotoBtnClick}
          className="py-2 px-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">Photo</span>
        </button>

        {/* 2. Video */}
        <button
          id="composer-video-btn"
          onClick={() => setShowCreatePost(true)}
          className="py-2 px-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
        >
          <Video className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="truncate">Video</span>
        </button>

        {/* 3. Create Reel */}
        <button
          id="composer-reel-btn"
          onClick={() => setShowUploadReel(true)}
          className="py-2 px-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors cursor-pointer"
        >
          <Film className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">Reel</span>
        </button>

        {/* 4. Feeling / Activity */}
        <button
          id="composer-feeling-btn"
          onClick={() => setShowCreatePost(true)}
          className="py-2 px-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-colors cursor-pointer"
        >
          <Smile className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">Feeling</span>
        </button>

      </div>

    </div>
  );
};
