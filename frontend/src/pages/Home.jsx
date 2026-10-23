import SEO from '../components/common/SEO';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER, DEFAULT_AVATAR_PLACEHOLDER } from '../utils/imageUrl';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/service.service';
import { offerService } from '../services/offer.service';
import { reviewService } from '../services/review.service';
import { mediaService } from '../services/media.service';
import { SALON_CONFIG } from '../config/salonConfig';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider';
import SocialMediaSection from '../components/SocialMediaSection';
import GoogleReviews from '../components/GoogleReviews';
import HomeReelsSection from '../components/HomeReelsSection';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import {
  Calendar,
  Lock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Play,
  Camera,
  Video,
  Eye,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Star,
  Compass,
  Car,
  Train,
  Award,
  HeartHandshake,
  Scissors,
  Sparkle
} from 'lucide-react';

const ICON_MAP = {
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Clock,
  Award,
  HeartHandshake,
  MapPin
};

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.971.53 1.77.813 2.796.813h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.075-2.09-.493-1.637-.665-2.73-2.317-2.813-2.427-.082-.11-1.002-1.332-1.002-2.54 0-1.209.636-1.803.86-2.048.225-.246.491-.307.655-.307.164 0 .328.003.47.01.15.008.351-.057.55.421.205.492.697 1.701.758 1.824.061.123.102.266.02.43-.082.163-.123.266-.246.409-.123.143-.258.32-.369.43-.123.122-.251.255-.108.5.144.246.638 1.053 1.37 1.705.942.84 1.737 1.1 1.983 1.223.246.123.389.102.533-.061.143-.164.614-.716.778-.962.164-.246.327-.205.55-.123.224.082 1.413.666 1.659.789.245.123.409.184.47.287.062.102.062.593-.082.998zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  // ---------------------------------------------------------------------------
  // Data States
  // ---------------------------------------------------------------------------
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [mediaItems, setMediaItems] = useState({ photos: [], videos: [], transformations: [], all: [] });

  // ---------------------------------------------------------------------------
  // UI & Filter States
  // ---------------------------------------------------------------------------
  const [activeServiceCategory, setActiveServiceCategory] = useState('All');
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [heroPhotoUrl, setHeroPhotoUrl] = useState('');
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Fetch dynamic data on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function loadHomepageData() {
      try {
        setIsLoading(true);

        const [
          servicesRes,
          offersRes,
          mediaRes,
          heroRes,
          ownerRes,
          allVideosRes
        ] = await Promise.allSettled([
          serviceService.getAllServices({ limit: 50 }),
          offerService.getActiveOffers(),
          mediaService.getFeaturedMedia(),
          mediaService.getHeroPhoto(),
          mediaService.getOwnerPhoto(),
          mediaService.getGalleryMedia({ type: 'video', limit: 20 })
        ]);

        if (!isMounted) return;

        // 0. Process Homepage Hero Photo
        if (heroRes?.status === 'fulfilled' && heroRes.value?.data?.url) {
          setHeroPhotoUrl(heroRes.value.data.url);
        }

        // 0b. Process Owner / About Me Photo
        if (ownerRes?.status === 'fulfilled' && ownerRes.value?.data?.url) {
          setOwnerProfile(ownerRes.value.data);
        }

        // 1. Process Services
        if (servicesRes.status === 'fulfilled' && servicesRes.value?.data?.services?.length > 0) {
          setServices(servicesRes.value.data.services.filter(s => s.isActive !== false));
        } else if (servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value?.data) && servicesRes.value.data.length > 0) {
          setServices(servicesRes.value.data.filter(s => s.isActive !== false));
        } else {
          setServices(SALON_CONFIG.defaultServices);
        }

        // 2. Process Staff / Stylists
        if (staffRes.status === 'fulfilled' && staffRes.value?.data?.staff?.length > 0) {
          setStaffList(staffRes.value.data.staff.filter(st => st.status !== 'inactive' && st.isActive !== false));
        } else if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value?.data) && staffRes.value.data.length > 0) {
          setStaffList(staffRes.value.data.filter(st => st.status !== 'inactive' && st.isActive !== false));
        } else {
          setStaffList(SALON_CONFIG.defaultStylists);
        }

        // 3. Process Offers (filter active & unexpired)
        if (offersRes.status === 'fulfilled' && offersRes.value?.data?.offers?.length > 0) {
          const now = new Date();
          const activeOffers = offersRes.value.data.offers.filter(o => {
            if (o.isActive === false) return false;
            if (o.validUntil && new Date(o.validUntil) < now) return false;
            if (o.expiryDate && new Date(o.expiryDate) < now) return false;
            return true;
          });
          setOffers(activeOffers.length > 0 ? activeOffers : SALON_CONFIG.defaultOffers);
        } else if (offersRes.status === 'fulfilled' && Array.isArray(offersRes.value?.data) && offersRes.value.data.length > 0) {
          const now = new Date();
          const activeOffers = offersRes.value.data.filter(o => {
            if (o.isActive === false) return false;
            if (o.validUntil && new Date(o.validUntil) < now) return false;
            if (o.expiryDate && new Date(o.expiryDate) < now) return false;
            return true;
          });
          setOffers(activeOffers.length > 0 ? activeOffers : SALON_CONFIG.defaultOffers);
        } else {
          setOffers(SALON_CONFIG.defaultOffers);
        }

        // 4. Process Media / Gallery (Sync with live gallery database)
        const def = SALON_CONFIG.defaultMedia || {};
        const defAll = [...(def.photos || []), ...(def.videos || []), ...(def.transformations || [])];

        let loadedMedia = null;

        // Extract all gallery video reels
        let fullVideoReels = [];
        if (allVideosRes?.status === 'fulfilled' && allVideosRes.value?.data?.media) {
          fullVideoReels = allVideosRes.value.data.media;
        } else if (allVideosRes?.status === 'fulfilled' && Array.isArray(allVideosRes.value?.data)) {
          fullVideoReels = allVideosRes.value.data;
        }

        if (mediaRes.status === 'fulfilled' && mediaRes.value) {
          const raw = mediaRes.value;
          const data = raw.data || raw;
          const photos = data.photos || (Array.isArray(data.media) ? data.media.filter(m => m.type === 'photo') : []);
          const featVideos = data.videos || (Array.isArray(data.media) ? data.media.filter(m => m.type === 'video') : []);
          const videos = fullVideoReels.length > 0 ? fullVideoReels : featVideos;
          const transformations = data.transformations || data.beforeAfters || (Array.isArray(data.media) ? data.media.filter(m => m.category === 'Before & After') : []);
          const all = (Array.isArray(data.media) && data.media.length > 0) ? data.media : [...photos, ...videos, ...transformations];

          if (all.length > 0) {
            loadedMedia = { photos, videos, transformations, all };
          }
        }

        // If featured list is empty, fallback to fetching recent gallery portfolio
        if (!loadedMedia) {
          try {
            const galleryRes = await mediaService.getGalleryMedia({ limit: 12 });
            const gData = galleryRes?.data?.media || galleryRes?.data || [];
            if (Array.isArray(gData) && gData.length > 0) {
              const photos = gData.filter(m => m.type === 'photo');
              const videos = gData.filter(m => m.type === 'video');
              const transformations = gData.filter(m => m.category === 'Before & After');
              loadedMedia = { photos, videos, transformations, all: gData };
            }
          } catch (gErr) {
            console.warn('Fallback gallery fetch error:', gErr);
          }
        }

        if (loadedMedia) {
          setMediaItems(loadedMedia);
        } else {
          setMediaItems({ ...def, all: defAll });
        }

      } catch (err) {
        console.error('Error fetching homepage dynamic resources:', err);
        if (isMounted) {
          setServices(SALON_CONFIG.defaultServices);
          setStaffList(SALON_CONFIG.defaultStylists);
          setOffers(SALON_CONFIG.defaultOffers);
          setReviews(SALON_CONFIG.defaultReviews);
          const defCatch = SALON_CONFIG.defaultMedia || {};
          const defCatchAll = [...(defCatch.photos || []), ...(defCatch.videos || []), ...(defCatch.transformations || [])];
          setMediaItems({ ...defCatch, all: defCatchAll });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHomepageData();

    return () => {
      isMounted = false;
    };
  }, []);
  // Dynamic categories
  const serviceCategories = useMemo(() => {
    const defaultCategories = ['All', 'Hair', 'Makeup', 'Skin', 'Nails', 'Bridal'];
    const dynamicSet = new Set(defaultCategories);
    services.forEach(s => {
      if (s.category && typeof s.category === 'string') {
        dynamicSet.add(s.category.trim());
      }
    });
    return Array.from(dynamicSet);
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeServiceCategory === 'All') {
      return services.slice(0, 8);
    }
    return services.filter(
      s => s.category && s.category.toLowerCase() === activeServiceCategory.toLowerCase()
    );
  }, [services, activeServiceCategory]);

  const heroFeaturedServices = useMemo(() => {
    return services.slice(0, 3);
  }, [services]);

  const galleryCategories = [
    'All',
    'Photos',
    'Videos',
    'Before & After',
    'Hair',
    'Makeup',
    'Skin',
    'Bridal',
    'Nails'
  ];

  const filteredGalleryMedia = useMemo(() => {
    const all =
      (mediaItems.all && mediaItems.all.length > 0)
        ? mediaItems.all
        : [...(mediaItems.photos || []), ...(mediaItems.videos || []), ...(mediaItems.transformations || [])];

    if (activeGalleryCategory === 'All') {
      return all;
    }
    if (activeGalleryCategory === 'Photos') {
      return all.filter(
        m => (m.type === 'photo' || m.mediaType === 'photo' || (!m.duration && !m.videoUrl && !m.beforeAfter && !m.beforeImage)) && !m.duration
      );
    }
    if (activeGalleryCategory === 'Videos') {
      return all.filter(
        m => m.type === 'video' || m.mediaType === 'video' || m.duration > 0 || m.videoUrl
      );
    }
    if (activeGalleryCategory === 'Before & After') {
      return all.filter(
        m => m.category === 'Before & After' || m.type === 'before_after' || m.mediaType === 'before_after' || m.beforeAfter?.beforeUrl || m.beforeImage
      );
    }

    return all.filter((m) => {
      const cat = (m.category || '').toLowerCase();
      const target = activeGalleryCategory.toLowerCase();
      if (target === 'skin') return cat.includes('skin');
      if (target === 'hair') return cat.includes('hair');
      if (target === 'makeup') return cat.includes('makeup');
      if (target === 'bridal') return cat.includes('bridal');
      if (target === 'nails') return cat.includes('nail');
      return cat === target;
    });
  }, [mediaItems, activeGalleryCategory]);

  const lightboxMediaList = useMemo(() => {
    return filteredGalleryMedia.filter(
      m => m.mediaType === 'photo' || (!m.mediaType && !m.videoUrl && !m.beforeImage)
    );
  }, [filteredGalleryMedia]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="pb-20 bg-stone-50/50 text-stone-900 font-sans">
      <SEO
        title="Enrich Ladies Beauty Parlor & Cosmetic Clinic | Best Salon in Sikar (4.9★)"
        description="Top-rated salon in Sikar with 512+ 5-star Google reviews. Specializing in HD bridal makeup, hydrafacial, hair styling, and clinical skincare at Sharda Heights."
        url="/"
      />

      {/* =========================================================================
          SECTION 1: HERO SECTION (LUMINOUS LUXURY ATELIER)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#FAF5EE] to-[#F5EFEB] text-stone-900 py-10 sm:py-16 lg:py-18 border-b border-stone-200/90">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                {/* Location Masthead Kicker */}
                <a
                  href={SALON_CONFIG.contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Enrich Salon location on Google Maps"
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-200/90 hover:border-rose-300 text-stone-700 hover:text-stone-900 text-xs font-semibold tracking-wide transition-all shadow-2xs group cursor-pointer max-w-full"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span className="truncate">Sharda Heights, Chandpol, Sikar</span>
                  <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-rose-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>

                {/* Emergency Slot / Today's Availability Urgency Ticker */}
                <Link
                  to="/book"
                  title="Book one of today's remaining appointment slots"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/90 text-rose-900 text-xs font-bold tracking-wide transition-all shadow-2xs group cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                  <span>Today's Availability: <span className="underline decoration-rose-300 underline-offset-2">Only 3 slots left</span></span>
                  <ArrowRight className="w-3 h-3 text-rose-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-stone-900 leading-[1.08]">
                Your Beauty,{' '}
                <span className="font-normal font-serif text-rose-900 italic">
                  Our Artistry
                </span>
              </h1>

              {/* Short Business Description */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Discover personalized beauty and clinical skincare in Sikar. From expert hairstyling and HD bridal transformations to rejuvenating skincare rituals, we're here to help you look and feel radiant.
              </p>

              {/* Clean Primary Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  to="/book"
                  id="hero-book-cta"
                  className="btn-rose w-full sm:w-auto px-8 py-3.5 text-sm font-bold shadow-md shadow-rose-950/15"
                >
                  <Calendar className="w-4 h-4 mr-2 text-rose-200" />
                  Book Appointment
                </Link>

                <a
                  href="#services"
                  id="hero-services-cta"
                  className="btn-secondary w-full sm:w-auto px-7 py-3.5 text-sm"
                >
                  View Services & Treatments
                  <ArrowRight className="w-4 h-4 ml-2 text-stone-600" />
                </a>
              </div>

              {/* Feather-Light Status & Contact Strip */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-600 border-t border-stone-200/80 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Open Today: {SALON_CONFIG.hours.weekday}</span>
                </div>
                <span className="hidden sm:inline text-stone-300">•</span>
                <a
                  href={SALON_CONFIG.contact.phoneTel}
                  className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-rose-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-700" />
                  <span>{SALON_CONFIG.contact.phone}</span>
                </a>
              </div>

            </div>

            {/* Right Column: Luxury Editorial Showcase with Floating Social Proof */}
            <div className="lg:col-span-5 w-full">
              <div className="relative mx-auto max-w-md lg:max-w-none">

                {/* Visual Frame - Complete Image Uncropped */}
                <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xl bg-stone-900/5 group flex items-center justify-center">
                  <img
                    src={resolveImageUrl(
                      heroPhotoUrl || SALON_CONFIG.hero?.imageUrl || mediaItems[1]?.url || SALON_CONFIG.defaultMedia.photos[1]?.url,
                      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80'
                    )}
                    alt="Enrich Beauty Parlour & Aesthetic Clinic Sikar"
                    className="w-full h-auto block rounded-3xl object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                  />
                </div>

                {/* Below Photo: Social Proof Review & 1-Tap Deep Link Category Chips */}
                <div className="space-y-3 pt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border border-stone-200/90 shadow-2xs text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-bold text-stone-900">4.9 ★ Google Rated</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-500 text-[11px]">510+ Verified Client Reviews</span>
                  </div>

                  {/* 1-Tap Service Deep Link Category Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                      { label: 'Royal Bridal', cat: 'Bridal', link: '/services?category=Bridal', bookLink: '/book?service=Bridal', icon: Sparkles },
                      { label: 'Hydrafacial & Skin', cat: 'Skin', link: '/services?category=Skin', bookLink: '/book?service=Skin', icon: Sparkle },
                      { label: 'Balayage & Hair', cat: 'Hair', link: '/services?category=Hair', bookLink: '/book?service=Hair', icon: Scissors },
                      { label: 'Nail Atelier', cat: 'Nails', link: '/services?category=Nails', bookLink: '/book?service=Nails', icon: Star }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.bookLink}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-rose-50 text-stone-800 hover:text-rose-800 border border-stone-200/90 hover:border-rose-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                          title={`Book ${item.label} appointment`}
                        >
                          <Icon className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                          <span>{item.label}</span>
                          <span className="text-[10px] text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1B: STUDIO VIDEO REELS & TRANSFORMATIONS (4 SHORT 4K REELS)
          ========================================================================= */}
      <HomeReelsSection
        videos={mediaItems.videos || []}
        onSelectVideo={(video) => setActiveVideo(video)}
      />

      {/* =========================================================================
          SECTION 2: GALLERY / PARLOUR MEDIA (LUMINOUS STUDIO SHOWCASE)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#FAF7F2] text-stone-900 py-12 sm:py-16 lg:py-20 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-stone-200/90 pb-6 sm:pb-7">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                Studio Portfolio
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
                Salon Portfolio & Gallery
              </h2>
            </div>

            <Link
              to="/gallery"
              className="inline-flex items-center text-xs sm:text-sm font-bold text-rose-700 hover:text-rose-800 shrink-0 group transition-colors py-1"
            >
              View Complete Gallery
              <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Gallery Category Filter Tabs */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {galleryCategories.map((cat) => {
              const isActive = activeGalleryCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveGalleryCategory(cat)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/90 shadow-2xs hover:shadow-xs'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Media Items Grid */}
          {filteredGalleryMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {filteredGalleryMedia.slice(0, 6).map((item, idx) => {
                const isVideo = item.type === 'video' || item.mediaType === 'video' || item.duration > 0 || !!item.videoUrl;
                const isTransformation = item.category === 'Before & After' || item.type === 'before_after' || (item.beforeAfter?.beforeUrl && item.beforeAfter?.afterUrl);
                const thumbUrl = resolveImageUrl(
                  item.type === 'photo'
                    ? (item.url || item.thumbnail)
                    : (item.thumbnail || item.url || item.beforeAfter?.beforeUrl || item.beforeImage),
                  DEFAULT_SALON_PLACEHOLDER
                );

                // Transformation component handling
                if (isTransformation) {
                  return (
                    <div key={item._id || idx} className="rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-white">
                      <BeforeAfterSlider
                        beforeImage={resolveImageUrl(item.beforeAfter?.beforeUrl || item.beforeImage, DEFAULT_SALON_PLACEHOLDER)}
                        afterImage={resolveImageUrl(item.beforeAfter?.afterUrl || item.afterImage, DEFAULT_SALON_PLACEHOLDER)}
                        title={item.title || 'Salon Transformation'}
                        category={item.category || 'Before & After'}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={item._id || idx}
                    className="group relative bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    onClick={() => {
                      if (isVideo) {
                        setActiveVideo(item);
                      } else {
                        const photoIndex = lightboxMediaList.findIndex(m => m._id === item._id || m.url === item.url);
                        setLightboxIndex(photoIndex >= 0 ? photoIndex : 0);
                      }
                    }}
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative aspect-[4/4.5] sm:aspect-[4/4.8] sm:h-80 md:h-88 lg:h-96 w-full overflow-hidden bg-stone-900">
                      {isVideo && (!item.thumbnail || item.thumbnail.includes('.mp4') || item.thumbnail.includes('.webm') || item.thumbnail === item.url) ? (
                        <video
                          src={resolveImageUrl(item.url || item.videoUrl)}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        />
                      ) : (
                        <img
                          src={thumbUrl}
                          alt={item.title || 'Parlour gallery photo'}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 border border-stone-200 text-stone-800 backdrop-blur-xs shadow-xs">
                          {item.category || 'Studio'}
                        </span>

                        {isVideo && (
                          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center shadow-xs">
                            <Video className="w-3 h-3 mr-1.5" />
                            {item.duration ? `${item.duration}s` : 'Video'}
                          </span>
                        )}
                      </div>

                      {/* Play or View Overlay Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isVideo ? (
                          <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl backdrop-blur-xs">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/95 text-stone-900 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all border border-stone-200 shadow-xl backdrop-blur-xs">
                            <Eye className="w-5 h-5 text-rose-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="p-5 bg-white border-t border-stone-100/90 space-y-1 min-h-[72px] flex flex-col justify-center">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-rose-700 transition-colors line-clamp-1">
                        {item.title || 'Studio Showcase'}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-stone-500 line-clamp-1 font-light leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs my-6">
              <Camera className="w-9 h-9 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">
                No gallery media found for "{activeGalleryCategory}".
              </p>
            </div>
          )}

        </div>
      </section>

      {/* CONTAINERIZED HOMEPAGE SECTIONS */}
      <div className="space-y-16 sm:space-y-24 pt-14 sm:pt-20">
        {/* =========================================================================
          SECTION 3: POPULAR SERVICES & CATEGORY FILTERING
          ========================================================================= */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-10">
        <div className="border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-wide text-rose-700 uppercase">
              Treatment Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Popular Services & Treatments
            </h2>
          </div>
        </div>

        {/* Category Tabs & Explore All Link Unified Row (Issue #10) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pb-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {serviceCategories.map((cat) => {
              const isActive = activeServiceCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveServiceCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <Link
            to="/services"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 shrink-0 group whitespace-nowrap pl-2"
          >
            <span>Explore All Services</span>
            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Service Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service, idx) => {
                            const imageUrl =
                service.images?.[0]?.url ||
                service.image ||
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={service._id || idx}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={imageUrl}
                        alt={service.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white/95 text-stone-900 shadow-xs border border-stone-200/60 backdrop-blur-xs">
                          {service.category || 'Specialty'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          {service.duration || 45} mins
                        </span>
                        <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          Salon Service
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-rose-700 transition-colors line-clamp-1">
                        {service.name}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-light">
                        {service.description || 'High-standard aesthetic service performed by certified beauticians.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="p-5 pt-0 border-t border-stone-100 mt-2 space-y-2">
                    <a
                      href={`https://wa.me/919667900313?text=${encodeURIComponent(
                        `Hi Enrich Salon, I would like to book an appointment for "${service.name}". Please let me know available slots.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-all duration-200 mt-2.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Book on WhatsApp</span>
                    </a>
                    <Link
                      to={`/book?service=${service._id || encodeURIComponent(service.name)}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-medium rounded-lg text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors"
                    >
                      <Calendar className="w-3 h-3 text-rose-600" />
                      <span>Or Book Online Calendar</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <p className="text-xs text-stone-500">
              No services currently available under the `{activeServiceCategory}` category.
            </p>
            <button
              onClick={() => setActiveServiceCategory('All')}
              className="text-xs font-semibold text-rose-700 underline cursor-pointer"
            >
              View all services
            </button>
          </div>
        )}
      </section>
            {/* =========================================================================
          SECTION 4: OWNER PROFILE & ABOUT ME (FOUNDER SPOTLIGHT)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 lg:p-12 shadow-xl shadow-stone-900/5 relative overflow-hidden">

          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">

            {/* Left Column: Large Owner Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-stone-900/10 group bg-stone-900">
                <img
                  src={resolveImageUrl(
                    ownerProfile?.url || DEFAULT_AVATAR_PLACEHOLDER,
                    DEFAULT_AVATAR_PLACEHOLDER
                  )}
                  alt={ownerProfile?.title || 'Anu Saini - Enrich Salon Founder & Lead Aesthetician'}
                  loading="lazy"
                  onError={(e) => handleImageError(e, DEFAULT_AVATAR_PLACEHOLDER)}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Top Editorial Distinction Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-stone-950/75 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Master Cosmetologist</span>
                </div>

                {/* Gradient vignette for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

                {/* Floating Aesthetic Seal Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-2xl shadow-stone-950/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-serif font-bold text-stone-900 leading-snug truncate">
                        Anu Saini
                      </p>
                      <p className="text-[11px] font-semibold text-rose-700 tracking-wider uppercase truncate">
                        Founder &amp; Master Aesthetician
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Master
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Founder Story & Description */}
            <div className="lg:col-span-7 space-y-6 text-left">

              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest text-rose-800 uppercase bg-rose-50 border border-rose-200/80 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  About the Founder • Enrich Sikar
                </span>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
                  {ownerProfile?.title || 'Crafting Confidence, Redefining Elegance'}
                </h2>

                <div className="flex items-center gap-3">
                  <div className="h-0.5 w-8 bg-gradient-to-r from-rose-600 to-amber-500 rounded-full" />
                  <p className="text-xs sm:text-sm font-semibold tracking-wider text-rose-700 uppercase">
                    Anu Saini • Founder &amp; Lead Aesthetician
                  </p>
                </div>
              </div>

              {/* Story Body */}
              <div className="text-stone-600 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
                {ownerProfile?.description ? (
                  ownerProfile.description.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))
                ) : (
                  <>
                    <p>
                      Welcome to Enrich Beauty Parlour &amp; Cosmetic Clinic. Founded with an unwavering commitment to combining modern hair design, high-definition bridal artistry, and clinical skincare precision, my mission has always been to elevate personal confidence.
                    </p>
                    <p>
                      Every treatment begins with a personal 1-on-1 assessment to understand your skin tone, hair integrity, and aesthetic aspirations. Under strict medical-grade hygiene and sterilization standards, our certified team delivers personalized beauty rituals that leave you glowing inside and out.
                    </p>
                  </>
                )}
              </div>

              {/* Key Highlights / Badges */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-rose-50/25 border border-stone-200/80 hover:border-rose-300 hover:shadow-md transition-all duration-300 text-center group">
                  <span className="block font-serif font-bold text-xl sm:text-3xl text-stone-900 group-hover:text-rose-700 transition-colors">
                    12+
                  </span>
                  <span className="text-[11px] sm:text-xs text-stone-600 font-medium">
                    Years Experience
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-rose-50/25 border border-stone-200/80 hover:border-rose-300 hover:shadow-md transition-all duration-300 text-center group">
                  <span className="block font-serif font-bold text-xl sm:text-3xl text-stone-900 group-hover:text-rose-700 transition-colors">
                    5,000+
                  </span>
                  <span className="text-[11px] sm:text-xs text-stone-600 font-medium">
                    Happy Clients
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-rose-50/25 border border-stone-200/80 hover:border-rose-300 hover:shadow-md transition-all duration-300 text-center group">
                  <span className="block font-serif font-bold text-xl sm:text-3xl text-stone-900 group-hover:text-rose-700 transition-colors">
                    100%
                  </span>
                  <span className="text-[11px] sm:text-xs text-stone-600 font-medium">
                    Certified Hygiene
                  </span>
                </div>
              </div>

              {/* Action Buttons & Direct WhatsApp Consultation */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://wa.me/919667900313?text=Hi%20Anu%2C%20I%20would%20like%20to%20consult%20with%20you%20at%20Enrich%20Beauty%20Parlour."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <WhatsAppIcon className="w-5 h-5 fill-current" />
                    <span>Chat with Anu Saini on WhatsApp</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </a>

                  <Link
                    to="/gallery"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-stone-300 hover:border-rose-300 bg-white hover:bg-rose-50/40 text-stone-800 text-xs sm:text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-2xs group"
                  >
                    <Camera className="w-4 h-4 text-rose-600" />
                    <span>Explore Bridal Gallery</span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>

                {/* Trust Badges Bar */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-1 text-[11px] sm:text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Medical-Grade Sterilization
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-600">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Personal 1-on-1 Skin &amp; Hair Analysis
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    Piprali Road, Sikar
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
{/* =========================================================================
          SECTION 8: SOCIAL MEDIA SECTION (Follow Our Journey)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SocialMediaSection />
      </section>

      {/* =========================================================================
          SECTION: GOOGLE BUSINESS REVIEWS & RATINGS (GENUINE GOOGLE PLACES API)
          ========================================================================= */}
      <GoogleReviews className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

      {/* =========================================================================
            SECTION 10: LOCATION & VISIT INFORMATION
            ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Location Text Information */}
            <div className="lg:col-span-6 p-8 sm:p-10 space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                  Studio Location
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Visiting {SALON_CONFIG.business.name}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-light">
                  Conveniently situated in Sikar with dedicated customer parking and easy road access.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <a
                  href={SALON_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-rose-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-semibold text-stone-900 group-hover:text-rose-700 transition-colors">Address</p>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">{SALON_CONFIG.contact.address}</p>
                  </div>
                </a>

                <div className="flex items-start space-x-3 p-2 -mx-2">
                  <Train className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Transit & Access</p>
                    <p className="text-stone-600 mt-0.5">
                      {SALON_CONFIG.location.transitHint}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2 -mx-2">
                  <Car className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Parking</p>
                    <p className="text-stone-600 mt-0.5">
                      {SALON_CONFIG.location.parkingHint}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2 -mx-2">
                  <Phone className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Concierge Desk</p>
                    <a href={SALON_CONFIG.contact.phoneTel} className="text-stone-600 hover:text-rose-700 font-medium mt-0.5 block">
                      {SALON_CONFIG.contact.phone} | {SALON_CONFIG.contact.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={SALON_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Compass className="w-4 h-4 mr-1.5" />
                  Open in Google Maps
                </a>

                <a
                  href={SALON_CONFIG.contact.phoneTel}
                  className="inline-flex items-center px-5 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  <Phone className="w-4 h-4 mr-1.5 text-rose-700" />
                  Call Desk (96679 00313)
                </a>
              </div>
            </div>

            {/* Interactive Google Map Embed Card */}
            <div className="lg:col-span-6 bg-stone-100 border-t lg:border-t-0 lg:border-l border-stone-200/90 relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-between overflow-hidden">
              <iframe
                title="Enrich Beauty Parlour & Cosmetic Clinic Location Map"
                src={SALON_CONFIG.location.mapEmbedUrl || 'https://maps.google.com/maps?q=Sharda+Heights,+near+Ramlila+Maidan,+Chandpol,+Sikar,+Rajasthan+332001&t=&z=16&ie=UTF8&iwloc=&output=embed'}
                className="w-full h-full min-h-[340px] grow border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-3.5 bg-white/95 backdrop-blur-md border-t border-stone-200/90 flex items-center justify-between gap-3 z-10">
                <div className="flex items-center space-x-2 text-xs text-stone-700 min-w-0">
                  <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
                  <span className="truncate font-semibold">{SALON_CONFIG.contact.addressShort}</span>
                </div>
                <a
                  href={SALON_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center shrink-0"
                >
                  Get Directions
                  <ArrowRight className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: APPOINTMENT CTA (ROYAL BERRY LUXURY BANNER)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#2E1822] via-[#481E2C] to-[#1C0E15] text-white p-8 sm:p-14 text-center space-y-6 border border-rose-900/40 shadow-2xl shadow-rose-950/20 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="text-xs font-bold tracking-widest text-rose-300 uppercase block">
              Appointments & Consultations
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">
              Reserve Your Salon Visit
            </h2>
            <p className="text-stone-300 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed font-light">
              Select your preferred service, choose your specialist, and confirm your appointment with real-time schedule verification.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link
              to="/book"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-xs sm:text-sm font-bold text-rose-950 bg-white hover:bg-rose-50 transition-all shadow-xl hover:shadow-2xl cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4 mr-2 text-rose-700" />
              Book Appointment Online
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-7 py-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-xs transition-all cursor-pointer active:scale-95"
            >
              <Phone className="w-4 h-4 mr-2 text-rose-300" />
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>

            </div>

      {/* =========================================================================
          MODALS & LIGHTBOX (PhotoLightbox & VideoModal)
          ========================================================================= */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          mediaList={lightboxMediaList.length > 0 ? lightboxMediaList : []}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          videos={mediaItems.videos || []}
          onSelectVideo={(v) => setActiveVideo(v)}
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
