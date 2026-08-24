import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Users, AlertTriangle, 
  CheckCircle, XCircle, Check, Trash2, Eye, 
  Search, Sliders, RefreshCw, Sparkles, UserX, UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModerationCase, VerificationRequest, User } from '../types';
import { api } from '../services/api';
import { AdminGiftingAndReferralPanel } from './admin/AdminGiftingAndReferralPanel';

export const AdminDashboardView: React.FC = () => {
  const { currentUser, addToast } = useApp() as any;

  const [activeTab, setActiveTab] = useState<'moderation' | 'verifications' | 'users' | 'gifting' | 'platform'>('moderation');
  const [moderationCases, setModerationCases] = useState<ModerationCase[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [modRes, verRes, uRes, ovRes] = await Promise.all([
        api.getModerationQueue(),
        api.getVerifications(),
        api.getUsers(),
        api.getAdminOverview()
      ]);
      setModerationCases(modRes || []);
      setVerifications(verRes || []);
      setUsersList(uRes || []);
      setOverview(ovRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationDecision = async (caseId: string, decision: 'approved' | 'removed' | 'dismissed') => {
    try {
      await api.moderateDecision(caseId, decision, currentUser?.id);
      setModerationCases(prev => prev.map(c => c.id === caseId ? { ...c, status: decision as any } : c));
      addToast(
        'Moderation Action Executed', 
        `Case ${caseId} marked as ${decision.toUpperCase()}. Content updated in database.`, 
        decision === 'approved' ? 'success' : 'info'
      );
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleVerificationDecision = async (reqId: string, decision: 'approved' | 'rejected') => {
    try {
      await api.verificationDecision(reqId, decision);
      setVerifications(prev => prev.map(v => v.id === reqId ? { ...v, status: decision } : v));
      addToast(
        'Verification Decision Logged',
        `Account verification has been ${decision.toUpperCase()}. Blue badge updated.`,
        decision === 'approved' ? 'success' : 'warning'
      );
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleToggleBan = async (user: User) => {
    const newBanStatus = !user.isBanned;
    try {
      await api.updateUser(user.id, { isBanned: newBanStatus });
      setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, isBanned: newBanStatus } : u));
      addToast(
        newBanStatus ? 'User Banned' : 'User Reinstated',
        `${user.name} access has been updated.`,
        newBanStatus ? 'warning' : 'success'
      );
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRole: any) => {
    try {
      await api.updateUser(userId, { role: newRole });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addToast('Role Updated', `User permissions changed to ${newRole.toUpperCase()}`, 'success');
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>NEMDAN Trust & Safety Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platform Administration</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Review Gemini AI automated flags, approve authentic verification badges, and manage member permissions.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All Queues</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{overview?.totalUsers || usersList.length}</p>
          <span className="text-[11px] text-green-600 font-bold">● Active Ecosystem</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feed Posts</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{overview?.totalPosts || 12}</p>
          <span className="text-[11px] text-blue-600 font-bold">100% AI Scanned</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Flags in Queue</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{moderationCases.filter(c => c.status === 'pending').length}</p>
          <span className="text-[11px] text-amber-700 font-bold">Requires Human Decision</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Req.</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{verifications.filter(v => v.status === 'pending').length}</p>
          <span className="text-[11px] text-blue-700 font-bold">Blue Badge Applications</span>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs gap-1">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'moderation' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          AI Moderation Queue ({moderationCases.filter(c => c.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'verifications' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Identity Verifications ({verifications.filter(v => v.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          User Permissions ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('gifting')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gifting' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Gifts, Coins & Referrals 👑
        </button>
      </div>

      {/* 1. AI MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Human-in-the-Loop Moderation Policy
            </p>
            <p className="text-blue-800 leading-relaxed">
              Gemini AI analyzes incoming content for harmful language, harassment, hate speech, or dangerous goods. In accordance with NEMDAN Community Governance, content is NEVER automatically deleted. The final decision rests with administrators below.
            </p>
          </div>

          <div className="space-y-4">
            {moderationCases.map(c => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{c.id}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-400">• Author: <strong className="text-slate-700">{c.authorName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">AI Confidence:</span>
                    <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {c.confidenceScore}%
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      c.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      c.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Status: {c.status}
                    </span>
                  </div>
                </div>

                {/* Content Snippet */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-900 font-medium">
                  "{c.contentSnippet}"
                </div>

                {/* AI Explanation Box */}
                <div className="p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Gemini AI Reasoning:
                  </p>
                  <p className="text-purple-800 leading-relaxed">{c.explanation}</p>
                </div>

                {/* Admin Decision Actions */}
                {c.status === 'pending' ? (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleModerationDecision(c.id, 'approved')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve (Keep Post)</span>
                    </button>

                    <button
                      onClick={() => handleModerationDecision(c.id, 'removed')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove & Warn Author</span>
                    </button>

                    <button
                      onClick={() => handleModerationDecision(c.id, 'dismissed')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Dismiss Flag (False Positive)</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium pt-1">
                    Decision recorded by Administrator. Case resolved.
                  </p>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. VERIFICATIONS QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Verified Blue Badge Applications</h3>
              <span className="text-xs text-slate-500">{verifications.length} total applications</span>
            </div>

            <div className="divide-y divide-slate-100">
              {verifications.map(req => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={req.userAvatar} alt={req.userName} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{req.userName}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{req.category}</p>
                      <p className="text-[11px] text-slate-400">Document: {req.documentType} • Submitted: {req.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleVerificationDecision(req.id, 'approved')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve Badge</span>
                        </button>
                        <button
                          onClick={() => handleVerificationDecision(req.id, 'rejected')}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. USER PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">User Accounts & Role Permissions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">@{u.username} • {u.email}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-hidden capitalize"
                      >
                        <option value="user">User</option>
                        <option value="creator">Creator</option>
                        <option value="marketplace_manager">Marketplace Seller</option>
                        <option value="community_manager">Community Manager</option>
                        <option value="moderator">Moderator</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>

                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="text-blue-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 fill-blue-600 text-white" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>

                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Banned
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          u.isBanned ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {u.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GIFTS, COINS & REFERRALS MANAGEMENT */}
      {activeTab === 'gifting' && (
        <AdminGiftingAndReferralPanel />
      )}

    </div>
  );
};
