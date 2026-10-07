import { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const controlsTimeoutRef = useRef(null);

  const videoSrc = resolveImageUrl(video?.url || video?.videoUrl);
  const posterSrc = resolveImageUrl(video?.thumbnail);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      const muted = val === 0;
      videoRef.current.muted = muted;
      setIsMuted(muted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * (duration || videoRef.current.duration || 1);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [onClose, togglePlay]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={video.title || 'Video Player'}
    >
      {/* Top Bar Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-30 pointer-events-auto">
        <div className="flex items-center space-x-2.5">
          <span className="px-3 py-1 rounded-full bg-stone-900/90 border border-stone-700/80 text-[11px] font-semibold text-rose-300 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-rose-400" />
            {video.category || 'Studio Reel'}
          </span>
          {duration > 0 && (
            <span className="text-xs text-stone-300 hidden sm:flex items-center font-mono bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-800">
              <Clock className="w-3 h-3 mr-1 text-rose-400" />
              {formatTime(duration)}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close video player"
          className="p-2 sm:p-2.5 rounded-full bg-stone-900/90 hover:bg-rose-900/80 text-white transition-all cursor-pointer border border-stone-700/80 hover:border-rose-600/80 hover:scale-105 shadow-md active:scale-95"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Video Cinema Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-stone-800/80 group"
      >
        <div className="relative w-full h-full flex items-center justify-center bg-black min-h-[300px] sm:min-h-[460px]">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            playsInline
            onClick={togglePlay}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || video.duration || 0);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setIsEnded(true);
              setShowControls(true);
            }}
            className="w-full max-h-[72vh] object-contain cursor-pointer"
          />

          {/* Large Center Play/Pause Overlay Icon on Hover or Pause */}
          {(!isPlaying || isEnded) && (
            <button
              onClick={togglePlay}
              aria-label={isEnded ? 'Replay' : 'Play'}
              className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-700/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 border-2 border-white/20 backdrop-blur-xs z-20"
            >
              {isEnded ? (
                <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
              )}
            </button>
          )}

          {/* Bottom Custom Controls Bar */}
          <div
            className={'absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent p-3 sm:p-5 pt-8 transition-opacity duration-300 z-20 ' + (showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none')}
          >
            {/* Progress Scrubber */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-1.5 sm:h-2 bg-stone-700/80 hover:h-3 rounded-full cursor-pointer transition-all mb-3.5 group/scrubber"
              role="progressbar"
              aria-valuenow={currentTime}
              aria-valuemin="0"
              aria-valuemax={duration}
            >
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-75"
                style={{ width: (duration > 0 ? (currentTime / duration) * 100 : 0) + '%' }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform" />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white text-xs gap-3">
              <div className="flex items-center space-x-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  )}
                </button>

                {/* Volume Mute & Slider */}
                <div className="flex items-center space-x-1.5 group/volume">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume slider"
                    className="w-14 sm:w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-500 hidden sm:block"
                  />
                </div>

                {/* Time Display */}
                <span className="text-[11px] sm:text-xs text-stone-300 font-mono tracking-wider">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Side Tools */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen"
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Title, Description & Action Drawer */}
        <div className="w-full bg-stone-900 border-t border-stone-800/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                {video.title}
              </h3>
            </div>
            {video.description && (
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-2">
                {video.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/booking"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Book This Look
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
