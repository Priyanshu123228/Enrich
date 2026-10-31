import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

export default function PhotoLightbox({
  mediaList = [],
  currentIndex = 0,
  onClose,
  onNavigate
}) {
  const [isLoading, setIsLoading] = useState(true);
  const currentItem = mediaList[currentIndex];

  const MODAL_HISTORY_KEY = 'enrich_modal_lightbox';
  const hasPushedHistoryRef = useRef(false);
  const isClosedByPopstateRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Sync callbacks without triggering re-subscriptions
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Navigate to Next Photo (with loop-around support)
  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!mediaList || mediaList.length <= 1) return;
      const nextIdx = (currentIndex + 1) % mediaList.length;
      onNavigateRef.current?.(nextIdx);
    },
    [currentIndex, mediaList]
  );

  // Navigate to Previous Photo (with loop-around support)
  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation();
      if (!mediaList || mediaList.length <= 1) return;
      const prevIdx = (currentIndex - 1 + mediaList.length) % mediaList.length;
      onNavigateRef.current?.(prevIdx);
    },
    [currentIndex, mediaList]
  );

  // Unified close requester: pops history state cleanly when closed via UI
  const handleCloseRequest = useCallback(() => {
    if (hasPushedHistoryRef.current && !isClosedByPopstateRef.current) {
      isClosedByPopstateRef.current = true;
      if (window.history.state?.[MODAL_HISTORY_KEY]) {
        window.history.back();
      }
    }
    onCloseRef.current?.();
  }, []);

  // 1. History & Back Button Hook (Mount only: avoids closing modal on photo navigation)
  useEffect(() => {
    if (!hasPushedHistoryRef.current) {
      window.history.pushState({ [MODAL_HISTORY_KEY]: true }, '', window.location.href);
      hasPushedHistoryRef.current = true;
    }

    const handlePopState = () => {
      isClosedByPopstateRef.current = true;
      onCloseRef.current?.();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      if (hasPushedHistoryRef.current && !isClosedByPopstateRef.current) {
        isClosedByPopstateRef.current = true;
        if (window.history.state?.[MODAL_HISTORY_KEY]) {
          window.history.back();
        }
      }
    };
  }, []);

  // 2. Body scroll lock and exact scroll position restoration (Mount only)
  useEffect(() => {
    const savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
      try {
        window.scrollTo({
          top: savedScrollY,
          left: 0,
          behavior: 'instant'
        });
      } catch (_) {
        window.scrollTo(0, savedScrollY);
      }
    };
  }, []);

  // 3. Keyboard Navigation (Arrow keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseRequest();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleCloseRequest]);

  // Touch Swipe Gestures for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

    // Horizontal swipe: threshold 40px, predominantly horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left -> Next Photo
        handleNext();
      } else {
        // Swiped Right -> Previous Photo
        handlePrev();
      }
    }
  };

  if (!currentItem) return null;

  const rawImage = currentItem.url || currentItem.thumbnail || currentItem.image || '';
  const fullImageUrl = resolveImageUrl(rawImage, DEFAULT_SALON_PLACEHOLDER);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseRequest();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title || 'Photo Lightbox'}
    >
      {/* Top Bar Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-30 pointer-events-auto">
        <div className="flex items-center space-x-2.5">
          <span className="px-3 py-1 rounded-full bg-stone-900/90 border border-stone-700/80 text-[11px] font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-rose-400" />
            {currentItem.category || 'Portfolio'}
          </span>
          <span className="text-xs text-stone-300 font-mono bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-800">
            {currentIndex + 1} / {mediaList.length}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCloseRequest();
          }}
          aria-label="Close lightbox"
          className="p-2 sm:p-2.5 rounded-full bg-stone-900/90 hover:bg-rose-900/80 text-white transition-all cursor-pointer border border-stone-700/80 hover:border-rose-600/80 hover:scale-105 shadow-md active:scale-95"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev Navigation Arrow */}
      {mediaList.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous photo"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700/80 transition-all cursor-pointer z-30 shadow-xl hover:scale-110 active:scale-95"
          title="Previous (Left Arrow or Swipe Right)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Next Navigation Arrow */}
      {mediaList.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next photo"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700/80 transition-all cursor-pointer z-30 shadow-xl hover:scale-110 active:scale-95"
          title="Next (Right Arrow or Swipe Left)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Center Image Cinema Box */}
      <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-3.5 relative z-10 pointer-events-auto">
        <div className="relative max-h-[70vh] max-w-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-stone-900/50 rounded-2xl min-h-[280px]">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
              <span className="text-xs font-medium tracking-wide">Loading photograph...</span>
            </div>
          )}
          <img
            src={fullImageUrl}
            alt={currentItem.title || 'Enrich Salon Portfolio'}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              setIsLoading(false);
              handleImageError(e, DEFAULT_SALON_PLACEHOLDER);
            }}
            className={'max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-stone-800 transition-opacity duration-300 ' + (isLoading ? 'opacity-0' : 'opacity-100')}
          />
        </div>

        {/* Caption & Metadata */}
        <div className="text-center space-y-1 max-w-2xl px-4">
          <h3 className="text-base sm:text-xl font-serif font-bold text-white tracking-wide">
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 font-light leading-relaxed">
              {currentItem.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
