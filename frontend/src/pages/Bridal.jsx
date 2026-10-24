import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  MessageCircle,
  Scissors,
  Layers,
  HeartHandshake,
  ArrowRight,
  Maximize2,
  CalendarCheck,
  Eye
} from 'lucide-react';
import SEO from '../components/common/SEO';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import { mediaService } from '../services/media.service';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';

/**
 * Curated 4 Hero Bridal Photographs for the interactive showcase
 */
const BRIDAL_HERO_PHOTOS = [
  {
    id: 'hero_1',
    title: 'Royal Rajasthani Heritage Bridal Glam',
    subtitle: 'Lead Artist Anu Saini • Sikar',
    tag: 'rajasthani',
    tagLabel: 'Royal Rajasthani',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792325848/enrich/direct_uploads/rwtxitnjispxjnyy2hqs.jpg'
  },
  {
    id: 'hero_2',
    title: 'Signature HD Airbrush Crimson Bridal Look',
    subtitle: '18-Hour Waterproof Base',
    tag: 'airbrush',
    tagLabel: 'HD Airbrush',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227018/enrich/direct_uploads/vyyui5c3eyspxjmmrncu.jpg'
  },
  {
    id: 'hero_3',
    title: 'Timeless Sangeet & Reception Elegance',
    subtitle: 'Luminous Glow & Sculpted Eyes',
    tag: 'reception',
    tagLabel: 'Reception & Sangeet',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227121/enrich/direct_uploads/g85tb2zulgvdbzfubmec.jpg'
  },
  {
    id: 'hero_4',
    title: 'Pastel Rose & Gold Veil Placements',
    subtitle: 'Double-Veil & Floral Artistry',
    tag: 'veil',
    tagLabel: 'Veil & Draping',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227096/enrich/direct_uploads/xtesfwcvix3ahpjwbyls.jpg'
  }
];

/**
 * Curated 12 Real Bridal Portfolio Photographs from Enrich Beauty Parlour
 */
const BRIDAL_PORTFOLIO_FALLBACK = [
  {
    id: 'bg_1',
    title: 'Royal Rajasthani Heritage Bridal Glam',
    category: 'Bridal',
    tag: 'rajasthani',
    tagLabel: 'Royal Rajasthani',
    description: 'Exquisite traditional Rajasthani bridal makeover with antique jewelry styling, matha patti, and luminous skin.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792325848/enrich/direct_uploads/rwtxitnjispxjnyy2hqs.jpg'
  },
  {
    id: 'bg_2',
    title: 'Signature HD Airbrush Crimson Bridal Look',
    category: 'Bridal',
    tag: 'airbrush',
    tagLabel: 'HD Airbrush',
    description: 'Flawless full-coverage waterproof base paired with crimson lips and defined royal kohl eyes.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227018/enrich/direct_uploads/vyyui5c3eyspxjmmrncu.jpg'
  },
  {
    id: 'bg_3',
    title: 'Soft Glam Royal Rajputana Portrait',
    category: 'Bridal',
    tag: 'rajasthani',
    tagLabel: 'Royal Rajasthani',
    description: 'Soft bridal glam highlighting natural bone structure with velvet lips and traditional poshak.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227056/enrich/direct_uploads/irxsb86saihhpru4s5i6.jpg'
  },
  {
    id: 'bg_4',
    title: 'Luminous Glass-Skin Bridal Glow',
    category: 'Bridal',
    tag: 'airbrush',
    tagLabel: 'HD Airbrush',
    description: 'Hydrafacial prepped glass skin base ensuring 18-hour crease-free endurance for long ceremonies.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227069/enrich/direct_uploads/hfyuczf9lkdbv1sn0dzr.jpg'
  },
  {
    id: 'bg_5',
    title: 'Pastel Rose & Gold Veil Draping',
    category: 'Bridal',
    tag: 'veil',
    tagLabel: 'Veil & Draping',
    description: 'Modern romantic pastel bridal palette with couture double-veil placement and poshak styling.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227096/enrich/direct_uploads/xtesfwcvix3ahpjwbyls.jpg'
  },
  {
    id: 'bg_6',
    title: 'Timeless Sangeet & Reception Elegance',
    category: 'Bridal',
    tag: 'reception',
    tagLabel: 'Reception & Sangeet',
    description: 'Softly blended smokey eyes and sculpted radiance curated for pre-wedding cocktails and reception.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227121/enrich/direct_uploads/g85tb2zulgvdbzfubmec.jpg'
  },
  {
    id: 'bg_7',
    title: 'Traditional Sikar Bridal Poshak Styling',
    category: 'Bridal',
    tag: 'rajasthani',
    tagLabel: 'Royal Rajasthani',
    description: 'Traditional Marwari and Shekhawati bridal draping with ornate jewelry pinning.',
    url: '/images/bridal/bridal1.webp'
  },
  {
    id: 'bg_8',
    title: 'Couture Bridal Hair Bun & Floral Artistry',
    category: 'Bridal',
    tag: 'veil',
    tagLabel: 'Veil & Draping',
    description: 'Intricate bridal updo adorned with fresh roses, baby breath, and secure dupatta anchoring.',
    url: '/images/bridal/bridal2.webp'
  },
  {
    id: 'bg_9',
    title: 'Subtle Reception Glamour',
    category: 'Bridal',
    tag: 'reception',
    tagLabel: 'Reception & Sangeet',
    description: 'Contemporary evening bridal glam with dewy finish and modern rose lip shades.',
    url: '/images/bridal/bridal3.webp'
  },
  {
    id: 'bg_10',
    title: 'Heritage Matha Patti & Eye Detailing',
    category: 'Bridal',
    tag: 'rajasthani',
    tagLabel: 'Royal Rajasthani',
    description: 'Close-up precision eye makeup, custom lashes, and symmetrical jewelry setting.',
    url: '/images/bridal/bridal4.jpeg'
  },
  {
    id: 'bg_11',
    title: 'Flawless High-Definition Bridal Base',
    category: 'Bridal',
    tag: 'airbrush',
    tagLabel: 'HD Airbrush',
    description: 'Tear-resistant, camera-ready HD base looking stunning in 4K photography.',
    url: '/images/bridal/bridal6.webp'
  },
  {
    id: 'bg_12',
    title: 'Royal Wedding Evening Reception Look',
    category: 'Bridal',
    tag: 'reception',
    tagLabel: 'Reception & Sangeet',
    description: 'Glamorous post-wedding party makeup with soft illumination and defined contours.',
    url: '/images/bridal/bridal10.jpeg.jpg'
  }
];

