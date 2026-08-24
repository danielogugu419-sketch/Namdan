import React, { useState } from 'react';
import { 
  X, Mail, Lock, Phone, User as UserIcon, 
  ArrowRight, ShieldCheck, CheckCircle2, 
  MessageSquare, Smartphone, Chrome
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authMode, 
    setAuthMode, 
    setCurrentUser, 
    addToast 
  } = useApp() as any;

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [demoCodeHint, setDemoCodeHint] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login(emailOrUser || 'danielogugu419@gmail.com', password);
      if (res.user) {
        setCurrentUser(res.user);
        setShowAuthModal(false);
        addToast(`Welcome back, ${res.user.name}!`, 'Logged in successfully.', 'success');
      }
    } catch (err: any) {
      addToast('Login error', err.message || 'Check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.register({
        name: name || 'NEMDAN Pioneer',
        username: username || `user_${Date.now().toString().slice(-4)}`,
        email: emailOrUser || `user_${Date.now()}@nemdan.test`,
        phone: phone || '+1 (555) 000-1111',
        role
      });
      if (res.user) {
        setCurrentUser(res.user);
        setShowAuthModal(false);
        addToast(`Welcome to NEMDAN, ${res.user.name}!`, 'Your account has been created.', 'success');
      }
    } catch (err: any) {
      addToast('Registration error', err.message || 'Could not register.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      addToast('Phone number required', 'Please enter your mobile phone number.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendOtp(phone, otpChannel);
      setOtpSent(true);
      setDemoCodeHint(res.demoCode);
      setOtpCode(res.demoCode); // prefill for easy instant testing
      addToast(`OTP Sent via ${otpChannel.toUpperCase()}`, res.message, 'info');
    } catch (err: any) {
      addToast('OTP Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otpCode);
      if (res.user) {
        setCurrentUser(res.user);
        setShowAuthModal(false);
        addToast('Phone Verified!', `Logged in as ${res.user.name}`, 'success');
      }
    } catch (err: any) {
      addToast('Verification Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    setLoading(true);
    setTimeout(async () => {
      const res = await api.login('danielogugu419@gmail.com');
      setCurrentUser(res.user);
      setShowAuthModal(false);
      setLoading(false);
      addToast(`Signed in with ${provider}`, `Welcome back, ${res.user.name}!`, 'success');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
        
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-8 pb-4 text-center bg-gradient-to-b from-blue-50/70 to-white border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mx-auto flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 mb-3">
            N
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {authMode === 'login' && 'Log In to NEMDAN'}
            {authMode === 'register' && 'Create Your Account'}
            {authMode === 'otp' && 'Phone OTP Sign In'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Global connection, creative reels, and secure marketplace
          </p>
        </div>

        {/* Auth Method Tabs */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 mb-4">
            <button
              onClick={() => { setAuthMode('login'); setOtpSent(false); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'login' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setOtpSent(false); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'register' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setAuthMode('otp'); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'otp' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Phone OTP
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-0 space-y-4">
          
          {/* 1. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    placeholder="e.g. daniel_admin or email"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Log In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Elena Vance"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="elenavance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white outline-hidden capitalize"
                >
                  <option value="user">Standard User</option>
                  <option value="creator">Creator / Influencer</option>
                  <option value="marketplace_manager">Marketplace Seller / Manager</option>
                  <option value="community_manager">Community Manager</option>
                  <option value="moderator">Content Moderator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. PHONE OTP FORM */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08142883388"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Channel</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpChannel('sms')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          otpChannel === 'sms'
                            ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>SMS Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpChannel('whatsapp')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          otpChannel === 'whatsapp'
                            ? 'bg-green-50 border-green-400 text-green-700 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    <span>{loading ? 'Sending Code...' : `Send OTP via ${otpChannel.toUpperCase()}`}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800">
                    <p className="font-semibold">Code sent to {phone}</p>
                    <p className="text-[11px] text-blue-600 mt-0.5">Demo OTP: <span className="font-mono font-bold">{demoCodeHint || '849201'}</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Social Sign In Dividers */}
          <div className="pt-2">
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="font-bold text-base leading-none"></span>
                <span>Apple</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
