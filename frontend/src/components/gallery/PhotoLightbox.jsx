import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoLightbox({
  mediaList = [],
  currentIndex = 0,
  onClose,
  onNavigate
}) {
  const currentItem = mediaList[currentIndex];

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

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      
      {/* Top Bar Actions */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 uppercase tracking-wider">
            {currentItem.category}
          </span>
          <span className="text-xs text-stone-300 font-mono">
            {currentIndex + 1} of {mediaList.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white transition-colors cursor-pointer border border-stone-700"
          title="Close Lightbox (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev / Next Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-white border border-stone-700 transition-all cursor-pointer z-10"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < mediaList.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-white border border-stone-700 transition-all cursor-pointer z-10"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Image Container */}
      <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center space-y-4">
        <img
          src={currentItem.url}
          alt={currentItem.title}
          className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-xl ring-1 ring-stone-800"
        />

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
