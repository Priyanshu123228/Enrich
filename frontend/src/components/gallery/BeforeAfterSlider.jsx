import { useState, useRef, useCallback, useEffect } from 'react';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';
import { MoveHorizontal, Sparkles } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title = 'Treatment Transformation',
  category = 'Before & After',
  aspectRatio = 'aspect-[3/4]',
  className = ''
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Sync container width for pixel-perfect clipped image alignment
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => updateWidth());
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

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
    <div className={`group relative bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full ${className}`}>
      {/* Interactive Transformation Viewport */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          setIsDragging(true);
          if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
        }}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className={`relative ${aspectRatio} w-full overflow-hidden select-none cursor-ew-resize bg-stone-950 touch-none`}
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
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
          loading="lazy"
          onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
        />
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-stone-950/85 backdrop-blur-md text-rose-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider border border-rose-800/60 shadow-sm pointer-events-none z-10">
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
            className="absolute inset-0 h-full object-cover object-top max-w-none"
            style={{ width: containerWidth ? `${containerWidth}px` : (containerRef.current ? `${containerRef.current.clientWidth}px` : '100%') }}
            loading="lazy"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-950/85 backdrop-blur-md text-stone-200 font-bold text-[10px] sm:text-xs uppercase tracking-wider border border-stone-700/60 shadow-sm pointer-events-none z-10">
            Before
          </div>
        </div>

        {/* Drag Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none z-10"
          style={{ left: sliderPosition + '%' }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-stone-950 text-white flex items-center justify-center shadow-2xl border-2 border-white ring-2 ring-rose-500/40">
            <MoveHorizontal className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-5 bg-white border-t border-stone-100/90 space-y-1 min-h-[76px] flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-rose-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{category}</span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap">
            Slide to compare ↔
          </span>
        </div>
        <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-rose-700 transition-colors line-clamp-1">
          {title}
        </h3>
      </div>
    </div>
  );
}
