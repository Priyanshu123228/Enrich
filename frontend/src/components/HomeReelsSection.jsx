import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Sparkles, Film, ArrowRight, Sparkle, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';

/**
 * Format video duration in seconds to MM:SS or Xs
 */
function formatVideoDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Default fallback reels if backend has not loaded or is offline
 */
const DEFAULT_FALLBACK_REELS = [
  {
    _id: 'fallback_reel_1',
    title: 'Couture Bridal Hair & Veil Placement',
    category: 'Bridal Artistry',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226953/enrich/direct_uploads/qkdiswgerwtf7heyyamp.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226953/enrich/direct_uploads/qkdiswgerwtf7heyyamp.mp4',
    duration: 45,
    description: 'Behind the scenes master styling for our royal bride featuring intricate crown braiding.'
  },
  {
    _id: 'fallback_reel_2',
    title: 'New Vibes, New Glow Studio Tour',
    category: 'Salon Tour',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226758/enrich/direct_uploads/qafpuiy3hlluqdftavcv.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226758/enrich/direct_uploads/qafpuiy3hlluqdftavcv.mp4',
    duration: 36,
    description: 'Step inside the newly renovated Enrich Beauty Salon at Sharda Heights, Sikar.'
  },
  {
    _id: 'fallback_reel_3',
    title: 'Artisan Chrome Ombre Nail Process',
    category: 'Nail Atelier',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
    duration: 75,
    description: 'Watch master nail technician craft mirror-finish French ombre nails in 4K.'
  },
  {
    _id: 'fallback_reel_4',
    title: 'Client Experience & Joyful Glow',
    category: 'Transformations',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226785/enrich/direct_uploads/vw13ercmaiu47gvomdxb.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226785/enrich/direct_uploads/vw13ercmaiu47gvomdxb.mp4',
    duration: 20,
    description: 'Real smiles, client love, and glowing transformation feedback at Enrich.'
  }
];

/**
 * Individual Smartphone Reel Card
 */
