import SEO from '../components/common/SEO';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';
import { useState, useEffect, useMemo } from 'react';
import { mediaService } from '../services/media.service';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import { FeaturedHeroCard, VideoReelCard } from '../components/gallery/VideoReelsGallery';
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
  Sparkle,
  Sparkles,
  Star,
  ArrowRight,
  MessageCircle,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Gallery() {
  const [mediaList, setMediaList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'photo' | 'video' | 'before-after'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Lightbox & Modal States
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch categories & media
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch categories
      try {
        const catRes = await mediaService.getCategories();
        if (catRes?.data) {
          const rawCats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || [];
          setCategories(rawCats.map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean));
        }
      } catch (catErr) {
        console.warn('Could not load categories:', catErr);
      }

      // 2. Fetch media with current filters
      const params = {};
      if (selectedType === 'photo' || selectedType === 'video') {
        params.type = selectedType;
      }
      if (selectedType === 'before-after') {
        params.category = 'Before & After';
      } else if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      let res = await mediaService.getGalleryMedia(params);

      // Auto-seed default sample media if gallery is empty on initial load
      if (!res?.data?.media || res.data.media.length === 0) {
        try {
          await mediaService.seedDefaultMedia();
          res = await mediaService.getGalleryMedia(params);
        } catch (_) {}
      }

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
  }, [selectedType, selectedCategory]);

  const safeMediaList = Array.isArray(mediaList) ? mediaList : [];
  const photoList = useMemo(() => safeMediaList.filter((m) => m?.type === 'photo'), [safeMediaList]);
  const videoList = useMemo(() => safeMediaList.filter((m) => m?.type === 'video'), [safeMediaList]);
  const transformationList = useMemo(
    () => safeMediaList.filter((m) => m?.category === 'Before & After' || m?.beforeAfter?.beforeUrl),
    [safeMediaList]
  );

  // Admin-designated Top 4K Spotlight Hero Video
  // Priority rule:
  // 1. Video where isFeatured is true, sorted by displayOrder (0 first)
  // 2. Fallback to video with lowest displayOrder
  const featuredVideo = useMemo(() => {
    if (!Array.isArray(videoList) || videoList.length === 0) return null;
    const featuredList = videoList.filter((v) => v?.isFeatured || v?.featured);
    if (featuredList.length > 0) {
      return [...featuredList].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
    }
    return [...videoList].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
  }, [videoList]);

  // Secondary reels list (excluding the top 4k featured hero, up to 4 for horizontal desktop row)
  const secondaryReels = useMemo(() => {
    if (!featuredVideo) return videoList.slice(0, 4);
    return videoList.filter((v) => (v?._id || v?.id) !== (featuredVideo?._id || featuredVideo?.id)).slice(0, 4);
  }, [videoList, featuredVideo]);

  const openPhotoLightbox = (item) => {
    const idx = photoList.findIndex((p) => p._id === item._id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent('Hi Enrich Beauty Parlour, I am browsing your portfolio and would like to book an appointment.');
    window.open('https://wa.me/919667900313?text=' + message, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 sm:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <SEO
        title="Artistry & Transformations Portfolio | Enrich Beauty Salon"
        description="Explore our high-end portfolio of bridal looks, hair transformations, salon tours, skin treatments, and before-and-after results at Enrich Beauty."
        keywords="salon gallery, beauty portfolio, bridal makeup videos, hair transformation reels, Enrich Beauty salon"
      />

      {/* ========================================================================= */}
      {/* 1. HERO / INTRO SECTION */}
      {/* ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkle className="w-3.5 h-3.5 fill-rose-700" />
          <span>Curated Salon Showcase</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Artistry & Transformations
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
          A visual collection of salon transformations, artistry, interiors, bridal work, skincare, and behind-the-scenes moments at Enrich Beauty.
        </p>

        {/* Streamlined Portfolio Filter Tabs */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex p-1.5 bg-stone-100 rounded-2xl border border-stone-200/80 gap-1.5">
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className={'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
                selectedType === 'all'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-900/5 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Portfolio</span>
            </button>

            <button
              onClick={() => {
                setSelectedType('photo');
                setSelectedCategory('all');
              }}
              className={'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
                selectedType === 'photo'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-900/5 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photos</span>
            </button>

            <button
              onClick={() => {
                setSelectedType('video');
                setSelectedCategory('all');
              }}
              className={'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
                selectedType === 'video'
                  ? 'bg-stone-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              )}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Studio Videos & Reels</span>
            </button>

            <button
              onClick={() => {
                setSelectedType('before-after');
                setSelectedCategory('all');
              }}
              className={'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
                selectedType === 'before-after'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-900/5 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              )}
            >
              <Sparkle className="w-3.5 h-3.5" />
              <span>Before & After</span>
            </button>
          </div>
        </div>

        {/* Secondary Category Filter Pills */}
        {selectedType !== 'before-after' && categories.length > 0 && (
          <div className="pt-2 flex items-center justify-center space-x-2 overflow-x-auto max-w-full pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ' + (
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ' + (
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ERROR OR LOADING STATES */}
      {isLoading ? (
        <div className="py-12">
          <CardSkeleton count={6} />
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Failed to Load Portfolio"
          message={errorMsg}
          onRetry={fetchData}
        />
      ) : safeMediaList.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No Media Found"
          description="No photos or videos match this category filter. Try selecting All Categories."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedType('all');
            setSelectedCategory('all');
          }}
        />
      ) : (
        <div className="space-y-20 sm:space-y-28">

          {/* ========================================================================= */}
          {/* 2. FEATURED EXPERIENCE (MAIN 4K VISUAL ANCHOR) */}
          {/* ========================================================================= */}
          {featuredVideo && selectedType !== 'photo' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Experience</span>
                </div>
                <span className="text-xs text-stone-500 font-mono">4K Studio Spotlight</span>
              </div>

              <FeaturedHeroCard
                video={featuredVideo}
                onSelectVideo={(v) => setActiveVideo(v)}
              />
            </section>
          )}

          {/* ========================================================================= */}
          {/* 3. REELS & HIGHLIGHTS (4 CARDS HORIZONTAL DESKTOP / SWIPE ON MOBILE) */}
          {/* ========================================================================= */}
          {secondaryReels.length > 0 && selectedType !== 'photo' && (
            <section className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="space-y-0.5">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Reels & Highlights
                  </h3>
                  <p className="text-xs text-stone-500">
                    Bite-sized transformation stories and behind-the-scenes moments
                  </p>
                </div>
                <span className="text-xs font-mono text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                  {videoList.length} stories
                </span>
              </div>

              {/* 4 Cards Grid Desktop / Horizontal Swipeable Carousel Mobile */}
              <div className="flex overflow-x-auto snap-x scrollbar-none pb-4 md:grid md:grid-cols-4 gap-4 sm:gap-6">
                {secondaryReels.map((video) => (
                  <VideoReelCard
                    key={video._id || video.id || video.title}
                    video={video}
                    onSelectVideo={(v) => setActiveVideo(v)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 4. PHOTO STORIES & TRANSFORMATIONS (EDITORIAL MASONRY GALLERY) */}
          {/* ========================================================================= */}
          {photoList.length > 0 && selectedType !== 'video' && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b border-stone-200 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-widest">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Editorial Stories</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    Photo Stories & Transformations
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-500">
                  {photoList.length} photographs
                </span>
              </div>

              {/* Luxury Editorial Masonry Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 auto-rows-[220px] sm:auto-rows-[240px]">
                {photoList.map((item, idx) => {
                  const pattern = idx % 6;
                  let colSpan = 'lg:col-span-4';
                  let rowSpan = 'row-span-1';

                  if (pattern === 0) {
                    colSpan = 'sm:col-span-2 lg:col-span-8';
                    rowSpan = 'row-span-2';
                  } else if (pattern === 1) {
                    colSpan = 'sm:col-span-1 lg:col-span-4';
                    rowSpan = 'row-span-2';
                  } else if (pattern === 2 || pattern === 3) {
                    colSpan = 'sm:col-span-1 lg:col-span-6';
                    rowSpan = 'row-span-1';
                  } else if (pattern === 4) {
                    colSpan = 'sm:col-span-2 lg:col-span-8';
                    rowSpan = 'row-span-1';
                  } else if (pattern === 5) {
                    colSpan = 'sm:col-span-1 lg:col-span-4';
                    rowSpan = 'row-span-1';
                  }

                  return (
                    <div
                      key={item._id || item.title || idx}
                      onClick={() => openPhotoLightbox(item)}
                      tabIndex={0}
                      role="button"
                      aria-label={'View photo: ' + (item.title || 'Portfolio Image')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openPhotoLightbox(item);
                        }
                      }}
                      className={'group relative rounded-2xl overflow-hidden bg-stone-950 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end ' + colSpan + ' ' + rowSpan}
                    >
                      <img
                        src={resolveImageUrl(item.url || item.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
                        alt={item.title || 'Salon Gallery Photo'}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                        onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[10px] font-semibold uppercase tracking-wider border border-stone-700/80">
                          {item.category || 'Artistry'}
                        </span>
                      </div>

                      <div className="relative p-4 sm:p-5 space-y-1 text-white z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="font-serif font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-rose-200 transition-colors">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] sm:text-xs text-stone-300 line-clamp-1 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {item.description}
                          </p>
                        )}
                        <div className="pt-0.5 flex items-center text-[10px] text-rose-300 font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>View Full Photograph</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 5. BEFORE & AFTER (DEDICATED SECTION) */}
          {/* ========================================================================= */}
          {transformationList.length > 0 && (
            <section className="space-y-6 pt-4">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TRANSFORMATION SPOTLIGHT</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900">
                  Before & After
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm font-light">
                  Real transformations. Real artistry. Swipe to explore the precision and results of our signature treatments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
                {transformationList.map((item, idx) => (
                  <BeforeAfterSlider
                    key={item._id || idx}
                    beforeImage={item.beforeAfter?.beforeUrl || item.beforeImage}
                    afterImage={item.beforeAfter?.afterUrl || item.afterImage || item.url}
                    title={item.title || 'Salon Treatment Result'}
                    category={item.category || 'Transformation'}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 6. CLIENT LOVE / GOOGLE REVIEWS SECTION */}
          {/* ========================================================================= */}
          <section className="bg-stone-950 text-white rounded-3xl p-8 sm:p-12 border border-stone-800 shadow-xl overflow-hidden relative">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-rose-900/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold tracking-widest uppercase">
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>CLIENT LOVE</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  512+ Google Reviews
                </h3>
                
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-200">5.0 Star Rating</span>
                  <span className="text-xs text-stone-400">• Verified Experience</span>
                </div>

                <p className="text-stone-300 text-xs sm:text-sm font-light pt-1">
                  Trusted by hundreds of clients across our salon locations for flawless hair, luxury bridal makeup, and clinical skincare.
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-stone-950 font-bold text-xs uppercase tracking-wider hover:bg-rose-50 transition-all shadow-lg hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  <span>View Google Reviews</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-700" />
                </a>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 7. FINAL EDITORIAL CTA */}
          {/* ========================================================================= */}
          <section className="text-center max-w-3xl mx-auto space-y-6 pt-4 pb-8">
            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                Your next transformation starts here.
              </h2>
              <p className="text-stone-600 text-sm sm:text-base font-light">
                Explore the artistry. Choose your experience. Make your appointment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>BOOK AN APPOINTMENT</span>
              </Link>

              <button
                onClick={handleWhatsAppChat}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>CHAT ON WHATSAPP</span>
              </button>
            </div>
          </section>

        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          mediaList={photoList}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {/* VIDEO PLAYER CINEMA MODAL */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
