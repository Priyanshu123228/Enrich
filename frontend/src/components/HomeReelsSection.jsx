import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Sparkles, Film, ArrowRight, Sparkle } from 'lucide-react';
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
    category: 'Bridal',
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
    category: 'Nail Art',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
    duration: 75,
    description: 'Watch master nail technician craft mirror-finish French ombre nails in 4K.'
  },
  {
    _id: 'fallback_reel_4',
    title: 'Client Experience & Joyful Glow',
    category: 'Customer Experience',
    url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226785/enrich/direct_uploads/vw13ercmaiu47gvomdxb.mp4',
    thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226785/enrich/direct_uploads/vw13ercmaiu47gvomdxb.mp4',
    duration: 20,
    description: 'Real smiles, client love, and glowing transformation feedback at Enrich.'
  }
];

/**
 * Individual 9:16 Vertical Reel Card
 */
function HomeReelCard({ video, onSelectVideo }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoPreviewRef = useRef(null);

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
      className="group relative rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-lg hover:shadow-2xl hover:border-rose-500/80 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between aspect-[9/15.5] cursor-pointer select-none active:scale-[0.98]"
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950">
        {/* High-Res Static Poster Thumbnail */}
        {isImageThumb ? (
          <img
            src={resolveImageUrl(video.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
            alt={video.title || 'Salon Reel Poster'}
            loading="lazy"
            className={`w-full h-full object-cover object-top transition-transform duration-700 ${
              isHovered ? 'scale-110 opacity-30' : 'scale-100 opacity-90'
            }`}
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
        ) : null}

        {/* Smooth Muted Video Preview on Desktop Hover */}
        {hasVideoUrl ? (
          <video
            ref={videoPreviewRef}
            src={videoSrc}
            muted
            playsInline
            loop
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
              isHovered || !isImageThumb ? 'opacity-90' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Multi-tier Cinematic Gradients for Crisp Overlay Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/20 to-stone-950/80 pointer-events-none" />
      </div>

      {/* TOP OVERLAY BAR: Category Badge & Duration */}
      <div className="relative p-3 sm:p-4 flex items-center justify-between gap-2 z-10">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-stone-900/85 text-stone-200 border border-stone-700/60 text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-xs">
          {video.category || 'Transformation'}
        </span>

        {video.duration ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/75 text-stone-300 text-[10px] sm:text-xs font-mono backdrop-blur-md border border-stone-800">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
            <span>{formatVideoDuration(video.duration)}</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 text-[10px] font-mono border border-rose-800/60">
            HD
          </span>
        )}
      </div>

      {/* CENTER GLOWING PLAY BUTTON */}
      <div className="relative flex items-center justify-center z-10 my-auto py-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-rose-600/30 blur-md group-hover:scale-125 transition-transform duration-300" />
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900/90 text-white border-2 border-rose-500/80 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-700 group-hover:border-white backdrop-blur-md">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 text-white" />
          </div>
        </div>
      </div>

      {/* BOTTOM OVERLAY INFO: Title & Action Indicator */}
      <div className="relative p-3.5 sm:p-4 z-10 space-y-1.5">
        <h4 className="text-xs sm:text-sm font-serif font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md group-hover:text-rose-200 transition-colors">
          {video.title || 'Studio Transformation'}
        </h4>

        <div className="flex items-center justify-between pt-0.5 text-[11px] text-rose-300 font-medium">
          <span className="flex items-center gap-1 group-hover:underline">
            <span>Tap to watch</span>
            <Play className="w-2.5 h-2.5 fill-current" />
          </span>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">
            4K Story
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * HomeReelsSection
 * 
 * High-engagement homepage section featuring 4 short video reels.
 * Allows visitors to see real transformations within 3 seconds of landing.
 */
export default function HomeReelsSection({
  videos = [],
  onSelectVideo = () => {}
}) {
  // Select top 4 reels with smart fallback
  const displayReels = useMemo(() => {
    const list = Array.isArray(videos) && videos.length > 0 ? videos : [];
    if (list.length >= 4) {
      return list.slice(0, 4);
    }
    // Pad with fallback if fewer than 4
    const existingIds = new Set(list.map((v) => v._id || v.id));
    const needed = 4 - list.length;
    const fillers = DEFAULT_FALLBACK_REELS.filter((f) => !existingIds.has(f._id)).slice(0, needed);
    return [...list, ...fillers];
  }, [videos]);

  return (
    <section
      aria-label="Salon Video Reels and Transformations"
      className="w-full bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-white py-14 sm:py-20 border-y border-stone-800 shadow-inner relative overflow-hidden"
    >
      {/* Background Ambience Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/50 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Studio Reels &bull; 4K Transformations</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
              Watch the Transformations
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl leading-relaxed">
              Tap any reel to watch real salon makeovers, bridal artistry, and clinical treatments filmed live in our Sikar studio.
            </p>
          </div>

          {/* View All Stories Link */}
          <Link
            to="/gallery?type=video"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 shrink-0 group transition-colors py-1 cursor-pointer"
          >
            <span>Explore All Video Stories</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 SHORT VIDEO REELS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {displayReels.map((reel) => (
            <HomeReelCard
              key={reel._id || reel.id || reel.title}
              video={reel}
              onSelectVideo={onSelectVideo}
            />
          ))}
        </div>

        {/* FOOTER CALL-TO-ACTION STRIP */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-medium text-stone-200">
              Inspired by a look? Book your consultation with our master stylists.
            </p>
            <p className="text-[11px] text-stone-400">
              Every appointment includes a personalized skin & hair consultation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/book"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all active:scale-98"
            >
              Book Transformation
            </Link>

            <Link
              to="/gallery?type=video"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white text-xs font-medium transition-colors"
            >
              More Reels
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