/**
 * 4 Short Service Highlights
 */
const BRIDAL_HIGHLIGHTS = [
  {
    id: 'airbrush',
    icon: Sparkles,
    title: 'HD Airbrush Makeup',
    subtitle: '18-hr waterproof, tear-resistant base'
  },
  {
    id: 'hair',
    icon: Scissors,
    title: 'Bridal Hairstyling',
    subtitle: 'Floral couture buns & textured braids'
  },
  {
    id: 'draping',
    icon: Layers,
    title: 'Royal Draping',
    subtitle: 'Poshak, double-veil & matha patti pinning'
  },
  {
    id: 'trials',
    icon: HeartHandshake,
    title: 'Bridal Trials',
    subtitle: 'Personal consultation with Anu Saini'
  }
];

/**
 * Category filter tabs for the gallery
 */
const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Looks' },
  { id: 'rajasthani', label: 'Royal Rajasthani' },
  { id: 'airbrush', label: 'HD Airbrush' },
  { id: 'reception', label: 'Reception & Sangeet' },
  { id: 'veil', label: 'Veil & Draping' }
];

export default function Bridal() {
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState(BRIDAL_PORTFOLIO_FALLBACK);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxState, setLightboxState] = useState({ isOpen: false, index: 0, list: [] });

  const activeHeroPhoto = BRIDAL_HERO_PHOTOS[activeHeroIdx] || BRIDAL_HERO_PHOTOS[0];

  const whatsappBridalUrl = `https://wa.me/919667900313?text=${encodeURIComponent(
    'Hi Anu Saini, I want to inquire about Bridal Makeup packages, dates, and trial appointments at Enrich Sikar.'
  )}`;

  // Attempt to supplement with live media from database if available
  useEffect(() => {
    let isMounted = true;
    const fetchLiveMedia = async () => {
      try {
        const res = await mediaService.getGalleryMedia({ category: 'Bridal', limit: 20 });
        const media = res?.data?.media || res?.data;
        if (Array.isArray(media) && media.length > 0) {
          const livePhotos = media.filter((m) => m.type === 'photo' && m.url);
          if (isMounted && livePhotos.length >= 6) {
            // Enrich with subcategory tags if missing
            const enriched = livePhotos.map((item, idx) => {
              const matched = BRIDAL_PORTFOLIO_FALLBACK.find(
                (f) => f.url === item.url || (item.title && item.title.includes(f.title))
              );
              return {
                id: item._id || `api_${idx}`,
                title: item.title || 'Bridal Look',
                category: 'Bridal',
                tag: matched?.tag || (idx % 2 === 0 ? 'rajasthani' : 'airbrush'),
                tagLabel: matched?.tagLabel || 'Bridal Artistry',
                description: item.description || matched?.description || 'Curated bridal transformation at Enrich Parlour.',
                url: item.url
              };
            });
            setGalleryPhotos(enriched);
          }
        }
      } catch (err) {
        // Fallback photos already loaded
      }
    };

    fetchLiveMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter photos by category
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return galleryPhotos;
    return galleryPhotos.filter((p) => p.tag === selectedCategory);
  }, [galleryPhotos, selectedCategory]);

  const openHeroLightbox = () => {
    const list = BRIDAL_HERO_PHOTOS.map((p) => ({
      url: p.url,
      title: p.title,
      category: p.tagLabel,
      description: p.subtitle
    }));
    setLightboxState({ isOpen: true, index: activeHeroIdx, list });
  };

  const openGalleryLightbox = (idx) => {
    const list = filteredPhotos.map((p) => ({
      url: p.url,
      title: p.title,
      category: p.tagLabel,
      description: p.description
    }));
    setLightboxState({ isOpen: true, index: idx, list });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, index: 0, list: [] });
  };

  const navigateLightbox = (newIdx) => {
    setLightboxState((prev) => ({ ...prev, index: newIdx }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-16 space-y-10 sm:space-y-12">
      <SEO
        title="Bridal Makeup | Enrich Beauty Parlour Sikar"
        description="Your special day, your perfect look. Royal Rajasthani, HD airbrush bridal makeup, poshak draping, and bridal trials by Anu Saini at Enrich Sikar."
        url="/bridal"
      />

      {/* =========================================================================
          1. HERO SECTION: Title, Subtitle, Featured Photo & 4 Thumbnails
          ========================================================================= */}
      <section className="space-y-4 sm:space-y-5">
        {/* Short Heading & Subtitle (Tighter, reduced whitespace) */}
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200/80">
            <Sparkles className="w-3.5 h-3.5 text-rose-700" />
            <span>Bridal Artistry by Anu Saini</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            Bridal Makeup
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-light max-w-md mx-auto">
            Your special day, your perfect look.
          </p>
        </div>

        {/* Large Featured Photo */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-stone-900 border border-stone-200/90 group">
          <img
            key={activeHeroPhoto.url}
            src={resolveImageUrl(activeHeroPhoto.url, DEFAULT_SALON_PLACEHOLDER)}
            alt={activeHeroPhoto.title}
            className="w-full h-full object-cover object-top transition-opacity duration-300"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Top Label & Full Screen Trigger */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-auto">
            <span className="text-[11px] font-bold text-white bg-stone-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">
              {activeHeroPhoto.tagLabel}
            </span>

            <button
              type="button"
              onClick={openHeroLightbox}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-stone-900/85 hover:bg-stone-900 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="Expand to Fullscreen Lightbox"
              aria-label="Expand photo to fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">Zoom Photo</span>
            </button>
          </div>

          {/* Bottom Caption Overlay */}
          <div
            onClick={openHeroLightbox}
            className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-end justify-between cursor-pointer"
          >
            <div className="space-y-0.5 max-w-xl text-white">
              <h2 className="text-base sm:text-xl font-serif font-bold drop-shadow-md leading-tight">
                {activeHeroPhoto.title}
              </h2>
              <p className="text-xs text-stone-200 drop-shadow-sm font-light">
                {activeHeroPhoto.subtitle}
              </p>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-stone-300 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 shrink-0">
              <Camera className="w-3 h-3 text-rose-400" />
              Click to view {BRIDAL_HERO_PHOTOS.length} looks
            </span>
          </div>
        </div>

        {/* 4 Clickable Photo Thumbnails Directly Beneath Main Image */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-500 px-0.5">
            <span className="font-semibold text-stone-700 text-[11px] uppercase tracking-wider">
              Featured Bridal Looks:
            </span>
            <span className="text-[11px] text-stone-500">
              Tap any photo to preview
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
            {BRIDAL_HERO_PHOTOS.map((thumb, idx) => {
              const isSelected = activeHeroIdx === idx;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => setActiveHeroIdx(idx)}
                  className={`group relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-stone-100 ${
                    isSelected
                      ? 'ring-2 ring-rose-700 ring-offset-2 ring-offset-white shadow-md scale-[1.02]'
                      : 'border border-stone-200 hover:border-rose-300 opacity-80 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  aria-label={`Select ${thumb.title}`}
                  aria-pressed={isSelected}
                >
                  <img
                    src={resolveImageUrl(thumb.url, DEFAULT_SALON_PLACEHOLDER)}
                    alt={thumb.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                  />

                  {/* Active indicator dot & label on larger screens */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent flex items-end p-1.5 sm:p-2">
                    <span className="text-[10px] sm:text-xs font-semibold text-white truncate drop-shadow-sm">
                      {thumb.tagLabel}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary & Secondary Booking Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          {/* Main Rose-Red Primary CTA: Connects to appointment system */}
          <Link
            to="/book?service=Bridal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-md shadow-rose-950/15 transition-all active:scale-98 cursor-pointer"
          >
            <span>Book Bridal Makeup</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>

          {/* Secondary Action 1: Direct WhatsApp Inquiry */}
          <a
            href={whatsappBridalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-current shrink-0" />
            <span>WhatsApp Inquiry</span>
          </a>

          {/* Secondary Action 2: Jump down to Bridal Portfolio */}
          <a
            href="#bridal-gallery"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-rose-700 shrink-0" />
            <span>View Bridal Portfolio ({galleryPhotos.length})</span>
          </a>
        </div>
      </section>

      {/* =========================================================================
          2. SHORT SERVICE HIGHLIGHTS: Compact 2x2 on Mobile, 4-col on Desktop
          ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="text-center sm:text-left">
          <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
            Bridal Specializations
          </h2>
          <p className="text-xs text-stone-500 font-light">
            Couture wedding services performed in-studio at Sharda Heights, Sikar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          {BRIDAL_HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs hover:border-rose-200 transition-all space-y-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-light mt-0.5 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. BRIDAL PHOTO GALLERY: 12 Real Photos, Filters, Responsive Grid & Lightbox
          ========================================================================= */}
      <section id="bridal-gallery" className="space-y-4 pt-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200/80 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Full Portfolio Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
              Bridal Gallery
            </h2>
            <p className="text-xs text-stone-600 font-light">
              Explore 12 real bride transformations created by Lead Artist Anu Saini.
            </p>
          </div>

          <span className="text-xs text-stone-500 font-mono self-start sm:self-end">
            Showing {filteredPhotos.length} looks
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-rose-700 text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 hover:border-stone-300'
                }`}
                aria-pressed={isActive}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Responsive Gallery Grid: 2 columns on Mobile, 3-4 on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => openGalleryLightbox(idx)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openGalleryLightbox(idx);
                }
              }}
              aria-label={`View photo: ${photo.title}`}
            >
              <img
                src={resolveImageUrl(photo.url, DEFAULT_SALON_PLACEHOLDER)}
                alt={photo.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
              />

              {/* Tag Pill in top left */}
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <span className="text-[10px] font-bold text-white bg-stone-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                  {photo.tagLabel}
                </span>
              </div>

              {/* Hover Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5 sm:p-3 text-white">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-serif font-bold leading-tight line-clamp-2 drop-shadow-sm">
                    {photo.title}
                  </h3>
                  <p className="text-[10px] text-stone-300 line-clamp-1 font-light">
                    {photo.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-rose-300 font-semibold">
                  <span>View Details</span>
                  <Eye className="w-3.5 h-3.5 text-rose-300 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. CLOSING RESERVATION BANNER: Clean & Focused
          ========================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50/40 border border-rose-200/80 shadow-xs text-center space-y-4">
        <div className="space-y-1.5 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white text-rose-800 border border-rose-200/80 shadow-2xs">
            <CalendarCheck className="w-3.5 h-3.5 text-rose-700" />
            <span>Wedding Date Reservations</span>
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Reserve Your Wedding Date in Sikar
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            Due to personal styling attention, Lead Cosmetologist Anu Saini takes limited bridal appointments per auspicious date.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            to="/book?service=Bridal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-md shadow-rose-950/15 transition-all active:scale-98"
          >
            <span>Book Bridal Makeup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={whatsappBridalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200/90 shadow-2xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-current shrink-0" />
            <span>Chat on WhatsApp: +91 96679 00313</span>
          </a>
        </div>
      </section>

      {/* Accessible Full-Screen Lightbox for All Photo Viewing */}
      {lightboxState.isOpen && (
        <PhotoLightbox
          mediaList={lightboxState.list}
          currentIndex={lightboxState.index}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </div>
  );
}
