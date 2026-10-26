import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Clock,
  Sparkles,
  ChevronDown,
  Sparkle,
  Film,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

// Predefined video categories for filtering
export const VIDEO_CATEGORIES = [
  'All',
  'Salon Tour',
  'Hair Transformation',
  'Bridal',
  'Makeup',
  'Skin Care',
  'Behind the Scenes',
  'Customer Experience'
];

/**
 * 4K Fallback video reels for studio showcase
 */
export const DEFAULT_FALLBACK_REELS = [
  {
    _id: 'fallback_reel_1',
    title: 'Couture Bridal Hair & Veil Placement',
    category: 'Bridal Artistry',
    type: 'video',
    isFeatured: true,
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226953/enrich/direct_uploads/qkdiswgerwtf7heyyamp.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226953/enrich/direct_uploads/qkdiswgerwtf7heyyamp.mp4',
    duration: 45,
    description: 'Behind the scenes master styling for our royal bride featuring intricate crown braiding.'
  },
  {
    _id: 'fallback_reel_2',
    title: 'New Vibes, New Glow Studio Tour',
    category: 'Salon Tour',
    type: 'video',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226758/enrich/direct_uploads/qafpuiy3hlluqdftavcv.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226758/enrich/direct_uploads/qafpuiy3hlluqdftavcv.mp4',
    duration: 36,
    description: 'Step inside the newly renovated Enrich Beauty Salon at Sharda Heights, Sikar.'
  },
  {
    _id: 'fallback_reel_3',
    title: 'Artisan Chrome Ombre Nail Process',
    category: 'Nail Atelier',
    type: 'video',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
    duration: 75,
    description: 'Watch master nail technician craft mirror-finish French ombre nails in 4K.'
  },
  {
    _id: 'fallback_reel_4',
    title: 'Client Experience & Joyful Glow',
    category: 'Customer Experience',
    type: 'video',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226785/enrich/direct_uploads/vw13ercmaiu47gvomdxb.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226785/enrich/direct_uploads/vw13ercmaiu47gvomdxb.mp4',
    duration: 20,
    description: 'Real smiles, client love, and glowing transformation feedback at Enrich.'
  }
];

/**
 * Format duration in seconds to MM:SS or Xs
 */
export function formatVideoDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  if (seconds < 60) return seconds + 's';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

/**
 * 100% Full-Width Cinematic Featured Hero Card (Mobile-Optimized Overlay Layout)
 * Video reel is ON BY DEFAULT with sound ON by default.
 */
