import { useEffect, useState, useCallback } from 'react';
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

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate?.(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < mediaList.length - 1) onNavigate?.(currentIndex + 1);
    },
    [currentIndex, mediaList.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (!currentItem) return null;

  const rawImage = currentItem.url || currentItem.thumbnail || currentItem.image || '';
  const fullImageUrl = resolveImageUrl(rawImage, DEFAULT_SALON_PLACEHOLDER);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
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
          onClick={onClose}
          aria-label="Close lightbox"
          className="p-2 sm:p-2.5 rounded-full bg-stone-900/90 hover:bg-rose-900/80 text-white transition-all cursor-pointer border border-stone-700/80 hover:border-rose-600/80 hover:scale-105 shadow-md active:scale-95"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev Navigation Arrow */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate?.(currentIndex - 1)}
          aria-label="Previous photo"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700/80 transition-all cursor-pointer z-30 shadow-xl hover:scale-110 active:scale-95"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Next Navigation Arrow */}
      {currentIndex < mediaList.length - 1 && (
        <button
          onClick={() => onNavigate?.(currentIndex + 1)}
          aria-label="Next photo"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-stone-900/85 hover:bg-stone-800 text-white border border-stone-700/80 transition-all cursor-pointer z-30 shadow-xl hover:scale-110 active:scale-95"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Center Image Cinema Box */}
      <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-3.5 relative z-10">
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
