import React, { useState, useEffect } from 'react';
import { 
  Users2, Plus, Search, Shield, Globe, 
  Lock, CheckCircle, ArrowRight, MessageSquare, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Group } from '../types';
import { api } from '../services/api';
import { PullToRefresh } from './PullToRefresh';

export const GroupsView: React.FC = () => {
  const { 
    currentUser, 
    showCreateGroup, 
    setShowCreateGroup, 
    addToast 
  } = useApp() as any;

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const res = await api.getGroups();
    setGroups(res || []);
  };

  const handlePullRefresh = async () => {
    await loadGroups();
    addToast('Groups Refreshed', 'Loaded latest communities.', 'info');
  };

  const handleToggleJoin = async (group: Group) => {
    if (!currentUser) {
      addToast('Sign in required', 'Please log in to join groups.', 'warning');
      return;
    }
    try {
      const updated = await api.toggleJoinGroup(group.id, currentUser.id);
      setGroups(prev => prev.map(g => g.id === updated.id ? updated : g));
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(updated);
      }
      addToast('Group Updated', `Membership status changed for ${group.name}`, 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh} label="Groups">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-blue-600" /> Communities & Groups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with people who share your interests, industries, crafts, and hobbies.
          </p>
        </div>

        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs shadow-blue-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => {
          const isMember = currentUser && group.members?.includes(currentUser.id);
          return (
            <div
              key={group.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cover & Avatar */}
                <div className="relative h-32 bg-slate-200">
                  <img src={group.coverPhoto} alt={group.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    {group.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span className="capitalize">{group.privacy}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {group.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 line-clamp-1">{group.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{group.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>{group.membersCount?.toLocaleString() || group.members?.length || 1} members</span>
                    <span>•</span>
                    <span>Admin: {group.creatorName}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleToggleJoin(group)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isMember
                      ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20'
                  }`}
                >
                  {isMember ? 'Joined (Click to Leave)' : 'Join Group'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      </div>
    </PullToRefresh>
  );
};

export const CreateGroupModal: React.FC = () => {
  const { 
    currentUser, 
    showCreateGroup, 
    setShowCreateGroup, 
    addToast 
  } = useApp() as any;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & AI');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [coverPhoto, setCoverPhoto] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80');
  const [loading, setLoading] = useState(false);

  if (!showCreateGroup) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      await api.createGroup({
        name,
        description,
        category,
        privacy,
        coverPhoto,
        creatorId: currentUser.id,
        creatorName: currentUser.name
      });
      setShowCreateGroup(false);
      addToast('Group Created!', `${name} is now open for community members.`, 'success');
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
          <h3 className="font-bold text-base text-slate-900">Create Community Group</h3>
          <button onClick={() => setShowCreateGroup(false)} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Group Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next-Gen Creators & Storytellers"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology, Art, Gaming, Science"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Privacy Level</label>
            <select
              value={privacy}
              onChange={(e: any) => setPrivacy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-hidden"
            >
              <option value="public">🌍 Public (Anyone can view posts and join)</option>
              <option value="private">🔒 Private (Only approved members can view posts)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Rules</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about? Share mission and guidelines..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Creating...' : 'Launch Group'}
          </button>
        </form>
      </div>
    </div>
  );
};
