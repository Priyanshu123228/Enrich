import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Clock,
  Sparkles,
  ChevronDown,
  Sparkle,
  Film,
  ArrowRight
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
 * 100% Full-Width Cinematic Featured Hero Card (Mobile-Optimized Overlay Layout)
 */
export function FeaturedHeroCard({ video, onSelectVideo }) {
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

  if (!video) return null;

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl group cursor-pointer transition-all duration-300 hover:border-rose-700/60 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex flex-col justify-between active:scale-[0.99]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {/* High-Res Static Poster Thumbnail */}
        {isImageThumb ? (
          <img
            src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
            alt={video.title || 'Featured Salon Video'}
            className={'absolute inset-0 w-full h-full object-cover transition-transform duration-700 ' + (
              isHovered ? 'scale-105 opacity-20' : 'scale-100 opacity-90'
            )}
            loading="lazy"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
        ) : null}

        {/* Smooth Muted Hover Preview Video (Desktop) */}
        {hasVideoUrl && (
          <video
            ref={videoPreviewRef}
            src={videoSrc}
            muted
            playsInline
            loop
            preload="metadata"
            className={'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ' + (
              isHovered || !isImageThumb ? 'opacity-95' : 'opacity-0'
            )}
          />
        )}

        {/* Multi-tier Cinematic Dark Gradient Overlays for crystal clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/50 pointer-events-none" />
      </div>

      {/* TOP OVERLAY ROW: BADGES & DURATION */}
      <div className="relative p-3.5 sm:p-6 lg:p-8 flex items-start justify-between z-10 w-full gap-2">
        {/* Top-Left Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-rose-700 text-white text-[9px] sm:text-xs font-bold tracking-widest uppercase flex items-center gap-1 sm:gap-1.5 shadow-lg border border-rose-500/50 backdrop-blur-xs">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            STUDIO SPOTLIGHT
          </span>
          <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700/80 text-stone-200 text-[9px] sm:text-xs font-semibold tracking-wider uppercase shadow-md">
            {video.category || 'SALON TOUR'}
          </span>
        </div>

        {/* Top-Right Duration */}
        {video.duration > 0 && (
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono flex items-center border border-stone-700/80 shadow-md shrink-0">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-rose-400" />
            {formatVideoDuration(video.duration)}
          </div>
        )}
      </div>

      {/* CENTER OVERLAY: LARGE ELEGANT PLAY BUTTON */}
      <div className="relative my-auto flex items-center justify-center pointer-events-none z-10 py-4 sm:py-0">
        <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white/95 text-stone-950 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:text-white border-2 border-white/50 backdrop-blur-xs">
          <Play className="w-6 h-6 sm:w-9 sm:h-9 lg:w-10 lg:h-10 fill-current ml-1 sm:ml-1.5" />
        </div>
      </div>

      {/* BOTTOM OVERLAY ROW: EDITORIAL TITLE, DESCRIPTION, CREATOR & WATCH CTA */}
      <div className="relative p-3.5 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-6 z-10 w-full">
        {/* Bottom-Left Information */}
        <div className="space-y-1 sm:space-y-1.5 max-w-2xl text-white">
          <div className="flex items-center gap-1.5 text-rose-400 text-[9px] sm:text-xs font-bold uppercase tracking-widest">
            <Sparkle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>CINEMATIC EXPERIENCE</span>
          </div>

          <h3 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-white leading-snug sm:leading-tight tracking-tight group-hover:text-rose-200 transition-colors drop-shadow-md line-clamp-2">
            {video.title}
          </h3>

          {video.description && (
            <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow-xs hidden sm:block">
              {video.description}
            </p>
          )}

          <div className="pt-0.5 flex items-center gap-1.5 text-[9px] sm:text-xs text-stone-400 font-medium">
            <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
            <span>Crafted by Enrich Master Stylists • Studio Portfolio</span>
          </div>
        </div>

        {/* Bottom-Right CTA */}
        <div className="shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
          <div className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-rose-700 group-hover:bg-rose-600 text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-all shadow-xl group-hover:scale-105 active:scale-95 border border-rose-500/50 w-full sm:w-auto">
            <span>WATCH EXPERIENCE</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 9:16 Vertical Reel Card (Mobile Swipe / Responsive Grid)
 */
export function VideoReelCard({ video, onSelectVideo }) {
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
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800/80 shadow-md hover:shadow-xl hover:border-rose-700/60 transition-all duration-300 cursor-pointer flex flex-col justify-between w-[200px] sm:w-[220px] md:w-auto shrink-0 snap-start active:scale-[0.98]"
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
        <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs border border-stone-700/80 text-rose-300 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
          {video.category || 'Reel'}
        </span>

        {video.duration > 0 && (
          <div className="px-2 py-0.5 rounded-full bg-stone-950/80 text-stone-200 text-[9px] sm:text-[10px] font-mono flex items-center border border-stone-800">
            <Clock className="w-2.5 h-2.5 mr-1 text-rose-400" />
            {formatVideoDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Center Subtle Animated Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-stone-900/80 backdrop-blur-xs border border-stone-700 text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:border-rose-600">
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Content: Title, Description & Tap Cue */}
      <div className="relative p-3 sm:p-4 space-y-1 z-10 text-white">
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
 * Main Video Reels Gallery Section
 */
export default function VideoReelsGallery({
  videos = [],
  selectedCategory = 'All',
  onCategoryChange = () => {},
  onSelectVideo = () => {}
}) {
  const [displayLimit, setDisplayLimit] = useState(8);

  // Filter videos based on category
  const filteredVideos = useMemo(() => {
    if (!Array.isArray(videos) || videos.length === 0) return [];
    if (!selectedCategory || selectedCategory === 'All') return videos;
    return videos.filter(
      (v) => v?.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [videos, selectedCategory]);

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

  const visibleSecondary = secondaryVideos.slice(0, displayLimit - 1);
  const hasMore = secondaryVideos.length > visibleSecondary.length;

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
              onClick={() => {
                onCategoryChange(cat);
                setDisplayLimit(8);
              }}
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

      {/* MAIN VIDEO LAYOUT */}
      {filteredVideos.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {/* A. 100% FULL-WIDTH FEATURED HERO VIDEO SHOWCASE */}
          {featuredVideo && (
            <FeaturedHeroCard
              video={featuredVideo}
              onSelectVideo={onSelectVideo}
            />
          )}

          {/* B. SECONDARY REELS (Horizontal Swipe on Mobile / 4 Columns Desktop) */}
          {visibleSecondary.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span>Reels & Highlights</span>
                  <span className="text-xs font-mono font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {secondaryVideos.length}
                  </span>
                </h3>
                <span className="text-[11px] text-stone-400 sm:hidden">
                  Swipe horizontally &rarr;
                </span>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 md:grid md:grid-cols-4 gap-3.5 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0">
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
            <div className="pt-2 text-center">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Load More Reels (+{secondaryVideos.length - visibleSecondary.length})</span>
                <ChevronDown className="w-4 h-4" />
              </button>
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
