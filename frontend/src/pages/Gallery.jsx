import SEO from '../components/common/SEO';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';
import { useState, useEffect, useMemo, useRef } from 'react';
import { mediaService } from '../services/media.service';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { Link } from 'react-router-dom';
import {
  Camera,
  Video,
  Layers,
  Eye,
  Sparkles,
  Play,
  Clock,
  Film,
  Sparkle,
  ArrowRight,
  Phone
} from 'lucide-react';

// Streamlined, single-row filter options
const GALLERY_FILTERS = [
  { id: 'all', label: 'All Portfolio', icon: Layers },
  { id: 'photo', label: 'Photos', icon: Camera },
  { id: 'video', label: 'Videos & Reels', icon: Video },
  { id: 'bridal', label: 'Bridal', icon: Sparkles },
  { id: 'hair', label: 'Hair', icon: Sparkle },
  { id: 'skin', label: 'Skin & Clinic', icon: Sparkle },
  { id: 'before-after', label: 'Before & After', icon: Eye }
];

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
 * Clean Video Card with hover preview and tap-to-modal
 */
function GalleryVideoCard({ video, onSelectVideo }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const hasVideoUrl = Boolean(video?.url || video?.videoUrl);
  const isImageThumb =
    video?.thumbnail &&
    !video.thumbnail.includes('.mp4') &&
    !video.thumbnail.includes('.webm') &&
    video.thumbnail !== video?.url;

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
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 border border-stone-800/80 hover:border-rose-500 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between aspect-[9/16] cursor-pointer select-none active:scale-[0.98]"
    >
      {/* Background Poster / Video Preview */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
        {isImageThumb ? (
          <img
            src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
            alt={video.title || 'Salon Video Reel'}
            loading="lazy"
            className={`w-full h-full object-cover object-top transition-transform duration-700 ${
              isHovered ? 'scale-108 opacity-40' : 'scale-100 opacity-95'
            }`}
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
        ) : null}

        {hasVideoUrl ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            loop
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
              isHovered || !isImageThumb ? 'opacity-95' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Cinematic Vignettes */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent pointer-events-none z-10" />
      </div>

      {/* Top Badges */}
      <div className="relative p-3 sm:p-4 flex items-center justify-between gap-2 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-stone-200 border border-white/15 text-[10px] sm:text-xs font-semibold backdrop-blur-md">
          <Film className="w-3 h-3 text-rose-400" />
          <span className="truncate max-w-[90px]">{video.category || 'Video'}</span>
        </span>

        {video.duration ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-stone-200 text-[10px] sm:text-xs font-mono backdrop-blur-md border border-white/15">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
            <span>{formatVideoDuration(video.duration)}</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 text-[10px] font-mono border border-rose-800/60">
            HD
          </span>
        )}
      </div>

      {/* Center Play Button */}
      <div className="relative flex items-center justify-center z-10 my-auto py-2">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600/90 text-white border-2 border-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300 backdrop-blur-md">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 text-white" />
        </div>
      </div>

      {/* Bottom Title & Action */}
      <div className="relative p-3.5 sm:p-4 z-10 space-y-1">
        <h4 className="text-xs sm:text-sm font-serif font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md group-hover:text-rose-200 transition-colors">
          {video.title || 'Studio Reel'}
        </h4>
        <div className="flex items-center text-[11px] text-rose-300 font-medium pt-0.5">
          <span>Watch Reel</span>
          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

/**
 * Clean Photo Card with click-to-lightbox
 */
function GalleryPhotoCard({ photo, onSelectPhoto }) {
  const thumbUrl = resolveImageUrl(photo.url || photo.thumbnail, DEFAULT_SALON_PLACEHOLDER);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View photo: ${photo.title || 'Salon portfolio'}`}
      onClick={() => onSelectPhoto(photo)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectPhoto(photo);
        }
      }}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between aspect-[3/4] cursor-pointer active:scale-[0.98]"
    >
      <img
        src={thumbUrl}
        alt={photo.title || 'Salon Portfolio Photo'}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
        onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
      />

      {/* Subtle Bottom Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

      {/* Category Pill */}
      <div className="relative p-3 sm:p-4 z-10">
        <span className="inline-block px-2.5 py-1 rounded-full bg-black/60 text-stone-100 border border-white/20 text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-xs">
          {photo.category || 'Portfolio'}
        </span>
      </div>

      {/* Bottom Caption & View Action */}
      <div className="relative p-3.5 sm:p-4 z-10 space-y-1 text-white">
        <h4 className="text-xs sm:text-sm font-serif font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md group-hover:text-rose-200 transition-colors">
          {photo.title || 'Artistry & Styling'}
        </h4>
        <div className="flex items-center text-[10px] sm:text-xs text-rose-300 font-medium pt-0.5">
          <Eye className="w-3.5 h-3.5 mr-1" />
          <span>View Photograph</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Gallery Page Component
 * 
 * Simplified, single-row filter bar, clear gallery grid, and 0 confusing blocks.
 */
export default function Gallery() {
  const [mediaList, setMediaList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Lightbox & Modal States
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch full media catalog once for instant client-side filtering
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await mediaService.getGalleryMedia({ limit: 100 });
      if (res?.data?.media && Array.isArray(res.data.media)) {
        setMediaList(res.data.media);
      } else if (Array.isArray(res?.data)) {
        setMediaList(res.data);
      } else {
        setMediaList([]);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setErrorMsg(err.message || 'Unable to load gallery items. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Items (Calculated instantaneously)
  const filteredMedia = useMemo(() => {
    if (!Array.isArray(mediaList)) return [];

    if (activeFilter === 'all') return mediaList;

    if (activeFilter === 'photo') {
      return mediaList.filter((m) => m?.type === 'photo');
    }

    if (activeFilter === 'video') {
      return mediaList.filter((m) => m?.type === 'video');
    }

    if (activeFilter === 'before-after') {
      return mediaList.filter(
        (m) =>
          m?.category?.toLowerCase().includes('before') ||
          m?.category?.toLowerCase().includes('after') ||
          m?.type === 'before_after' ||
          m?.beforeAfter?.beforeUrl
      );
    }

    // Category matches (bridal, hair, skin)
    return mediaList.filter((m) => {
      const cat = (m?.category || '').toLowerCase();
      if (activeFilter === 'bridal') return cat.includes('bridal');
      if (activeFilter === 'hair') return cat.includes('hair');
      if (activeFilter === 'skin') return cat.includes('skin') || cat.includes('makeup') || cat.includes('clinic');
      return true;
    });
  }, [mediaList, activeFilter]);

  // Full photo list for lightbox navigation
  const lightboxPhotoList = useMemo(() => {
    return filteredMedia.filter((m) => m?.type === 'photo');
  }, [filteredMedia]);

  // Full video list for modal playlist
  const videoPlaylist = useMemo(() => {
    const vids = mediaList.filter((m) => m?.type === 'video');
    return vids.length > 0 ? vids : [];
  }, [mediaList]);

  const handleSelectPhoto = (photo) => {
    const idx = lightboxPhotoList.findIndex((p) => p._id === photo._id || p.url === photo.url);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <SEO
        title="Salon Gallery & Transformations | Enrich Beauty Sikar"
        description="Browse real bridal makeovers, hair styling, skin treatments, and studio video reels filmed live at Enrich Beauty Salon in Sikar."
        keywords="salon gallery, beauty portfolio, bridal makeup videos, hair transformation reels, Enrich Beauty salon"
      />

      {/* =========================================================================
          1. CLEAN, MINIMAL HEADER
          ========================================================================= */}
      <section className="text-center max-w-2xl mx-auto space-y-2.5 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/90 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>Salon Portfolio</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Artistry & Transformations
        </h1>

        <p className="text-stone-600 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
          Real bridal makeovers, hair transformations, skin treatments, and studio video reels.
        </p>
      </section>

      {/* =========================================================================
          2. STREAMLINED, SINGLE-ROW FILTER PILLS
          ========================================================================= */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {GALLERY_FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-rose-700 text-white shadow-md shadow-rose-900/25 ring-1 ring-rose-700'
                  : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          3. UNIFIED GALLERY GRID
          ========================================================================= */}
      {isLoading ? (
        <div className="py-12">
          <CardSkeleton count={8} />
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Failed to Load Portfolio"
          message={errorMsg}
          onRetry={fetchData}
        />
      ) : filteredMedia.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No Items Found"
          description={`No portfolio media found under "${activeFilter}". Try selecting "All Portfolio".`}
          actionText="Show All Portfolio"
          onAction={() => setActiveFilter('all')}
        />
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {/* Main Grid: Responsive 2-col on mobile, 3-col on tablet, 4-col on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 animate-in fade-in duration-300">
            {filteredMedia.map((item, idx) => {
              const isVideo = item.type === 'video' || item.duration > 0 || item.videoUrl;
              const isTransformation =
                item.category === 'Before & After' ||
                item.type === 'before_after' ||
                (item.beforeAfter?.beforeUrl && item.beforeAfter?.afterUrl);

              // 1. Video Card
              if (isVideo) {
                return (
                  <GalleryVideoCard
                    key={item._id || item.id || idx}
                    video={item}
                    onSelectVideo={(v) => setActiveVideo(v)}
                  />
                );
              }

              // 2. Before / After Slider Card
              if (isTransformation) {
                return (
                  <div
                    key={item._id || idx}
                    className="col-span-2 rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-white p-2"
                  >
                    <BeforeAfterSlider
                      beforeImage={item.beforeAfter?.beforeUrl || item.beforeImage}
                      afterImage={item.beforeAfter?.afterUrl || item.afterImage || item.url}
                      title={item.title || 'Transformation Result'}
                      category={item.category || 'Before & After'}
                    />
                  </div>
                );
              }

              // 3. Photo Card
              return (
                <GalleryPhotoCard
                  key={item._id || item.id || idx}
                  photo={item}
                  onSelectPhoto={handleSelectPhoto}
                />
              );
            })}
          </div>

          {/* Quick Consultation Strip */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-rose-50 border border-rose-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-0.5">
              <h4 className="text-sm sm:text-base font-serif font-bold text-stone-900">
                Want a personalized makeover or bridal consultation?
              </h4>
              <p className="text-xs text-stone-600 font-light">
                Visit us at Sharda Heights, Chandpol, Sikar, or book an appointment online.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/book"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all active:scale-98"
              >
                Book Appointment
              </Link>
              <a
                href="tel:+919667900313"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>Call Desk</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & LIGHTBOX (PhotoLightbox & VideoModal)
          ========================================================================= */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          mediaList={lightboxPhotoList.length > 0 ? lightboxPhotoList : []}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          videos={videoPlaylist}
          onSelectVideo={(v) => setActiveVideo(v)}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
