import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Check, ArrowDown } from 'lucide-react';

export interface PullToRefreshProps {
  onRefresh: () => Promise<any> | void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  threshold?: number;
  maxPull?: number;
  label?: string;
  isWindowScroll?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  contentClassName = '',
  disabled = false,
  threshold = 68,
  maxPull = 120,
  label,
  isWindowScroll = true
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing' | 'completed'>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const hasTriggeredHaptic = useRef<boolean>(false);

  // Check if scrollable ancestor is at the top
  const isScrolledToTop = useCallback(() => {
    if (isWindowScroll) {
      return (window.pageYOffset || document.documentElement.scrollTop || 0) <= 2;
    }
    if (containerRef.current) {
      return containerRef.current.scrollTop <= 2;
    }
    return true;
  }, [isWindowScroll]);

  // Execute the actual refresh
  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setStatus('refreshing');
    setPullDistance(56); // Hold at active spinner height

    const startTime = Date.now();
    try {
      await onRefresh();
    } catch (err) {
      console.error('Pull to refresh error:', err);
    } finally {
      // Ensure smooth minimum display duration (500ms) so spinner isn't a jarring flash
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 500 - elapsed);

      setTimeout(() => {
        setStatus('completed');
        setTimeout(() => {
          setPullDistance(0);
          setIsRefreshing(false);
          setStatus('idle');
          hasTriggeredHaptic.current = false;
        }, 300);
      }, remainingTime);
    }
  }, [onRefresh, isRefreshing]);

  // Touch handlers (Mobile & Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    if (isScrolledToTop()) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      isPullingRef.current = true;
      hasTriggeredHaptic.current = false;
    } else {
      isPullingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - touchStartY.current;
    const deltaX = currentX - touchStartX.current;

    // If scrolled past top during drag, abort
    if (!isScrolledToTop() && deltaY <= 0) {
      isPullingRef.current = false;
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    // Ignore horizontal swipes (e.g. carousel / stories)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isPullingRef.current = false;
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    if (deltaY > 0) {
      // Resistance curve physics
      const distance = Math.min(maxPull, Math.pow(deltaY, 0.82) * 2.1);
      setPullDistance(distance);
      setIsDragging(true);

      if (distance >= threshold) {
        setStatus('ready');
        if (!hasTriggeredHaptic.current) {
          try {
            if (navigator.vibrate) navigator.vibrate(10);
          } catch {}
          hasTriggeredHaptic.current = true;
        }
      } else {
        setStatus('pulling');
        hasTriggeredHaptic.current = false;
      }
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    isPullingRef.current = false;
    setIsDragging(false);

    if (pullDistance >= threshold) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  };

  // Mouse Drag handlers (Desktop support when pulled from top)
  const isMouseDown = useRef<boolean>(false);
  const mouseStartY = useRef<number>(0);
  const mouseStartX = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshing || e.button !== 0) return;
    // Don't intercept interactive elements like buttons, inputs, links, media
    const target = e.target as HTMLElement;
    if (['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'VIDEO', 'AUDIO', 'SELECT'].includes(target.tagName) || target.closest('button, a, input, textarea, video')) {
      return;
    }

    if (isScrolledToTop()) {
      isMouseDown.current = true;
      mouseStartY.current = e.clientY;
      mouseStartX.current = e.clientX;
      hasTriggeredHaptic.current = false;
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown.current || disabled || isRefreshing) return;

    const deltaY = e.clientY - mouseStartY.current;
    const deltaX = e.clientX - mouseStartX.current;

    if (!isScrolledToTop() && deltaY <= 0) {
      isMouseDown.current = false;
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
      isMouseDown.current = false;
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    if (deltaY > 6) {
      const distance = Math.min(maxPull, Math.pow(deltaY, 0.82) * 2.1);
      setPullDistance(distance);
      setIsDragging(true);

      if (distance >= threshold) {
        setStatus('ready');
      } else {
        setStatus('pulling');
      }
    }
  }, [disabled, isRefreshing, isScrolledToTop, maxPull, threshold]);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    setIsDragging(false);

    if (pullDistance >= threshold && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  }, [pullDistance, threshold, isRefreshing, triggerRefresh]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Calculate circular progress (0 to 1)
  const progress = Math.min(1, pullDistance / threshold);
  const strokeDashoffset = 75.4 - (75.4 * progress);
  const arrowRotation = progress * 360;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className={`relative w-full ${isDragging ? 'select-none' : ''} ${className}`}
    >
      {/* Top Pull-to-Refresh Floating Indicator */}
      <div
        className="absolute left-0 right-0 top-0 flex items-center justify-center pointer-events-none z-30"
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 48)}px)`,
          opacity: pullDistance > 8 || isRefreshing ? Math.min(1, pullDistance / 24) : 0,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease'
        }}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 shadow-lg rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 transition-transform">
          {/* Circular Spinner / Arrow Graphic */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            {status === 'refreshing' ? (
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : status === 'completed' ? (
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in-50 duration-200">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            ) : (
              <div className="relative w-5 h-5">
                {/* SVG Progress Ring */}
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 28 28">
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray="75.4"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-blue-600 dark:text-blue-400 transition-all duration-75"
                  />
                </svg>
                {/* Center Directional Arrow */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform duration-100"
                  style={{
                    transform: status === 'ready' ? 'rotate(180deg) scale(1.15)' : `rotate(${arrowRotation}deg)`
                  }}
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </div>
              </div>
            )}
          </div>

          {/* Micro text feedback */}
          <span className="text-[11px] font-bold tracking-tight">
            {status === 'refreshing'
              ? (label ? `Updating ${label}...` : 'Refreshing...')
              : status === 'completed'
              ? 'Updated!'
              : status === 'ready'
              ? 'Release to refresh'
              : (label ? `Pull down to refresh ${label}` : 'Pull to refresh')}
          </span>
        </div>
      </div>

      {/* Content wrapper with smooth spring elasticity */}
      <div
        className={`w-full ${contentClassName}`}
        style={{
          transform: `translateY(${isRefreshing ? 48 : pullDistance * 0.35}px)`,
          transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
