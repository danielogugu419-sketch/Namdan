import React, { useState, useEffect } from 'react';
import { 
  Flag, Plus, Search, CheckCircle, Star, 
  Globe, Mail, Phone, MapPin, X, ArrowRight, UserPlus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Page } from '../types';
import { api } from '../services/api';
import { PullToRefresh } from './PullToRefresh';

export const PagesView: React.FC = () => {
  const { 
    currentUser, 
    showCreatePage, 
    setShowCreatePage, 
    addToast 
  } = useApp() as any;

  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const res = await api.getPages();
    setPages(res || []);
  };

  const handlePullRefresh = async () => {
    await loadPages();
    addToast('Pages Refreshed', 'Loaded latest business & creator pages.', 'info');
  };

  const handleFollowPage = (page: Page) => {
    addToast('Followed Page', `You will now see updates from ${page.name}`, 'success');
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh} label="Pages">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Flag className="w-7 h-7 text-indigo-600" /> Business & Creator Pages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover brands, creators, studios, and organizations across the globe.
          </p>
        </div>

        <button
          onClick={() => setShowCreatePage(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs shadow-blue-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Page</span>
        </button>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map(page => (
          <div
            key={page.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Cover */}
              <div className="relative h-28 bg-slate-200">
                <img src={page.coverPhoto} alt={page.name} className="w-full h-full object-cover" />
              </div>

              {/* Avatar & Info */}
              <div className="px-5 pt-0 pb-4 relative">
                <div className="-mt-10 mb-3 flex items-end justify-between">
                  <img
                    src={page.avatar}
                    alt={page.name}
                    className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                  />
                  {page.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-800 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{page.rating}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 truncate">{page.name}</h3>
                    {page.isVerified && (
                      <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                    {page.category}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 pt-1 leading-relaxed">{page.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{page.followersCount?.toLocaleString()} followers</span>
                  <span>📍 {page.location || 'Global'}</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => handleFollowPage(page)}
                className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow Page</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      </div>
    </PullToRefresh>
  );
};

export const CreatePageModal: React.FC = () => {
  const { 
    currentUser, 
    showCreatePage, 
    setShowCreatePage, 
    addToast 
  } = useApp() as any;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Design & Architecture');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('https://nemdan.global');
  const [location, setLocation] = useState('Stockholm, Sweden');
  const [loading, setLoading] = useState(false);

  if (!showCreatePage) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      await api.createPage({
        name,
        category,
        description,
        avatar: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=150&auto=format&fit=crop&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
        ownerId: currentUser.id,
        website,
        location,
        isVerified: true
      });
      setShowCreatePage(false);
      addToast('Page Created!', `${name} is now published on NEMDAN.`, 'success');
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
          <h3 className="font-bold text-base text-slate-900">Create Business / Creator Page</h3>
          <button onClick={() => setShowCreatePage(false)} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Page Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Studio Global"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry / Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Media Agency, Coffee Shop, Software"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your brand or creator identity..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Creating Page...' : 'Launch Page'}
          </button>
        </form>
      </div>
    </div>
  );
};
