import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/service.service';
import { staffService } from '../services/staff.service';
import { offerService } from '../services/offer.service';
import { reviewService } from '../services/review.service';
import { mediaService } from '../services/media.service';
import { SALON_CONFIG } from '../config/salonConfig';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider';
import SocialMediaSection from '../components/SocialMediaSection';
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
  Copy,
  Check,
  Star,
  Compass,
  Car,
  Train,
  Award,
  HeartHandshake
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

export default function Home() {
  const { isAuthenticated } = useAuth();
  // ---------------------------------------------------------------------------
  // Data States
  // ---------------------------------------------------------------------------
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mediaItems, setMediaItems] = useState({
    photos: [],
    videos: [],
    transformations: [],
    all: []
  });

  // ---------------------------------------------------------------------------
  // UI & Filter States
  // ---------------------------------------------------------------------------
  const [activeServiceCategory, setActiveServiceCategory] = useState('All');
  const [activeGalleryCategory, setActiveGalleryCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
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
          staffRes,
          offersRes,
          reviewsRes,
          mediaRes
        ] = await Promise.allSettled([
          serviceService.getAllServices({ limit: 50 }),
          staffService.getStaff({ limit: 12 }),
          offerService.getActiveOffers(),
          reviewService.getPublicReviews({ limit: 8 }),
          mediaService.getFeaturedMedia()
        ]);

        if (!isMounted) return;

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

        // 4. Process Reviews (published only)
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.reviews?.length > 0) {
          const published = reviewsRes.value.data.reviews.filter(r => r.isApproved !== false && r.isPublished !== false);
          setReviews(published.length > 0 ? published : SALON_CONFIG.defaultReviews);
        } else if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value?.data) && reviewsRes.value.data.length > 0) {
          const published = reviewsRes.value.data.filter(r => r.isApproved !== false && r.isPublished !== false);
          setReviews(published.length > 0 ? published : SALON_CONFIG.defaultReviews);
        } else {
          setReviews(SALON_CONFIG.defaultReviews);
        }

        // 5. Process Media / Gallery
        if (mediaRes.status === 'fulfilled' && mediaRes.value?.data) {
          const data = mediaRes.value.data;
          const photos = data.photos || [];
          const videos = data.videos || [];
          const transformations = data.transformations || [];
          const all = [...photos, ...videos, ...transformations];
          if (all.length > 0) {
            setMediaItems({ photos, videos, transformations, all });
          } else {
            setMediaItems(SALON_CONFIG.defaultMedia);
          }
        } else {
          setMediaItems(SALON_CONFIG.defaultMedia);
        }

      } catch (err) {
        console.error('Error fetching homepage dynamic resources:', err);
        if (isMounted) {
          setServices(SALON_CONFIG.defaultServices);
          setStaffList(SALON_CONFIG.defaultStylists);
          setOffers(SALON_CONFIG.defaultOffers);
          setReviews(SALON_CONFIG.defaultReviews);
          setMediaItems(SALON_CONFIG.defaultMedia);
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
    const all = mediaItems.all || [];
    if (activeGalleryCategory === 'All') {
      return all;
    }
    if (activeGalleryCategory === 'Photos') {
      return all.filter(m => m.mediaType === 'photo' || (!m.mediaType && !m.videoUrl && !m.beforeImage));
    }
    if (activeGalleryCategory === 'Videos') {
      return all.filter(m => m.mediaType === 'video' || m.videoUrl);
    }
    if (activeGalleryCategory === 'Before & After') {
      return all.filter(m => m.mediaType === 'before_after' || (m.beforeImage && m.afterImage));
    }
    return all.filter(
      m => m.category && m.category.toLowerCase() === activeGalleryCategory.toLowerCase()
    );
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
    <div className="space-y-16 sm:space-y-24 pb-20 bg-stone-50/50 text-stone-900 font-sans">
      
      {/* =========================================================================
          SECTION 1: HERO SECTION (LUMINOUS LUXURY ATELIER)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#FAF5EE] to-[#F5EFEB] text-stone-900 py-16 sm:py-24 border-b border-stone-200/90">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Location Badge (Clickable link to Google Maps) */}
              <a
                href={SALON_CONFIG.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View Enrich Salon location on Google Maps"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/95 hover:bg-rose-50/80 backdrop-blur-md border border-stone-200/90 hover:border-rose-300 text-stone-700 hover:text-rose-800 text-xs font-semibold tracking-wide shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group max-w-full"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-xs sm:max-w-md md:max-w-lg">{SALON_CONFIG.business.badge}</span>
                <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-stone-900 leading-[1.08]">
                Precision Hair, Skin &{' '}
                <span className="italic font-normal font-serif bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 bg-clip-text text-transparent">
                  Clinical Beauty
                </span>
              </h1>

              {/* Short Business Description */}
              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                {SALON_CONFIG.business.description}
              </p>

              {/* CTAs */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/book"
                  id="hero-book-cta"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:from-rose-700 hover:to-rose-900 transition-all duration-300 shadow-lg shadow-rose-900/15 hover:shadow-xl hover:shadow-rose-900/25 cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4 mr-2 text-rose-200" />
                  Book Appointment
                </Link>

                <a
                  href="#services"
                  id="hero-services-cta"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl text-sm font-bold text-stone-800 bg-white/95 hover:bg-white border border-stone-300/80 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                >
                  View Services
                  <ArrowRight className="w-4 h-4 ml-2 text-stone-600" />
                </a>
              </div>

              {/* Salon Hours & Concierge Info Badge */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left border-t border-stone-200/80 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-start space-x-2.5 text-xs text-stone-700 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Salon Opening Hours</span>
                    <span className="text-stone-500 text-[11px]">{SALON_CONFIG.hours.weekday}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 text-xs text-stone-700 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Direct Concierge</span>
                    <a href={SALON_CONFIG.contact.phoneTel} className="text-stone-600 hover:text-rose-700 font-medium text-[11px] transition-colors">
                      {SALON_CONFIG.contact.phone}
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Card: Featured Salon Menu */}
            <div className="lg:col-span-5 w-full">
              <div className="rounded-3xl border border-stone-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-stone-300/30 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-100/50 via-rose-50/20 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 relative z-10">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-rose-700 uppercase">
                      Featured Salon Menu
                    </span>
                    <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                      Curated Signature Treatments
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* Dynamic Featured Services List */}
                <div className="space-y-3 relative z-10">
                  {heroFeaturedServices.map((service, idx) => (
                    <div
                      key={service._id || idx}
                      className="p-3.5 rounded-2xl bg-stone-50/90 hover:bg-rose-50/40 border border-stone-200/70 hover:border-rose-200 transition-all duration-300 flex items-center justify-between gap-3 group shadow-2xs hover:shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-rose-800 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-200 uppercase tracking-wide">
                            {service.category || 'Special'}
                          </span>
                          <span className="text-xs text-stone-500 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                            {service.duration || 45} mins
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-rose-700 transition-colors mt-1.5">
                          {service.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-light">
                          {service.description || 'Specialized clinical and aesthetic service.'}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end justify-center pl-2">
                        {isAuthenticated ? (
                          <span className="text-sm font-bold text-stone-900 font-serif">
                            {SALON_CONFIG.currency.symbol}{service.price}
                          </span>
                        ) : (
                          <Link
                            to="/login?redirect=/#services"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200/80 transition-colors whitespace-nowrap"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>Sign in</span>
                          </Link>
                        )}
                        <Link
                          to={`/book?service=${service._id || encodeURIComponent(service.name)}`}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 mt-1 inline-flex items-center group-hover:translate-x-0.5 transition-all"
                        >
                          Book
                          <ArrowRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 relative z-10">
                  <span className="text-[11px]">Custom consultations available</span>
                  <Link to="/services" className="text-rose-700 font-bold hover:text-rose-800 flex items-center gap-1 transition-colors">
                    Full Price List
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: POPULAR SERVICES & CATEGORY FILTERING
          ========================================================================= */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Treatment Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Popular Services & Treatments
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
              Filter by category to explore precision haircuts, bridal makeovers, clinical skincare, and luxury nail styling.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 shrink-0 group"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {serviceCategories.map((cat) => {
            const isActive = activeServiceCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveServiceCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-stone-900 shadow-xs border border-stone-200/60 backdrop-blur-xs">
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
                        {isAuthenticated ? (
                          <span className="text-sm font-bold text-stone-900 font-mono">
                            {SALON_CONFIG.currency.symbol}{service.price}
                          </span>
                        ) : (
                          <Link
                            to="/login?redirect=/#services"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200/80 transition-colors"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>Sign in for price</span>
                          </Link>
                        )}
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
                  <div className="p-5 pt-0 border-t border-stone-100 mt-2">
                    <Link
                      to={`/book?service=${service._id || encodeURIComponent(service.name)}`}
                      className="w-full py-2.5 px-3 rounded-lg bg-stone-50 hover:bg-stone-900 text-stone-800 hover:text-white border border-stone-200 hover:border-stone-900 text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs mt-3 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Book Appointment
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
          SECTION 3: ABOUT SECTION & STATS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-xs space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                About Enrich
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                Where Salon Artistry Meets Clinical Precision
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Founded with a vision to combine modern hair styling, bespoke bridal aesthetics, and evidence-backed skincare, Enrich Beauty Parlour & Cosmetic Clinic delivers tailored transformations under strict hygiene and sterilization protocols.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Every consultation begins with a personal assessment by our certified beauticians and cosmetic specialists to ensure your wellness, skin tone, and hair integrity are prioritized above all.
              </p>
            </div>

            {/* Configurable Stats Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {SALON_CONFIG.aboutStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 text-center space-y-1 shadow-2xs hover:bg-stone-100/60 transition-colors"
                >
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-stone-900 font-mono">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-stone-800 block">
                    {stat.label}
                  </span>
                  <span className="text-[11px] text-stone-400 block">
                    {stat.description}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WHY CHOOSE US / STANDARDS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
            Quality Assured
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Professional Care & Clean Standards
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            We hold ourselves to rigorous clinical hygiene, professional grade ingredients, and continuous specialist education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SALON_CONFIG.standards.map((standard, idx) => {
            const IconComponent = ICON_MAP[standard.icon] || ShieldCheck;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200 p-6 space-y-3 shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900">
                    {standard.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1 font-light">
                    {standard.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: STYLISTS / SPECIALISTS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Specialists & Artists
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Meet Our Certified Team
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
              Book your session directly with our master colorists, skincare clinicians, and makeup artists.
            </p>
          </div>

          <Link
            to="/staff"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 shrink-0 group"
          >
            All Staff Profiles
            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffList.map((staff, idx) => {
            const avatarUrl =
              staff.avatar?.url ||
              staff.avatar ||
              staff.image ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

            const specializations = staff.specialization
              ? (Array.isArray(staff.specialization) ? staff.specialization : [staff.specialization])
              : (staff.specializations || ['Master Stylist']);

            return (
              <div
                key={staff._id || idx}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo */}
                  <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                    <img
                      src={avatarUrl}
                      alt={staff.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-stone-900/30" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-stone-900 border border-stone-200/60 backdrop-blur-xs">
                        {specializations[0]}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-rose-700 transition-colors">
                        {staff.name}
                      </h3>
                      {staff.experience && (
                        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {staff.experience} yrs
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-light">
                      {staff.bio || 'Dedicated beauty specialist committed to providing bespoke parlour services.'}
                    </p>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {specializations.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Book with Stylist CTA */}
                <div className="p-5 pt-0 border-t border-stone-100 mt-2">
                  <Link
                    to={`/book?staff=${staff._id || encodeURIComponent(staff.name)}`}
                    className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs mt-3 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                    Book with {staff.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: OFFERS & PROMOTIONS
          ========================================================================= */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                Special Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                Offers & Seasonal Packages
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
                Take advantage of limited-time discounts on beauty treatments and comprehensive bridal packages.
              </p>
            </div>

            <Link
              to="/offers"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 shrink-0 group"
            >
              View All Promotions
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer, idx) => {
              const isCopied = copiedCode === offer.code;
              return (
                <div
                  key={offer._id || idx}
                  className="bg-white rounded-xl border border-rose-200/80 p-6 space-y-4 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 pointer-events-none transition-transform group-hover:scale-110" />
                  
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                        {offer.discountType === 'percentage'
                          ? `${offer.discountValue || 15}% OFF`
                          : `${SALON_CONFIG.currency.symbol}${offer.discountValue || 200} OFF`}
                      </span>
                      {offer.validUntil && (
                        <span className="text-[11px] text-stone-400 font-mono flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-stone-400" />
                          Exp: {new Date(offer.validUntil).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-rose-700 transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed font-light">
                      {offer.description}
                    </p>
                  </div>

                  {/* Promo Code & Action */}
                  <div className="relative z-10 pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <code className="text-xs font-mono font-bold text-stone-800 tracking-wider pl-1">
                        {offer.code}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.code)}
                        className="inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <Link
                      to={`/book?promoCode=${offer.code}`}
                      className="w-full py-2.5 px-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Book with Promo Code
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {/* =========================================================================
          SECTION 7: GALLERY / PARLOUR MEDIA (LUMINOUS STUDIO SHOWCASE)
          ========================================================================= */}
      <section className="bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#FAF7F2] text-stone-900 py-16 sm:py-24 border-y border-stone-200/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/90 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                Studio Portfolio
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                Lookbook & Parlour Media
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                Browse our real salon transformations, high-definition photo gallery, video tutorials, and bridal looks.
              </p>
            </div>

            <Link
              to="/gallery"
              className="inline-flex items-center text-xs sm:text-sm font-bold text-rose-700 hover:text-rose-800 shrink-0 group"
            >
              Full Media Archive
              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Gallery Category Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {galleryCategories.map((cat) => {
              const isActive = activeGalleryCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveGalleryCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/90 shadow-2xs'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Media Items Grid */}
          {filteredGalleryMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleryMedia.slice(0, 6).map((item, idx) => {
                const isVideo = item.mediaType === 'video' || !!item.videoUrl;
                const isTransformation = item.mediaType === 'before_after' || (!!item.beforeImage && !!item.afterImage);
                const thumbUrl = item.thumbnail || item.url || item.afterImage || item.beforeImage || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80';

                // Transformation component handling
                if (isTransformation) {
                  return (
                    <div key={item._id || idx} className="rounded-3xl overflow-hidden shadow-md border border-stone-200 bg-white">
                      <BeforeAfterSlider
                        beforeImage={item.beforeImage}
                        afterImage={item.afterImage}
                        title={item.title || 'Salon Transformation'}
                        category={item.category || 'Before & After'}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={item._id || idx}
                    className="group relative bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
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
                    <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                      <img
                        src={thumbUrl}
                        alt={item.title || 'Parlour gallery photo'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 border border-stone-200 text-stone-800 backdrop-blur-xs shadow-xs">
                          {item.category || 'Studio'}
                        </span>
                        
                        {isVideo && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center shadow-xs">
                            <Video className="w-3 h-3 mr-1" />
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
                    <div className="p-5 bg-white border-t border-stone-100">
                      <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-rose-700 transition-colors truncate">
                        {item.title || 'Studio Showcase'}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-light">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3 shadow-xs">
              <Camera className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">
                No gallery media found for "{activeGalleryCategory}".
              </p>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          SECTION 8: SOCIAL MEDIA SECTION (Follow Our Journey)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SocialMediaSection />
      </section>

      {/* =========================================================================
          SECTION 9: CLIENT REVIEWS & EXPERIENCES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Client Experiences & Reviews
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Read verified feedback from clients who have experienced our cosmetic clinic and beauty treatments.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((item, idx) => {
              const rating = item.rating || 5;
              return (
                <div
                  key={item._id || idx}
                  className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Star Rating */}
                    <div className="flex items-center space-x-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic font-serif font-normal">
                      "{item.review || item.comment || 'Exceptional service and warm hospitality!'}"
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-900 block">
                        {item.customerName || item.author || (item.user?.name) || 'Verified Client'}
                      </span>
                      {item.service && (
                        <span className="text-[11px] text-stone-400">
                          {typeof item.service === 'object' ? item.service.name : item.service}
                        </span>
                      )}
                    </div>
                    {item.isVerified !== false && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200">
              <Star className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Verified Client Reviews</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Reviews are collected directly from clients who have completed an appointment.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 10: LOCATION & VISIT INFORMATION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Location Text Information */}
            <div className="lg:col-span-6 p-8 sm:p-10 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                  Studio Location
                </span>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  Visiting {SALON_CONFIG.business.name}
                </h2>
                <p className="text-xs text-stone-500">
                  Conveniently situated in Sikar with dedicated parking and elevator access.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Address</p>
                    <p className="text-stone-600 mt-0.5">{SALON_CONFIG.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Train className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Transit & Access</p>
                    <p className="text-stone-600 mt-0.5">
                      {SALON_CONFIG.location.transitHint}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Parking</p>
                    <p className="text-stone-600 mt-0.5">
                      {SALON_CONFIG.location.parkingHint}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Concierge Desk</p>
                    <p className="text-stone-600 mt-0.5">
                      {SALON_CONFIG.contact.phone} | {SALON_CONFIG.contact.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={SALON_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                  Get Directions
                </a>

                <a
                  href={SALON_CONFIG.contact.phoneTel}
                  className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
                  Call Concierge
                </a>
              </div>
            </div>

            {/* Map Card */}
            <div className="lg:col-span-6 bg-stone-100 border-t lg:border-t-0 lg:border-l border-stone-200 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-rose-700 shadow-sm">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  {SALON_CONFIG.contact.addressShort}
                </h4>
                <p className="text-xs text-stone-500 mt-1.5 max-w-xs leading-relaxed">
                  {SALON_CONFIG.contact.directionsHint}
                </p>
              </div>
              <a
                href={SALON_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 rounded-lg text-xs font-semibold transition-colors shadow-xs inline-flex items-center"
              >
                Open in Google Maps
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: APPOINTMENT CTA (ROYAL BERRY LUXURY BANNER)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#2E1822] via-[#481E2C] to-[#1C0E15] text-white p-8 sm:p-14 text-center space-y-6 border border-rose-900/40 shadow-2xl shadow-rose-950/20 relative overflow-hidden">
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
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
