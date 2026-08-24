import React from 'react';
import { useApp } from '../context/AppContext';
import { PreLiveSetupStudio } from './live/PreLiveSetupStudio';

export const GoLiveModal: React.FC = () => {
  const { 
    showGoLiveModal, 
    setShowGoLiveModal 
  } = useApp() as any;

  if (!showGoLiveModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full h-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md xl:max-w-[460px] max-h-screen relative shadow-2xl">
        <PreLiveSetupStudio
          onClose={() => setShowGoLiveModal(false)}
        />
      </div>
    </div>
  );
};
