import { useState, useRef, useCallback } from 'react';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';
import { MoveHorizontal, Sparkles } from 'lucide-react';

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

  const beforeSrc = resolveImageUrl(beforeImage, DEFAULT_SALON_PLACEHOLDER);
  const afterSrc = resolveImageUrl(afterImage, DEFAULT_SALON_PLACEHOLDER);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 p-3 sm:p-4 flex flex-col justify-between space-y-3 group">
      {/* Interactive Transformation Viewport */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl select-none cursor-ew-resize bg-stone-900 touch-none"
        role="slider"
        aria-label={'Before and after slider for ' + title}
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* AFTER Image (Full Background) */}
        <img
          src={afterSrc}
          alt={'After result for ' + title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
          onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-stone-950/85 backdrop-blur-xs text-rose-300 font-semibold text-[10px] uppercase tracking-wider border border-stone-800">
          After
        </div>

        {/* BEFORE Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: sliderPosition + '%' }}
        >
          <img
            src={beforeSrc}
            alt={'Before result for ' + title}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? containerRef.current.clientWidth + 'px' : '100%' }}
            loading="lazy"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-950/85 backdrop-blur-xs text-stone-200 font-semibold text-[10px] uppercase tracking-wider border border-stone-800">
            Before
          </div>
        </div>

        {/* Drag Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none z-10"
          style={{ left: sliderPosition + '%' }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-950 text-white flex items-center justify-center shadow-2xl border-2 border-white">
            <MoveHorizontal className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="px-1 pt-1 flex items-center justify-between">
        <div className="space-y-0.5 max-w-[80%]">
          <div className="flex items-center gap-1.5 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>{category}</span>
          </div>
          <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base line-clamp-1">
            {title}
          </h4>
        </div>
        <div className="text-[10px] text-stone-400 font-medium whitespace-nowrap">
          Slide to compare
        </div>
      </div>
    </div>
  );
}
