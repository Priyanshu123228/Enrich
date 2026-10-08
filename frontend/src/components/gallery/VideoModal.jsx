import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  Sparkles,
  Calendar,
  Heart,
  Share2,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Sparkle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

/**
 * Format duration in seconds to MM:SS
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

/**
 * Instagram Reels-Style Video Player Modal
 * Features:
 * - Vertical 9:16 Instagram Reel experience
 * - Auto-scroll / Auto-next to next reel when video ends or auto-advances
 * - Touch swipe gestures (Swipe Up for Next, Swipe Down for Prev)
 * - Mouse wheel / Trackpad vertical scroll navigation
 * - Next & Previous buttons (Up / Down arrows)
 * - Double-tap / double-click to like with bursting heart animation
 * - Quick WhatsApp Share & Book Look actions
 * - Mute/Unmute state persistence
 * - Keyboard shortcuts (ArrowUp, ArrowDown, Space, M, Esc)
 */
export default function VideoModal({
  video,
  videos = [],
  onClose = () => {},
  onSelectVideo = () => {}
}) {
  // Normalize video list
  const playlist = useMemo(() => {
    if (Array.isArray(videos) && videos.length > 0) {
      return videos;
    }
    return video ? [video] : [];
  }, [videos, video]);

  // Find active index
  const initialIndex = useMemo(() => {
    if (!video || playlist.length === 0) return 0;
    const currentId = video._id || video.id || video.url || video.videoUrl;
    const foundIdx = playlist.findIndex(
      (v) => (v._id || v.id || v.url || v.videoUrl) === currentId
    );
    return foundIdx !== -1 ? foundIdx : 0;
  }, [video, playlist]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [slideDirection, setSlideDirection] = useState('none'); // 'up' | 'down' | 'none'
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [liked, setLiked] = useState({});
  const [likeCountOffset, setLikeCountOffset] = useState({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const isScrollingRef = useRef(false);
  const lastWheelTime = useRef(0);

  // Sync index when video prop changes from outside
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentVideo = playlist[currentIndex] || video;
  const currentVideoId = currentVideo?._id || currentVideo?.id || currentVideo?.url || currentIndex;
  const isCurrentLiked = Boolean(liked[currentVideoId]);
  const baseLikes = 280 + ((currentIndex * 47) % 350);
  const totalLikes = baseLikes + (likeCountOffset[currentVideoId] || 0);

  const videoSrc = resolveImageUrl(currentVideo?.url || currentVideo?.videoUrl);
  const posterSrc = resolveImageUrl(currentVideo?.thumbnail, DEFAULT_SALON_PLACEHOLDER);

  // Navigate to Next Reel
  const handleNextReel = useCallback(() => {
    if (playlist.length <= 1) return;
    setSlideDirection('up');
    setCurrentTime(0);
    setIsPlaying(true);
    setCaptionExpanded(false);
    setCurrentIndex((prev) => {
      const nextIdx = (prev + 1) % playlist.length;
      onSelectVideo(playlist[nextIdx]);
      return nextIdx;
    });
    setTimeout(() => setSlideDirection('none'), 350);
  }, [playlist, onSelectVideo]);

  // Navigate to Previous Reel
  const handlePrevReel = useCallback(() => {
    if (playlist.length <= 1) return;
    setSlideDirection('down');
    setCurrentTime(0);
    setIsPlaying(true);
    setCaptionExpanded(false);
    setCurrentIndex((prev) => {
      const prevIdx = (prev - 1 + playlist.length) % playlist.length;
      onSelectVideo(playlist[prevIdx]);
      return prevIdx;
    });
    setTimeout(() => setSlideDirection('none'), 350);
  }, [playlist, onSelectVideo]);

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  // Mute / Unmute
  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Double tap / double click to like with bursting animation
  const handleDoubleTap = (e) => {
    e.stopPropagation();
    if (!isCurrentLiked) {
      setLiked((prev) => ({ ...prev, [currentVideoId]: true }));
      setLikeCountOffset((prev) => ({ ...prev, [currentVideoId]: 1 }));
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    setLiked((prev) => {
      const nextState = !prev[currentVideoId];
      setLikeCountOffset((cnts) => ({
        ...cnts,
        [currentVideoId]: nextState ? 1 : 0
      }));
      return { ...prev, [currentVideoId]: nextState };
    });
    if (!isCurrentLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  // Share via WhatsApp
  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const title = currentVideo?.title || 'Enrich Beauty Reel';
    const text = encodeURIComponent(
      `Check out this salon look on Enrich Beauty: "${title}" - https://wa.me/919667900313`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Auto next on video ended
  const handleVideoEnded = () => {
    if (autoAdvance) {
      handleNextReel();
    } else {
      setIsPlaying(false);
    }
  };

  // Touch Swipe Handling (Swipe Up for Next, Swipe Down for Prev)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const diffY = touchStartY.current - endY;
    const diffX = touchStartX.current - endX;
    const elapsedTime = Date.now() - touchStartTime.current;

    // Must be predominantly vertical swipe and reasonably fast
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 45 && elapsedTime < 600) {
      if (diffY > 0) {
        // Swiped UP -> Next Reel
        handleNextReel();
      } else {
        // Swiped DOWN -> Previous Reel
        handlePrevReel();
      }
    }
  };

  // Wheel / Trackpad Scroll Handling (Debounced)
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 500) return; // Debounce 500ms

    if (e.deltaY > 30) {
      // Scroll Down -> Next Reel
      lastWheelTime.current = now;
      handleNextReel();
    } else if (e.deltaY < -30) {
      // Scroll Up -> Previous Reel
      lastWheelTime.current = now;
      handlePrevReel();
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextReel, handlePrevReel, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // When video source changes, ensure auto-play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio was prevented, fallback to muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
      }
    }
  }, [currentIndex, isMuted]);

  if (!currentVideo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md select-none transition-opacity duration-300"
      onClick={onClose}
      onWheel={handleWheel}
      role="dialog"
      aria-modal="true"
      aria-label="Instagram Reels Video Viewer"
    >
      {/* TOP HEADER CONTROLS BAR */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between z-30 pointer-events-auto">
        {/* Left: Reel Counter & Category */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-700/80 text-white text-xs font-mono backdrop-blur-md shadow-md">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>
              Reel {currentIndex + 1} / {playlist.length}
            </span>
          </div>

          {currentVideo?.category && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-rose-950/70 border border-rose-600/40 text-rose-200 text-xs font-medium backdrop-blur-md">
              {currentVideo.category}
            </span>
          )}
        </div>

        {/* Center: Auto-Scroll Toggle Status */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAutoAdvance(!autoAdvance);
          }}
          className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ' + (
            autoAdvance
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 shadow-emerald-900/30'
              : 'bg-stone-900/80 text-stone-400 border-stone-700'
          )}
          title="Toggle Auto-Scroll to Next Reel"
        >
          <span className={'w-2 h-2 rounded-full ' + (autoAdvance ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500')} />
          <span>{autoAdvance ? 'Auto-Next: ON' : 'Auto-Next: OFF'}</span>
        </button>

        {/* Right: Sound & Close Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 sm:p-2.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-white transition-all cursor-pointer border border-stone-700/80 shadow-md active:scale-95"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            aria-label="Close Reels Player"
            className="p-2 sm:p-2.5 rounded-full bg-stone-900/90 hover:bg-rose-900 text-white transition-all cursor-pointer border border-stone-700/80 hover:border-rose-600 shadow-md active:scale-95"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN INSTAGRAM REELS STAGE (9:16 VERTICAL CONTAINER) */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
        className={'relative w-full max-w-[420px] sm:max-w-[430px] h-full sm:h-[92vh] max-h-[920px] rounded-none sm:rounded-3xl overflow-hidden bg-black shadow-2xl border-0 sm:border border-stone-800 flex flex-col justify-between group transition-transform duration-300 ' + (
          slideDirection === 'up'
            ? 'animate-slide-up'
            : slideDirection === 'down'
            ? 'animate-slide-down'
            : ''
        )}
      >
        {/* VIDEO MEDIA & TAP-TO-PLAY */}
        <div
          className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center bg-stone-950"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            playsInline
            muted={isMuted}
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration || 0);
            }}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />

          {/* Top & Bottom Cinematic Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/70 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950/90 pointer-events-none" />

          {/* Double Tap Floating Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 m-auto w-24 h-24 flex items-center justify-center pointer-events-none z-30 animate-ping">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
            </div>
          )}

          {/* Center Play / Pause Indicator Icon on Tap */}
          {showPlayIcon && (
            <div className="absolute inset-0 m-auto w-18 h-18 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center pointer-events-none z-30 transition-transform scale-110">
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </div>
          )}
        </div>

        {/* SWIPE UP / DOWN CUES (Mobile & First Impression) */}
        <div className="relative pt-16 px-4 z-20 flex justify-between items-center pointer-events-none">
          <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
            Swipe vertical for more reels
          </span>
          <span className="text-[10px] text-rose-300 font-mono bg-rose-950/60 border border-rose-600/30 px-2 py-0.5 rounded-full">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* RIGHT ACTION RAIL (Instagram Reels Style) */}
        <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-4 z-30 pointer-events-auto">
          {/* UP ARROW: PREVIOUS REEL */}
          <button
            onClick={handlePrevReel}
            aria-label="Previous Reel"
            title="Previous Reel (↑)"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-900/85 hover:bg-rose-700 text-white border border-stone-700/80 shadow-xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer group/btn"
          >
            <ChevronUp className="w-6 h-6 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>

          {/* LIKE BUTTON */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLikeToggle}
              aria-label={isCurrentLiked ? 'Unlike' : 'Like'}
              className={'w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-900/85 hover:bg-stone-800 border border-stone-700/80 shadow-xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer ' + (
                isCurrentLiked ? 'text-rose-500' : 'text-white hover:text-rose-400'
              )}
            >
              <Heart className={'w-5 h-5 transition-transform ' + (isCurrentLiked ? 'fill-rose-500 scale-110' : '')} />
            </button>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
              {totalLikes}
            </span>
          </div>

          {/* WHATSAPP SHARE */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleWhatsAppShare}
              aria-label="Share reel on WhatsApp"
              title="Share on WhatsApp"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-900/85 hover:bg-emerald-600 text-white border border-stone-700/80 shadow-xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-medium text-stone-300 mt-1 drop-shadow-md">
              Share
            </span>
          </div>

          {/* BOOK THIS LOOK */}
          <div className="flex flex-col items-center">
            <Link
              to="/booking"
              onClick={onClose}
              aria-label="Book appointment for this look"
              title="Book this style"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-700 hover:bg-rose-600 text-white border border-rose-500 shadow-xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <span className="text-[10px] font-bold text-rose-300 mt-1 drop-shadow-md">
              Book
            </span>
          </div>

          {/* DOWN ARROW: NEXT REEL */}
          <button
            onClick={handleNextReel}
            aria-label="Next Reel"
            title="Next Reel (↓)"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-900/85 hover:bg-rose-700 text-white border border-stone-700/80 shadow-xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer group/btn"
          >
            <ChevronDown className="w-6 h-6 group-hover/btn:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* BOTTOM OVERLAY INFO (Reel Title, Description & Salon Tag) */}
        <div className="relative p-4 sm:p-5 pr-16 z-20 space-y-2 pointer-events-auto">
          {/* Salon Author Header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center">
                <Sparkle className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              </div>
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              Enrich Beauty
            </span>
            <span className="text-[10px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs font-medium">
              Verified Studio
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-serif font-bold text-white leading-snug drop-shadow-md">
            {currentVideo.title}
          </h3>

          {/* Description / Caption */}
          {currentVideo.description && (
            <div className="text-xs text-stone-200 leading-relaxed drop-shadow-sm font-light">
              <p className={captionExpanded ? 'line-clamp-none' : 'line-clamp-2'}>
                {currentVideo.description}
              </p>
              {currentVideo.description.length > 80 && (
                <button
                  onClick={() => setCaptionExpanded(!captionExpanded)}
                  className="text-rose-400 font-semibold hover:text-rose-300 ml-1 cursor-pointer"
                >
                  {captionExpanded ? 'less' : 'more'}
                </button>
              )}
            </div>
          )}

          {/* Action CTA Bar */}
          <div className="pt-1 flex items-center gap-2">
            <Link
              to="/booking"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* BOTTOM VIDEO SCRUBBER / PROGRESS BAR */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-stone-800/80 z-30">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-100 ease-linear"
            style={{
              width: duration > 0 ? (currentTime / duration) * 100 + '%' : '0%'
            }}
          />
        </div>
      </div>

      {/* DESKTOP FLOATING SIDE NEXT / PREV BUTTONS */}
      <div className="hidden lg:flex flex-col gap-3 absolute right-10 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={handlePrevReel}
          aria-label="Previous Reel"
          title="Previous Reel (↑ or K)"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-900/90 hover:bg-rose-700 text-white border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all cursor-pointer group active:scale-95"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs font-semibold">Prev Reel</span>
        </button>

        <button
          onClick={handleNextReel}
          aria-label="Next Reel"
          title="Next Reel (↓ or J)"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-900/90 hover:bg-rose-700 text-white border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all cursor-pointer group active:scale-95"
        >
          <span className="text-xs font-semibold">Next Reel</span>
          <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