function HomeReelCard({ video, onSelectVideo }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoPreviewRef = useRef(null);

  const handleToggleMute = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!videoPreviewRef.current) return;
    const nextMuted = !isMuted;
    videoPreviewRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoPreviewRef.current.play().catch(() => {});
    }
  };

  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const hasVideoUrl = Boolean(video?.url || video?.videoUrl);
  const isImageThumb =
    video?.thumbnail &&
    !video.thumbnail.includes('.mp4') &&
    !video.thumbnail.includes('.webm') &&
    video.thumbnail !== video?.url;

  useEffect(() => {
    if (!videoPreviewRef.current || !hasVideoUrl) return;
    if (isHovered) {
      videoPreviewRef.current.currentTime = 0;
      const playPromise = videoPreviewRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      videoPreviewRef.current.pause();
    }
  }, [isHovered, hasVideoUrl]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Watch reel: ${video.title || 'Salon transformation'}`}
      onClick={() => onSelectVideo(video)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectVideo(video);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-3xl overflow-hidden bg-stone-950 border border-stone-800/80 hover:border-rose-500 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-rose-950/25 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between aspect-[9/16] cursor-pointer select-none active:scale-[0.98] ring-1 ring-black/5"
    >
      {/* Smartphone Dynamic Island / Speaker Pill */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/25 z-20 pointer-events-none transition-opacity group-hover:bg-white/40" />

      {/* Background Media Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
        {/* High-Res Static Poster Thumbnail */}
        {isImageThumb ? (
          <img
            src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
            alt={video.title || 'Salon Reel Poster'}
            loading="lazy"
            className={`w-full h-full object-cover object-top transition-transform duration-700 ${
              isHovered ? 'scale-108 opacity-40' : 'scale-100 opacity-95'
            }`}
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
        ) : null}

        {/* Smooth Muted Video Preview on Desktop Hover */}
        {hasVideoUrl ? (
          <video
            ref={videoPreviewRef}
            src={videoSrc}
            muted={isMuted}
            playsInline
            loop
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
              isHovered || !isImageThumb ? 'opacity-95' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Cinematic Vignettes: Keep video center clear while enhancing text legibility */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-stone-950/80 via-stone-950/30 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-stone-950 via-stone-950/75 to-transparent pointer-events-none z-10" />
      </div>

      {/* TOP OVERLAY BAR: Category Badge & Duration */}
      <div className="relative p-3.5 sm:p-4 pt-5 flex items-center justify-between gap-2 z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-stone-200 border border-white/15 text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-xs">
          <Film className="w-3 h-3 text-rose-400" />
          <span className="truncate max-w-[100px]">{video.category || 'Transformation'}</span>
        </span>

        <div className="flex items-center gap-1.5">
          {video.duration ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-stone-200 text-[10px] sm:text-xs font-mono backdrop-blur-md border border-white/15 shadow-xs">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
              <span>{formatVideoDuration(video.duration)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 text-[10px] font-mono border border-rose-800/60">
              4K
            </span>
          )}

          {hasVideoUrl && (
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 rounded-full bg-black/65 hover:bg-black/90 text-stone-200 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-xs cursor-pointer hover:scale-110 active:scale-95"
              title={isMuted ? 'Unmute reel sound' : 'Mute reel sound'}
              aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-300" />
              ) : (
                <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* CENTER GLOWING PLAY BUTTON */}
      <div className="relative flex items-center justify-center z-10 my-auto py-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-3.5 rounded-full bg-rose-600/35 blur-lg group-hover:scale-130 transition-transform duration-300" />
          <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-rose-600/90 text-white border-2 border-white/90 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-500 backdrop-blur-md">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 text-white" />
          </div>
        </div>
      </div>

      {/* BOTTOM OVERLAY INFO: Title & Action Indicator */}
      <div className="relative p-3.5 sm:p-4 z-10 space-y-1.5">
        <h4 className="text-xs sm:text-sm font-serif font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md group-hover:text-rose-200 transition-colors">
          {video.title || 'Studio Transformation'}
        </h4>

        {video.description && (
          <p className="text-[11px] text-stone-300 font-light line-clamp-1 leading-snug">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 text-[11px] text-rose-300 font-medium">
          <span className="inline-flex items-center gap-1 group-hover:text-white transition-colors">
            <span>Watch Full Reel</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
          <span className="text-[10px] text-stone-400 font-mono tracking-wider">
            HD STORY
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * HomeReelsSection
 * 
 * Luminous Atelier Homepage Section with Smartphone Video Reels.
 * Features tight, comfortable section spacing and interactive "More Reels" toggle.
 */
export default function HomeReelsSection({
  videos = [],
  onSelectVideo = () => {}
}) {
  const [showMore, setShowMore] = useState(false);

  // Normalize full list of reels
  const allAvailableReels = useMemo(() => {
    const list = Array.isArray(videos) && videos.length > 0 ? videos : [];
    if (list.length >= 4) {
      return list;
    }
    // Pad with fallback if fewer than 4
    const existingIds = new Set(list.map((v) => v._id || v.id));
    const needed = 4 - list.length;
    const fillers = DEFAULT_FALLBACK_REELS.filter((f) => !existingIds.has(f._id)).slice(0, needed);
    return [...list, ...fillers];
  }, [videos]);

  // Display top 4 by default, or all when showMore is true
  const displayReels = useMemo(() => {
    if (showMore) {
      return allAvailableReels;
    }
    return allAvailableReels.slice(0, 4);
  }, [allAvailableReels, showMore]);

  return (
    <section
      aria-label="Salon Video Reels and Transformations"
      className="relative w-full bg-gradient-to-b from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2] text-stone-900 py-12 sm:py-16 border-b border-stone-200/90 overflow-hidden"
    >
      {/* Soft Ambient Radial Lights (Matching Homepage Luxury Palette) */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-stone-200/90 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/90 text-rose-800 text-xs font-bold tracking-widest uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Studio Reels &bull; 4K Transformations</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
              Real Transformations,{' '}
              <span className="font-normal font-serif text-rose-900 italic">
                Filmed Live
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 font-light max-w-2xl leading-relaxed">
              Tap any reel to preview bridal masterclasses, hair transformations, and clinical skincare procedures filmed inside our Sikar salon.
            </p>
          </div>

          
        </div>

        {/* REELS GRID (4 or Expanded All Reels) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-300">
          {displayReels.map((reel) => (
            <HomeReelCard
              key={reel._id || reel.id || reel.title}
              video={reel}
              onSelectVideo={onSelectVideo}
            />
          ))}
        </div>

        {/* BOTTOM MORE REELS TOGGLE BUTTON */}
        {allAvailableReels.length > 4 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowMore((prev) => !prev)}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white hover:bg-rose-50 text-stone-800 hover:text-rose-800 border border-stone-200/90 hover:border-rose-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98 group"
            >
              <Film className="w-4 h-4 text-rose-600" />
              <span>
                {showMore
                  ? 'Show Top 4 Reels'
                  : `More Reels (+${allAvailableReels.length - 4} More Transformations)`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-transform duration-300 ${
                  showMore ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        )}

        {/* LUXURY CONSULTATION ACTION STRIP */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-lg shadow-stone-900/5 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <Sparkle className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>Expert Bridal & Beauty Care</span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
              Inspired by a look in our studio reels?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-light max-w-xl">
              Schedule a personalized consultation with our senior stylists at Sharda Heights, Sikar.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/book"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all active:scale-98"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/gallery"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
            >
              View Complete Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
