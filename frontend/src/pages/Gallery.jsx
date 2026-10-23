import SEO from '../components/common/SEO';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { mediaService } from '../services/media.service';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import { FeaturedHeroCard, ReelsCarousel } from '../components/gallery/VideoReelsGallery';
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { CardSkeleton } from '../components/common/SkeletonLoader';
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
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Crown,
  ShieldCheck,
  Heart
} from 'lucide-react';

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  // selectedType: 'bridal' | 'all' | 'photo' | 'video' | 'before-after'
  const [selectedType, setSelectedType] = useState(() => {
    if (categoryParam && categoryParam.toLowerCase() === 'bridal') {
      return 'bridal';
    }
    return 'all';
  });

  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Lightbox & Modal States
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Sync selectedType when URL search param changes
  useEffect(() => {
    if (categoryParam && categoryParam.toLowerCase() === 'bridal') {
      setSelectedType('bridal');
    }
  }, [categoryParam]);

  // Fetch gallery media based on selected type/category filter
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (selectedType === 'bridal') {
        params.category = 'Bridal';
      } else if (selectedType === 'photo' || selectedType === 'video') {
        params.type = selectedType;
      } else if (selectedType === 'before-after') {
        params.category = 'Before & After';
      }

      let res = await mediaService.getGalleryMedia(params);

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
  }, [selectedType]);

  const handleTabChange = (type) => {
    setSelectedType(type);
    if (type === 'bridal') {
      setSearchParams({ category: 'Bridal' });
    } else {
      setSearchParams({});
    }
  };

  const safeMediaList = Array.isArray(mediaList) ? mediaList : [];

  // When 'bridal' is active, photoList contains strictly bridal photos
  const photoList = useMemo(() => {
    if (selectedType === 'bridal') {
      return safeMediaList.filter(
        (m) =>
          m?.type === 'photo' &&
          (m?.category === 'Bridal' ||
            (m?.title && m.title.toLowerCase().includes('bridal')) ||
            (m?.description && m.description.toLowerCase().includes('bridal')))
      );
    }
    return safeMediaList.filter((m) => m?.type === 'photo');
  }, [safeMediaList, selectedType]);

  const videoList = useMemo(() => {
    if (selectedType === 'bridal') return [];
    return safeMediaList.filter((m) => m?.type === 'video');
  }, [safeMediaList, selectedType]);

  const transformationList = useMemo(() => {
    if (selectedType === 'bridal') return [];
    return safeMediaList.filter((m) => m?.category === 'Before & After' || m?.beforeAfter?.beforeUrl);
  }, [safeMediaList, selectedType]);

  // Admin-designated Top 4K Spotlight Hero Video
  const featuredVideo = useMemo(() => {
    if (selectedType === 'bridal') return null;
    if (!Array.isArray(videoList) || videoList.length === 0) return null;
    const featuredList = videoList.filter((v) => v?.isFeatured || v?.featured);
    if (featuredList.length > 0) {
      return [...featuredList].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
    }
    return [...videoList].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
  }, [videoList, selectedType]);

  // Secondary reels list (excluding the top 4k featured hero, up to 4 for horizontal desktop row)
  const secondaryReels = useMemo(() => {
    if (selectedType === 'bridal') return [];
    if (!featuredVideo) return videoList.slice(0, 4);
    return videoList.filter((v) => (v?._id || v?.id) !== (featuredVideo?._id || featuredVideo?.id)).slice(0, 4);
  }, [videoList, featuredVideo, selectedType]);

  const openPhotoLightbox = (item) => {
    const idx = photoList.findIndex((p) => p._id === item._id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(
      selectedType === 'bridal'
        ? 'Hi Anu Saini, I am viewing your Royal Bridal Portfolio and would like to inquire about bridal dates, packages, and trials.'
        : 'Hi Enrich Beauty Parlour, I am browsing your portfolio and would like to book an appointment.'
    );
    window.open('https://wa.me/919667900313?text=' + message, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 sm:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <SEO
        title={
          selectedType === 'bridal'
            ? 'Royal Bridal Artistry Portfolio | Enrich Sikar by Anu Saini'
            : 'Artistry & Transformations Portfolio | Enrich Beauty Salon'
        }
        description={
          selectedType === 'bridal'
            ? 'Exclusive royal bridal makeovers in Sikar. HD airbrush bridal makeup, traditional Rajasthani poshak draping, and jewelry styling by Anu Saini.'
            : 'Explore our high-end portfolio of bridal looks, hair transformations, salon tours, skin treatments, and before-and-after results at Enrich Beauty.'
        }
        keywords="bridal makeup sikar, bridal portfolio, enrich beauty bridal, hd airbrush makeup, rajasthani bridal look, anu saini bridal"
      />

      {/* ========================================================================= */}
      {/* 1. HERO / INTRO SECTION */}
      {/* ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
          Curated Salon Portfolio
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {selectedType === 'bridal' ? 'Royal Bridal Artistry' : 'Artistry & Transformations'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
          {selectedType === 'bridal'
            ? 'A dedicated showcase of signature bridal transformations, traditional Rajasthani draping, and luminous HD looks crafted by Lead Cosmetologist Anu Saini.'
            : 'A visual collection of salon transformations, artistry, interiors, bridal work, skincare, and behind-the-scenes moments at Enrich Beauty.'}
        </p>

        {/* Streamlined Curated Portfolio Filter Tabs */}
        <div className="pt-3 flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-stone-100 rounded-2xl border border-stone-200/80 gap-1 sm:gap-1.5 max-w-full overflow-x-auto scrollbar-none shadow-xs">
            {/* DEDICATED BRIDAL TAB */}
            <button
              onClick={() => handleTabChange('bridal')}
              className={'px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ' + (
                selectedType === 'bridal'
                  ? 'bg-rose-700 text-white shadow-md font-bold'
                  : 'text-rose-800 hover:text-rose-900 hover:bg-rose-50 border border-rose-200/60'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span>👑 Bridal Artistry</span>
            </button>

            <button
              onClick={() => handleTabChange('all')}
              className={'px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ' + (
                selectedType === 'all'
                  ? 'bg-stone-900 text-white shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              )}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>All Portfolio</span>
            </button>

            <button
              onClick={() => handleTabChange('photo')}
              className={'px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ' + (
                selectedType === 'photo'
                  ? 'bg-stone-900 text-white shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              )}
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Photos</span>
            </button>

            <button
              onClick={() => handleTabChange('video')}
              className={'px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ' + (
                selectedType === 'video'
                  ? 'bg-stone-900 text-white shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              )}
            >
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Reels & Videos</span>
            </button>

            <button
              onClick={() => handleTabChange('before-after')}
              className={'px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ' + (
                selectedType === 'before-after'
                  ? 'bg-stone-900 text-white shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Before & After</span>
            </button>
          </div>
        </div>
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
          title={selectedType === 'bridal' ? 'No Bridal Photos Found' : 'No Media Found'}
          description={
            selectedType === 'bridal'
              ? 'Our bridal collection is being updated. Inquire directly on WhatsApp to view our complete bridal album.'
              : 'No items found for this selection. Try switching to All Portfolio.'
          }
          actionText={selectedType === 'bridal' ? 'View All Portfolio' : 'Reset Filter'}
          onAction={() => handleTabChange('all')}
        />
      ) : (
        <div className="space-y-20 sm:space-y-28">

          {/* ========================================================================= */}
          {/* SPECIAL SECTION: DEDICATED BRIDAL ATELIER BANNER (WHEN BRIDAL TAB IS ACTIVE) */}
          {/* ========================================================================= */}
          {selectedType === 'bridal' && (
            <section className="relative overflow-hidden bg-gradient-to-r from-stone-950 via-[#261517] to-stone-950 rounded-3xl p-6 sm:p-10 text-white border border-rose-900/40 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Exclusively Bridal Transformations • Enrich Sikar</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white">
                    Signature Royal Bridal Portfolio
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                    Personally styled and crafted by Founder & Lead Cosmetologist <strong>Anu Saini</strong>. Featuring waterproof HD airbrush techniques, traditional Rajputana matha patti and poshak draping, and customized pre-bridal rituals.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      18-Hr Waterproof Base
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      Authentic Rajasthani Draping
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Anu Saini Personal Direction
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <a
                    href="https://wa.me/919667900313?text=Hi%20Anu%20Saini,%20I%20am%20viewing%20your%20Royal%20Bridal%20Portfolio%20and%20want%20to%20reserve%20wedding%20dates."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Inquire Wedding Dates on WhatsApp</span>
                  </a>
                  <a
                    href="https://wa.me/919667900313?text=Hi%20Anu%20Saini,%20I%20am%20viewing%20your%20Royal%20Bridal%20Portfolio%20and%20want%20to%20reserve%20wedding%20dates."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-rose-300" />
                    <span>Inquire Bridal Dates on WhatsApp</span>
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 2. FEATURED EXPERIENCE (MAIN 4K VISUAL ANCHOR - HIDDEN IN BRIDAL MODE) */}
          {/* ========================================================================= */}
          {featuredVideo && selectedType !== 'bridal' && (selectedType === 'all' || selectedType === 'video') && (
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
          {/* 3. REELS & HIGHLIGHTS (HIDDEN IN BRIDAL MODE) */}
          {/* ========================================================================= */}
          {secondaryReels.length > 0 && selectedType !== 'bridal' && (selectedType === 'all' || selectedType === 'video') && (
            <section className="space-y-4">
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

              <ReelsCarousel
                videos={secondaryReels}
                onSelectVideo={(v) => setActiveVideo(v)}
                autoPlayInterval={4500}
              />
            </section>
          )}

          {/* ========================================================================= */}
          {/* 4. PHOTO STORIES & TRANSFORMATIONS */}
          {/* ========================================================================= */}
          {photoList.length > 0 && (selectedType === 'all' || selectedType === 'photo' || selectedType === 'bridal') && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b border-stone-200 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold uppercase tracking-widest">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{selectedType === 'bridal' ? 'Royal Bridal Gallery' : 'Editorial Stories'}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    {selectedType === 'bridal' ? 'Exclusively Bridal Looks' : 'Photo Stories & Transformations'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                    {photoList.length} photographs
                  </span>
                </div>
              </div>

              {/* Multi-Column Editorial Masonry Layout */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 sm:gap-6 [column-fill:_balance]">
                {photoList.map((item, idx) => {
                  const ratioPattern = [
                    'aspect-[3/4]',
                    'aspect-[4/5]',
                    'aspect-[3/3.8]',
                    'aspect-[4/5]',
                    'aspect-[1/1]',
                    'aspect-[3/4.2]'
                  ];
                  const cardAspect = ratioPattern[idx % ratioPattern.length];

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
                      className={'group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-end break-inside-avoid mb-5 sm:mb-6 ' + cardAspect}
                    >
                      <img
                        src={resolveImageUrl(item.url || item.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
                        alt={item.title || 'Salon Gallery Photo'}
                        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                        onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                      />

                      {/* Multi-tier dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none" />

                      {/* Top Category Badge */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="px-3 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-stone-200 text-[10px] font-bold uppercase tracking-wider border border-stone-700/80 shadow-md">
                          {item.category || (selectedType === 'bridal' ? 'Royal Bridal' : 'Artistry')}
                        </span>
                      </div>

                      {/* Bottom Editorial Caption */}
                      <div className="relative p-4 sm:p-5 space-y-1 text-white z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                        <h4 className="font-serif font-bold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-rose-200 transition-colors drop-shadow-md">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] sm:text-xs text-stone-300 line-clamp-2 font-light drop-shadow-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                            {item.description}
                          </p>
                        )}
                        <div className="pt-1 flex items-center text-[10px] text-rose-300 font-semibold tracking-wide opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="w-3.5 h-3.5 mr-1 text-rose-400" />
                          <span>View Full Photograph &rarr;</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 5. BEFORE & AFTER (DEDICATED SECTION - HIDDEN IN BRIDAL MODE) */}
          {/* ========================================================================= */}
          {transformationList.length > 0 && selectedType !== 'bridal' && (selectedType === 'all' || selectedType === 'before-after') && (
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
                  Trusted by hundreds of brides across Rajasthan for flawless HD bridal makeup, luxury poshak draping, and clinical skincare.
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs uppercase tracking-wider transition-colors w-full sm:w-auto"
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
                {selectedType === 'bridal'
                  ? 'Reserve Your Once-In-A-Lifetime Bridal Look'
                  : 'Your next transformation starts here.'}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base font-light">
                {selectedType === 'bridal'
                  ? 'Dates for 2026-2027 weddings fill quickly. Book your trial consultation with Anu Saini today.'
                  : 'Explore the artistry. Choose your experience. Make your appointment.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <a
                href="https://wa.me/919667900313?text=Hi%20Enrich%20Salon,%20I%20would%20like%20to%20book%20an%20appointment."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 mr-2 fill-current" />
                <span>BOOK ON WHATSAPP</span>
              </a>

              <button
                onClick={handleWhatsAppChat}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>{selectedType === 'bridal' ? 'CHAT WITH ANU SAINI' : 'CHAT ON WHATSAPP'}</span>
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
          videos={videoList}
          onSelectVideo={(v) => setActiveVideo(v)}
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
