import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, 
  MicOff, Monitor, Shield, Sparkles, Volume2, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CallModal: React.FC = () => {
  const { 
    currentUser, 
    activeCall, 
    incomingCall, 
    acceptCall, 
    rejectCall, 
    endCall 
  } = useApp() as any;

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Duration timer when connected
  useEffect(() => {
    if (activeCall?.status !== 'connected') {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  // Request real camera stream if video call
  useEffect(() => {
    if (activeCall && activeCall.type === 'video' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Camera/Microphone permission denied or not available:', err);
        });
    }

    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCall]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. INCOMING CALL ALERT
  if (incomingCall) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 text-center space-y-6 shadow-2xl">
          <div className="relative inline-block mx-auto">
            <img
              src={incomingCall.caller.avatar}
              alt={incomingCall.caller.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 border-2 border-slate-900">
              {incomingCall.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{incomingCall.caller.name}</h3>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mt-1">
              Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call...
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={rejectCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-95 cursor-pointer"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={acceptCall}
              className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-transform active:scale-95 animate-bounce cursor-pointer"
              title="Accept"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE CALL OVERLAY
  if (!activeCall) return null;

  const targetPerson = activeCall.caller.id === currentUser?.id ? activeCall.receiver : activeCall.caller;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
      
      {/* Top Status Header */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white text-sm font-bold flex items-center gap-1.5">
              <span>{targetPerson.name}</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase font-mono">
                WebRTC E2EE
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {activeCall.status === 'calling' ? 'Calling...' : `Active Call (${formatSeconds(callDuration)})`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-green-400 bg-green-950/60 border border-green-800/60 px-3 py-1 rounded-full">
            ● 60 FPS HD Audio
          </span>
        </div>
      </div>

      {/* Center Video / Audio Stage */}
      <div className="flex-1 my-4 relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
        {activeCall.type === 'video' ? (
          <>
            {/* Remote simulated caller view */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900">
              <img
                src={targetPerson.avatar}
                alt={targetPerson.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-2xl mb-4"
              />
              <p className="text-white text-lg font-bold">{targetPerson.name}</p>
              <p className="text-slate-400 text-xs mt-1">
                {activeCall.status === 'calling' ? 'Ringing...' : 'Connected in HD Video'}
              </p>
            </div>

            {/* Local picture-in-picture stream */}
            <div className="absolute bottom-4 right-4 w-32 sm:w-44 h-48 sm:h-60 rounded-2xl bg-black border-2 border-white/20 overflow-hidden shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded-md text-white font-medium">
                You
              </div>
            </div>
          </>
        ) : (
          /* Voice Call Visualizer */
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={targetPerson.avatar}
                alt={targetPerson.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-2xl mx-auto"
              />
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-25 pointer-events-none" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{targetPerson.name}</h3>
              <p className="text-sm text-blue-400 font-medium mt-1">
                {activeCall.status === 'calling' ? 'Connecting voice channels...' : 'Voice Call in progress'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center gap-4 z-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {activeCall.type === 'video' && (
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              !isVideoEnabled ? 'bg-red-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
            title={isVideoEnabled ? 'Disable Camera' : 'Enable Camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        )}

        {/* End Call Button */}
        <button
          id="end-call-btn"
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-95 cursor-pointer"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
};
