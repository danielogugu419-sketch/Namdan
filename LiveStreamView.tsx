import React from 'react';
import { useApp } from '../context/AppContext';
import { FullScreenLiveViewer } from './live/FullScreenLiveViewer';
import { PreLiveSetupStudio } from './live/PreLiveSetupStudio';

export const LiveStreamView: React.FC = () => {
  const { 
    activeLiveStream, 
    setActiveLiveStream,
    setCurrentTab
  } = useApp() as any;

  // 1. If an active live stream is broadcasting or being watched, present the full-screen vertical live viewer
  if (activeLiveStream) {
    return (
      <FullScreenLiveViewer
        stream={activeLiveStream}
        onClose={() => setActiveLiveStream(null)}
      />
    );
  }

  // 2. When a user enters the Live section without an active stream, present the dedicated Pre-Live Setup Studio
  return (
    <PreLiveSetupStudio 
      onClose={() => setCurrentTab('feed')}
    />
  );
};

