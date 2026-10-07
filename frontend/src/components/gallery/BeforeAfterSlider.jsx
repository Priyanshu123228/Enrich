import { useState, useRef, useCallback } from 'react';
import { resolveImageUrl, handleImageError } from '../../utils/imageUrl';
import { MoveHorizontal } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title = 'Treatment Transformation',
  category = 'Before & After'
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 space-y-3 p-4 flex flex-col justify-between group">
      
      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative h-72 sm:h-80 w-full overflow-hidden rounded-lg select-none cursor-ew-resize bg-stone-100 touch-none"
      >
        {/* AFTER Image (Full Background) */}
        <img
          src={afterImage || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80'}
          alt="After Treatment"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-stone-900 text-white font-medium text-[11px] uppercase tracking-wider">
          After
        </div>

        {/* BEFORE Image (Clipped with polygon) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80'}
            alt="Before Treatment"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
            loading="lazy"
          />
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-stone-900 text-white font-medium text-[11px] uppercase tracking-wider">
            Before
          </div>
        </div>

        {/* Drag Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-white text-stone-900 flex items-center justify-center shadow-lg border border-stone-300">
            <MoveHorizontal className="w-4 h-4 text-stone-700" />
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="px-2 pt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
            {category}
          </span>
          <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{title}</h4>
        </div>
        <div className="text-[11px] text-stone-400">
          Drag slider
        </div>
      </div>

    </div>
  );
}
