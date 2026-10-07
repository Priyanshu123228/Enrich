import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Clock,
  Sparkles,
  ChevronDown,
  Sparkle,
  Film
} from 'lucide-react';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

// Predefined video categories for filtering
const VIDEO_CATEGORIES = [
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
 * Format duration in seconds to MM:SS or Xs
 */
function formatVideoDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  if (seconds < 60) return seconds + 's';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

/**
 * Featured Hero Video Card (Cinematic Showcase)
 */
function FeaturedHeroCard({ video, onSelectVideo }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoPreviewRef = useRef(null);
  const hasVideoUrl = Boolean(video?.url || video?.videoUrl);
  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const isImageThumb = video?.thumbnail && !video.thumbnail.includes('.mp4') && !video.thumbnail.includes('.webm') && video.thumbnail !== video?.url;

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
      className="relative w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-xl group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-rose-800/60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectVideo(video)}
      tabIndex={0}
      role="button"
      aria-label={'Watch featured video: ' + (video.title || 'Studio Video')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectVideo(video);
        }
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px] sm:min-h-[400px] lg:min-h-[440px]">
        {/* Left/Main Cinematic Media Viewport */}
        <div className="relative lg:col-span-8 overflow-hidden bg-stone-900 aspect-video lg:aspect-auto min-h-[240px] sm:min-h-[320px]">
          {/* Static High-Res Poster Thumbnail */}
          {isImageThumb ? (
            <img
              src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
              alt={video.title || 'Featured Salon Video'}
              className={'absolute inset-0 w-full h-full object-cover transition-transform duration-700 ' + (isHovered ? 'scale-105 opacity-20' : 'scale-100 opacity-90')}
              loading="lazy"
              onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
            />
          ) : null}

          {/* Smooth Desktop Muted Preview Video */}
          {hasVideoUrl && (
            <video
              ref={videoPreviewRef}
              src={videoSrc}
              muted
              playsInline
              loop
              preload="metadata"
              className={'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ' + (isHovered || !isImageThumb ? 'opacity-95' : 'opacity-0')}
            />
          )}

          {/* Luxury Ambient Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-stone-950/20 lg:to-stone-950/90 pointer-events-none" />

          {/* Top Hero Badges */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
            <span className="px-3 py-1 rounded-full bg-rose-700 text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              Studio Spotlight
            </span>
            <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs border border-stone-700 text-stone-200 text-[11px] font-semibold tracking-wide uppercase">
              {video.category || 'Featured'}
            </span>
          </div>

          {/* Duration Badge */}
          {video.duration > 0 && (
            <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-mono flex items-center border border-stone-800">
              <Clock className="w-3 h-3 mr-1.5 text-rose-400" />
              {formatVideoDuration(video.duration)}
            </div>
          )}

          {/* Center Pulsing Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-white/95 text-stone-950 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:text-white border-2 border-white/40">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
            </div>
          </div>
        </div>

        {/* Right Editorial Info Column */}
        <div className="relative lg:col-span-4 p-5 sm:p-7 flex flex-col justify-between bg-stone-950/95 lg:border-l border-stone-800/80">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-widest">
              <Sparkle className="w-3.5 h-3.5" />
              <span>Cinematic Experience</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white leading-tight group-hover:text-rose-200 transition-colors">
              {video.title}
            </h3>

            {video.description && (
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4 font-light">
                {video.description}
              </p>
            )}
          </div>

          <div className="pt-5 border-t border-stone-800/60 mt-4 sm:mt-6 flex items-center justify-between">
            <div className="flex items-center text-xs text-stone-400">
              <Film className="w-4 h-4 mr-1.5 text-rose-500" />
              <span>Studio Portfolio</span>
            </div>

            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-rose-700 group-hover:bg-rose-600 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md">
              <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
              Watch Experience
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 9:16 Vertical Reel Card
 */
function VideoReelCard({ video, onSelectVideo }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const hasVideoUrl = Boolean(video?.url || video?.videoUrl);
  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const isImageThumb = video?.thumbnail && !video.thumbnail.includes('.mp4') && !video.thumbnail.includes('.webm') && video.thumbnail !== video?.url;

  // Auto-pause when card scrolls out of view
  useEffect(() => {
    if (!cardRef.current || !hasVideoUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasVideoUrl]);

  // Desktop hover preview (strictly muted)
  useEffect(() => {
    if (!videoRef.current || !hasVideoUrl) return;

    if (isHovered) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      videoRef.current.pause();
    }
  }, [isHovered, hasVideoUrl]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectVideo(video)}
      tabIndex={0}
      role="button"
      aria-label={'Play ' + (video.title || 'video reel')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectVideo(video);
        }
      }}
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800/80 shadow-md hover:shadow-xl hover:border-rose-700/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Background Poster Thumbnail */}
      {isImageThumb ? (
        <img
          src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
          alt={video.title || 'Studio Reel'}
          className={'absolute inset-0 w-full h-full object-cover transition-transform duration-500 ' + (isHovered ? 'scale-105 opacity-20' : 'scale-100 opacity-90')}
          loading="lazy"
          onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
        />
      ) : null}

      {/* Muted Hover Preview Video */}
      {hasVideoUrl && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          loop
          preload="metadata"
          className={'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ' + (isHovered || !isImageThumb ? 'opacity-95' : 'opacity-0')}
        />
      )}

      {/* Dark Gradient Overlay for Maximum Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20 pointer-events-none" />

      {/* Top Header Information: Category Badge & Duration */}
      <div className="relative p-3 sm:p-4 flex items-start justify-between z-10">
        <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs border border-stone-700/80 text-rose-300 text-[10px] font-semibold uppercase tracking-wider">
          {video.category || 'Reel'}
        </span>

        {video.duration > 0 && (
          <div className="px-2 py-0.5 rounded-full bg-stone-950/80 text-stone-200 text-[10px] font-mono flex items-center border border-stone-800">
            <Clock className="w-2.5 h-2.5 mr-1 text-rose-400" />
            {formatVideoDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Center Subtle Animated Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900/80 backdrop-blur-xs border border-stone-700 text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:border-rose-600">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Content: Title, Description & Tap Cue */}
      <div className="relative p-3.5 sm:p-4 space-y-1.5 z-10 text-white">
        <h4 className="font-serif font-bold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-rose-200 transition-colors">
          {video.title}
        </h4>

        {video.description && (
          <p className="text-[11px] sm:text-xs text-stone-300 line-clamp-2 font-light leading-relaxed">
            {video.description}
          </p>
        )}

        <div className="pt-1 flex items-center text-[10px] text-rose-400 font-medium tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span>Tap to watch reel &rarr;</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Video Reels Gallery Section
 */
export default function VideoReelsGallery({
  videos = [],
  selectedCategory = 'All',
  onCategoryChange = () => {},
  onSelectVideo = () => {}
}) {
  const [displayLimit, setDisplayLimit] = useState(7); // 1 featured + 6 reels initially

  // Filter videos based on category
  const filteredVideos = useMemo(() => {
    if (!Array.isArray(videos) || videos.length === 0) return [];
    if (!selectedCategory || selectedCategory === 'All') return videos;
    return videos.filter(
      (v) => v?.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [videos, selectedCategory]);

  // Featured video selection: pick first item with isFeatured or default to 1st video
  const featuredVideo = useMemo(() => {
    if (filteredVideos.length === 0) return null;
    return filteredVideos.find((v) => v?.isFeatured || v?.featured) || filteredVideos[0];
  }, [filteredVideos]);

  // Secondary reels list (excluding the featured one)
  const secondaryVideos = useMemo(() => {
    if (!featuredVideo) return [];
    return filteredVideos.filter((v) => (v?._id || v?.id) !== (featuredVideo?._id || featuredVideo?.id));
  }, [filteredVideos, featuredVideo]);

  const visibleSecondary = secondaryVideos.slice(0, displayLimit - 1);
  const hasMore = secondaryVideos.length > visibleSecondary.length;

  return (
    <section className="space-y-8 sm:space-y-10">
      {/* 1. SECTION HEADER: "From the Studio" / "Watch the Experience" */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>From the Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Watch the Experience
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light max-w-xl">
            Immerse yourself in salon transformations, bridal masterclasses, and behind-the-scenes artistry captured live.
          </p>
        </div>

        {/* Video Count Indicator */}
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <Film className="w-4 h-4 text-rose-700" />
          <span className="font-semibold text-stone-900">{filteredVideos.length}</span>
          <span>video stories available</span>
        </div>
      </div>

      {/* 2. CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {VIDEO_CATEGORIES.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat);
                setDisplayLimit(7);
              }}
              className={'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ' + (
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

      {/* 3. MAIN VIDEO LAYOUT */}
      {filteredVideos.length > 0 ? (
        <div className="space-y-8">
          {/* A. FEATURED HERO VIDEO SHOWCASE */}
          {featuredVideo && (
            <FeaturedHeroCard
              video={featuredVideo}
              onSelectVideo={onSelectVideo}
            />
          )}

          {/* B. SECONDARY REELS MASONRY/GRID (9:16 Aspect Ratio) */}
          {visibleSecondary.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span>Reels & Highlights</span>
                  <span className="text-xs font-mono font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {secondaryVideos.length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {visibleSecondary.map((video) => (
                  <VideoReelCard
                    key={video._id || video.id || video.title}
                    video={video}
                    onSelectVideo={onSelectVideo}
                  />
                ))}
              </div>
            </div>
          )}

          {/* C. LOAD MORE PAGINATION MECHANISM */}
          {hasMore && (
            <div className="pt-6 text-center">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 6)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Load More Reels (+{secondaryVideos.length - visibleSecondary.length})</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center mx-auto">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">No Studio Reels Found</h3>
          <p className="text-xs text-stone-500">
            {'No video clips found under "' + selectedCategory + '". Try exploring "All" videos or selecting another category.'}
          </p>
          <button
            onClick={() => onCategoryChange('All')}
            className="px-5 py-2.5 rounded-full bg-stone-900 text-white font-semibold text-xs cursor-pointer hover:bg-stone-800 transition-colors"
          >
            Show All Videos
          </button>
        </div>
      )}
    </section>
  );
}