export function FeaturedHeroCard({ video, onSelectVideo }) {
  const [isPlaying, setIsPlaying] = useState(true); // REEL ON BY DEFAULT
  const [isMuted, setIsMuted] = useState(false); // SOUND ON BY DEFAULT
  const videoPreviewRef = useRef(null);
  const hasVideoUrl = Boolean(video?.url || video?.videoUrl);
  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const isImageThumb = video?.thumbnail && !video.thumbnail.includes('.mp4') && !video.thumbnail.includes('.webm') && video.thumbnail !== video?.url;

  const toggleSound = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoPreviewRef.current.play().catch(() => {});
      }
    }
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!videoPreviewRef.current) return;
    if (isPlaying) {
      videoPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      videoPreviewRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Autoplay Reel ON BY DEFAULT on mount & keep sound on
  useEffect(() => {
    const el = videoPreviewRef.current;
    if (!el || !hasVideoUrl) return;

    el.muted = isMuted;
    if (isPlaying) {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy blocks unmuted autoplay prior to user interaction:
          // Play muted immediately so video is running ON BY DEFAULT
          if (el) {
            el.muted = true;
            el.play().catch(() => {});
          }
          // And automatically unmute once user taps, clicks, or scrolls anywhere
          const unmuteOnInteraction = () => {
            if (el && !isMuted) {
              el.muted = false;
            }
            window.removeEventListener('click', unmuteOnInteraction);
            window.removeEventListener('touchstart', unmuteOnInteraction);
            window.removeEventListener('scroll', unmuteOnInteraction);
          };
          window.addEventListener('click', unmuteOnInteraction, { once: true });
          window.addEventListener('touchstart', unmuteOnInteraction, { once: true });
          window.addEventListener('scroll', unmuteOnInteraction, { once: true });
        });
      }
    } else {
      el.pause();
    }
  }, [hasVideoUrl, isPlaying, isMuted]);

  if (!video) return null;

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl group cursor-pointer transition-all duration-300 hover:border-rose-700/60 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex flex-col justify-between active:scale-[0.99]"
      onClick={() => onSelectVideo(video)}
      tabIndex={0}
      role="button"
      aria-label={'Watch cinematic experience: ' + (video.title || 'Studio Video')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectVideo(video);
        }
      }}
    >
      {/* 100% FULL-WIDTH BACKGROUND MEDIA */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
        {/* High-Res Static Poster Thumbnail (Loaded under video) */}
        {isImageThumb ? (
          <img
            src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
            alt={video.title || 'Featured Salon Video'}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-30 scale-100"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
        ) : null}

        {/* Video Reel: ON BY DEFAULT (AutoPlay & Loop) */}
        {hasVideoUrl ? (
          <video
            ref={videoPreviewRef}
            src={videoSrc}
            autoPlay
            playsInline
            loop
            muted={isMuted}
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-95 transition-opacity duration-500"
          />
        ) : null}

        {/* Multi-tier Cinematic Dark Gradients for maximum overlay text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/30 to-stone-950/80 pointer-events-none" />
      </div>

      {/* TOP OVERLAY BAR: Badges & Controls */}
      <div className="relative p-4 sm:p-6 lg:p-8 flex items-center justify-between z-10 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-600/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Studio Spotlight</span>
          </span>

          {video.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-stone-900/80 text-stone-200 border border-stone-700/60 text-[10px] sm:text-xs font-medium backdrop-blur-md">
              {video.category}
            </span>
          )}

          {/* Reel Playing Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[10px] font-semibold backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Reel</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {video.duration ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 text-stone-200 text-[10px] sm:text-xs font-mono backdrop-blur-md border border-stone-700/50">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>{formatVideoDuration(video.duration)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 text-stone-200 text-[10px] sm:text-xs font-mono backdrop-blur-md border border-stone-700/50">
              <span>4K ULTRA HD</span>
            </span>
          )}

          {/* Audio / Music Toggle Button (Default ON) */}
          {hasVideoUrl && (
            <button
              type="button"
              onClick={toggleSound}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-sm cursor-pointer pointer-events-auto ${
                !isMuted
                  ? 'bg-rose-700/90 hover:bg-rose-600 text-white border-rose-400/80 shadow-rose-900/40 ring-1 ring-rose-400/60'
                  : 'bg-black/75 hover:bg-stone-900 text-stone-300 border-stone-700/80'
              }`}
              title={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
              aria-label={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wide">Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-300" />
                  <span className="text-[10px] sm:text-[11px] text-stone-300">Muted</span>
                </>
              )}
            </button>
          )}

          {/* Quick Play/Pause Control */}
          {hasVideoUrl && (
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 hover:bg-stone-900 border border-stone-700/80 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-sm cursor-pointer pointer-events-auto"
              title={isPlaying ? 'Pause Reel' : 'Play Reel'}
              aria-label={isPlaying ? 'Pause Reel' : 'Play Reel'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-white" />
              ) : (
                <Play className="w-3.5 h-3.5 text-rose-400 fill-current ml-0.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* CENTER IMMERSIVE PLAY BUTTON */}
      <div className="relative flex items-center justify-center z-10 py-6 my-auto">
        <div className="relative flex items-center justify-center pointer-events-none">
          <div className="absolute -inset-4 rounded-full bg-rose-600/30 blur-lg animate-pulse" />
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-stone-900/80 text-white border-2 border-rose-500/80 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:border-white backdrop-blur-md">
            {isPlaying ? (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1 text-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM OVERLAY INFO: Title, Description & Action Button */}
      <div className="relative p-4 sm:p-6 lg:p-8 z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-rose-400 uppercase flex items-center gap-1.5">
              <Sparkle className="w-3 h-3 fill-rose-400" />
              <span>Cinematic Experience</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight leading-snug drop-shadow-md group-hover:text-rose-100 transition-colors">
              {video.title || 'Signature Salon Experience'}
            </h3>
            {video.description && (
              <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-2 drop-shadow-sm max-w-xl">
                {video.description}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/20 transition-all duration-200 group-hover:bg-rose-700 group-hover:border-rose-600 shadow-lg">
              <span>Watch Experience</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 9:16 Vertical Reel Card (Reel ON BY DEFAULT with sound ON)
 */
export function VideoReelCard({ video, onSelectVideo }) {
  const [isPlaying, setIsPlaying] = useState(true); // REEL ON BY DEFAULT
  const [isMuted, setIsMuted] = useState(false); // SOUND ON BY DEFAULT
  const videoPreviewRef = useRef(null);
  const hasVideoUrl = Boolean(video?.url || video?.videoUrl);
  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const isImageThumb = video?.thumbnail && !video.thumbnail.includes('.mp4') && !video.thumbnail.includes('.webm') && video.thumbnail !== video?.url;

  const toggleSound = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoPreviewRef.current.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const el = videoPreviewRef.current;
    if (!el || !hasVideoUrl) return;

    el.muted = isMuted;
    if (isPlaying) {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (el) {
            el.muted = true;
            el.play().catch(() => {});
          }
          const unmuteOnInteraction = () => {
            if (el && !isMuted) {
              el.muted = false;
            }
            window.removeEventListener('click', unmuteOnInteraction);
            window.removeEventListener('touchstart', unmuteOnInteraction);
          };
          window.addEventListener('click', unmuteOnInteraction, { once: true });
          window.addEventListener('touchstart', unmuteOnInteraction, { once: true });
        });
      }
    } else {
      el.pause();
    }
  }, [hasVideoUrl, isPlaying, isMuted]);

  if (!video) return null;

  return (
    <div
      className="relative group rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-rose-600 hover:-translate-y-1 flex flex-col justify-between aspect-[9/15] sm:aspect-[9/15.5] w-[220px] sm:w-[260px] md:w-[280px] lg:w-[290px] shrink-0 snap-start active:scale-[0.98] select-none"
      onClick={() => onSelectVideo(video)}
      tabIndex={0}
      role="button"
      aria-label={'Watch reel: ' + (video.title || 'Salon reel')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectVideo(video);
        }
      }}
    >
      {/* Background Poster / Video Preview (ON BY DEFAULT) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
        {isImageThumb ? (
          <img
            src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
            alt={video.title || 'Salon Reel'}
            className="w-full h-full object-cover object-top opacity-30 scale-100"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
        ) : null}

        {hasVideoUrl ? (
          <video
            ref={videoPreviewRef}
            src={videoSrc}
            autoPlay
            playsInline
            loop
            muted={isMuted}
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-95 transition-opacity duration-300"
          />
        ) : null}

        {/* Gradient Overlay for Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20 pointer-events-none" />
      </div>

      {/* Top Meta Bar: Category Pill & Duration + Music/Audio Toggle (Default ON) */}
      <div className="relative p-3 sm:p-3.5 flex items-center justify-between z-10 gap-2 pointer-events-auto">
        <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 border border-stone-700/60 text-stone-200 text-[9px] sm:text-[10px] font-medium backdrop-blur-xs">
          {video.category || 'Reel'}
        </span>

        <div className="flex items-center gap-1.5">
          {video.duration ? (
            <span className="px-2 py-0.5 rounded-full bg-black/75 text-stone-300 text-[9px] sm:text-[10px] font-mono backdrop-blur-xs flex items-center gap-1 border border-stone-800">
              <Clock className="w-2.5 h-2.5 text-rose-400" />
              <span>{formatVideoDuration(video.duration)}</span>
            </span>
          ) : null}

          {/* Audio / Music Toggle Button */}
          {hasVideoUrl && (
            <button
              type="button"
              onClick={toggleSound}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 hover:scale-105 shadow-sm cursor-pointer ${
                !isMuted
                  ? 'bg-rose-700 text-white border border-rose-400 shadow-rose-950/40'
                  : 'bg-black/75 hover:bg-stone-900 text-stone-300 border border-stone-700/80'
              }`}
              title={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
              aria-label={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 text-stone-300" />
              ) : (
                <Volume2 className="w-3 h-3 text-white animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Centered Minimal Play Icon */}
      <div className="relative flex items-center justify-center z-10 my-auto pointer-events-none">
        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-stone-900/80 backdrop-blur-xs border border-stone-700 text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:border-rose-600">
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Content: Title, Description & Tap Cue */}
      <div className="relative p-3 sm:p-4 space-y-1 z-10 text-white pointer-events-none">
        <h4 className="font-serif font-bold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-rose-200 transition-colors">
          {video.title}
        </h4>

        {video.description && (
          <p className="text-[10px] sm:text-[11px] text-stone-300 line-clamp-2 font-light leading-relaxed">
            {video.description}
          </p>
        )}

        <div className="pt-0.5 flex items-center text-[9px] sm:text-[10px] text-rose-400 font-medium tracking-wide uppercase opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span>Tap to watch &rarr;</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ReelsCarousel: Next/Prev Navigation Buttons & Auto-Next Slider
 */
export function ReelsCarousel({
  videos = [],
  onSelectVideo = () => {},
  autoPlayInterval = 4200,
  className = ''
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);
  const touchPauseTimerRef = useRef(null);

  // Check scroll boundary
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [videos]);

  // Scroll to Next Card or Wrap to Beginning
  const handleNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const firstChild = el.firstElementChild;
    const cardWidth = firstChild ? firstChild.getBoundingClientRect().width + 16 : 280;

    if (scrollLeft + clientWidth >= scrollWidth - 25) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
    setProgress(0);
  };

  // Scroll to Previous Card or Wrap to End
  const handlePrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft } = el;
    const firstChild = el.firstElementChild;
    const cardWidth = firstChild ? firstChild.getBoundingClientRect().width + 16 : 280;

    if (scrollLeft <= 20) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
    setProgress(0);
  };

  // Auto-next timer with smooth progress update
  useEffect(() => {
    if (isPaused || videos.length <= 1) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / autoPlayInterval) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPaused, videos.length, autoPlayInterval]);

  const handleTouchStart = () => {
    setIsPaused(true);
    if (touchPauseTimerRef.current) clearTimeout(touchPauseTimerRef.current);
  };

  const handleTouchEnd = () => {
    touchPauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  if (!Array.isArray(videos) || videos.length === 0) return null;

  return (
    <div
      className={'relative group/carousel ' + className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Carousel Navigation Toolbar & Auto-Advance Progress */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2">
          {/* Animated Mini Progress Bar for Auto-Advance */}
          <div
            className="w-24 sm:w-32 h-1 bg-stone-200 rounded-full overflow-hidden"
            title="Auto-advancing story timer"
          >
            <div
              className="h-full bg-rose-700 transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs text-stone-500 font-medium">
            {isPaused ? 'Paused' : 'Playing'}
          </span>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Reel"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Reel"
            className="inline-flex items-center gap-1 pl-3 pr-2.5 py-1.5 sm:py-2 rounded-full bg-stone-900 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 gap-3.5 sm:gap-5 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {videos.map((video) => (
          <VideoReelCard
            key={video._id || video.id || video.title}
            video={video}
            onSelectVideo={onSelectVideo}
          />
        ))}
      </div>

      {/* DESKTOP SIDE HOVER FLOATING NAVIGATION ARROWS */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous Video Reel"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full bg-stone-900/90 hover:bg-rose-700 text-white border border-stone-700 shadow-xl items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-20 cursor-pointer active:scale-90 backdrop-blur-xs"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next Video Reel"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-stone-900/90 hover:bg-rose-700 text-white border border-stone-700 shadow-xl items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-20 cursor-pointer active:scale-90 backdrop-blur-xs"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * Main Video Reels Gallery Section (Full View with Filter Tabs & Featured Video)
 */
export default function VideoReelsGallery({
  videos = [],
  selectedCategory = 'All',
  onCategoryChange = () => {},
  onSelectVideo = () => {}
}) {
  // Use videos or fallback if empty
  const effectiveVideos = useMemo(() => {
    if (Array.isArray(videos) && videos.length > 0) return videos;
    return DEFAULT_FALLBACK_REELS;
  }, [videos]);

  // Filter videos based on category
  const filteredVideos = useMemo(() => {
    if (!effectiveVideos || effectiveVideos.length === 0) return [];
    if (!selectedCategory || selectedCategory === 'All') return effectiveVideos;
    return effectiveVideos.filter(
      (v) => v?.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [effectiveVideos, selectedCategory]);

  // Featured video selection: pick first item with isFeatured or lowest displayOrder
  const featuredVideo = useMemo(() => {
    if (!Array.isArray(filteredVideos) || filteredVideos.length === 0) return null;
    const featuredList = filteredVideos.filter((v) => v?.isFeatured || v?.featured);
    if (featuredList.length > 0) {
      return [...featuredList].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
    }
    return [...filteredVideos].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
  }, [filteredVideos]);

  // Secondary reels list (excluding the featured one)
  const secondaryVideos = useMemo(() => {
    if (!featuredVideo) return [];
    return filteredVideos.filter((v) => (v?._id || v?.id) !== (featuredVideo?._id || featuredVideo?.id));
  }, [filteredVideos, featuredVideo]);

  return (
    <section className="space-y-6 sm:space-y-10">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>From the Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Watch the Experience
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light max-w-xl">
            Immerse yourself in salon transformations, bridal masterclasses, and behind-the-scenes artistry.
          </p>
        </div>

        {/* Video Count Indicator */}
        <div className="flex items-center gap-1.5 text-stone-500 text-xs shrink-0">
          <Film className="w-3.5 h-3.5 text-rose-700" />
          <span className="font-semibold text-stone-900">{filteredVideos.length}</span>
          <span>video stories</span>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {VIDEO_CATEGORIES.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ' + (
                isActive
                  ? 'bg-stone-900 text-white shadow-md ring-1 ring-stone-900 scale-100'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* MAIN VIDEO SHOWCASE */}
      {filteredVideos.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {/* A. 100% FULL-WIDTH FEATURED HERO VIDEO SHOWCASE */}
          {featuredVideo && (
            <FeaturedHeroCard
              video={featuredVideo}
              onSelectVideo={onSelectVideo}
            />
          )}

          {/* B. SECONDARY REELS CAROUSEL WITH NEXT/PREV & AUTO-NEXT */}
          {secondaryVideos.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span>Reels & Highlights</span>
                  <span className="text-xs font-mono font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {secondaryVideos.length}
                  </span>
                </h3>
              </div>

              <ReelsCarousel
                videos={secondaryVideos}
                onSelectVideo={onSelectVideo}
              />
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center mx-auto">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">No Studio Reels Found</h3>
          <p className="text-xs text-stone-500">
            {'No video clips found under "' + selectedCategory + '". Try exploring "All" videos or selecting another category.'}
          </p>
          <button
            onClick={() => onCategoryChange('All')}
            className="px-5 py-2 rounded-full bg-stone-900 text-white font-semibold text-xs cursor-pointer hover:bg-stone-800 transition-colors"
          >
            Show All Videos
          </button>
        </div>
      )}
    </section>
  );
}
