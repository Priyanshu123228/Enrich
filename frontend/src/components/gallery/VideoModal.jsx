import { useEffect, useRef } from 'react';
import { X, Clock } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!video) return null;

  const videoSrc = resolveImageUrl(video.url);
  const posterSrc = resolveImageUrl(video.thumbnail);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      
      {/* Top Bar Actions */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-md bg-stone-900/90 border border-stone-700 text-xs font-semibold text-stone-200 uppercase tracking-wider">
            {video.category || 'Video Tour'}
          </span>
          {video.duration > 0 && (
            <span className="text-xs text-stone-300 flex items-center font-mono">
              <Clock className="w-3.5 h-3.5 mr-1 text-rose-400" />
              {video.duration}s
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-white transition-colors cursor-pointer border border-stone-700"
          title="Close Video (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Video Box */}
      <div className="max-w-4xl w-full flex flex-col items-center justify-center space-y-4 relative z-10">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-stone-800">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Video Title & Details */}
        <div className="text-left w-full px-2 space-y-1">
          <h3 className="text-xl font-serif font-bold text-white">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
