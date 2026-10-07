import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < mediaList.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, mediaList.length, onClose, onNavigate]);

  if (!currentItem) return null;

  const rawImage = currentItem.url || currentItem.thumbnail || currentItem.image || '';
  const fullImageUrl = resolveImageUrl(rawImage, DEFAULT_SALON_PLACEHOLDER);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      
      {/* Top Bar Actions */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-md bg-stone-900/90 border border-stone-700 text-xs font-semibold text-stone-200 uppercase tracking-wider">
            {currentItem.category || 'Portfolio'}
          </span>
          <span className="text-xs text-stone-400 font-mono">
            {currentIndex + 1} of {mediaList.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-white transition-colors cursor-pointer border border-stone-700"
          title="Close Lightbox (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev / Next Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-700 transition-all cursor-pointer z-20 shadow-lg"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < mediaList.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-700 transition-all cursor-pointer z-20 shadow-lg"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Image Container */}
      <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-4 relative z-10">
        <div className="relative max-h-[72vh] max-w-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-stone-900/40 rounded-xl min-h-[300px]">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin mb-2" />
              <span className="text-xs font-medium">Loading high resolution image...</span>
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
            className={`max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-stone-800 transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* Caption & Metadata */}
        <div className="text-center space-y-1 max-w-2xl px-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p className="text-xs sm:text-sm text-stone-300 line-clamp-2">
              {currentItem.description}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
