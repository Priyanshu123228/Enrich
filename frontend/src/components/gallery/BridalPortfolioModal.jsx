import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Eye,
  ExternalLink,
  MessageCircle,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mediaService } from '../../services/media.service';
import PhotoLightbox from './PhotoLightbox';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

const CURATED_BRIDAL_FALLBACK = [
  {
    _id: 'bridal_1',
    title: 'Royal Rajasthani Heritage Bridal Glam',
    category: 'Bridal',
    subcategory: 'rajasthani',
    subcategoryLabel: 'Royal Rajasthani',
    description: 'Exquisite traditional Rajasthani bridal makeover featuring antique gold jewelry, intricate matha patti, and luminous HD skin by Anu Saini.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792325848/enrich/direct_uploads/rwtxitnjispxjnyy2hqs.jpg'
  },
  {
    _id: 'bridal_2',
    title: 'Signature HD Airbrush Crimson Bridal Look',
    category: 'Bridal',
    subcategory: 'airbrush',
    subcategoryLabel: 'HD Airbrush',
    description: 'Flawless full-coverage waterproof airbrush base paired with deep crimson lips, defined kohl eyes, and royal gold jewelry styling.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227018/enrich/direct_uploads/vyyui5c3eyspxjmmrncu.jpg'
  },
  {
    _id: 'bridal_3',
    title: 'Timeless Sangeet & Reception Elegance',
    category: 'Bridal',
    subcategory: 'reception',
    subcategoryLabel: 'Sangeet & Reception',
    description: 'Sculpted cheekbones, softly blended smokey eyes, and glass-skin radiance curated for pre-wedding & cocktail celebrations.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227121/enrich/direct_uploads/g85tb2zulgvdbzfubmec.jpg'
  },
  {
    _id: 'bridal_4',
    title: 'Pastel Rose & Gold Veil Placements',
    category: 'Bridal',
    subcategory: 'veil',
    subcategoryLabel: 'Veil & Draping',
    description: 'Modern romantic pastel bridal palette with meticulous double-veil placement and couture floral hair arrangement.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227096/enrich/direct_uploads/xtesfwcvix3ahpjwbyls.jpg'
  },
  {
    _id: 'bridal_5',
    title: 'Clinical Skin-Prep & Luminous Bridal Glow',
    category: 'Bridal',
    subcategory: 'airbrush',
    subcategoryLabel: 'HD Airbrush',
    description: 'Every brushstroke crafted to perfection. Hydrafacial infused glass skin base ensuring 18-hour crease-free endurance.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227069/enrich/direct_uploads/hfyuczf9lkdbv1sn0dzr.jpg'
  },
  {
    _id: 'bridal_6',
    title: 'Soft Glam Royal Rajputana Portrait',
    category: 'Bridal',
    subcategory: 'rajasthani',
    subcategoryLabel: 'Royal Rajasthani',
    description: 'Soft bridal glam highlighting natural bone structure with featherweight luxury lashes, velvet lips, and traditional poshak.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227056/enrich/direct_uploads/irxsb86saihhpru4s5i6.jpg'
  }
];

export default function BridalPortfolioModal({ isOpen, onClose }) {
  const [photos, setPhotos] = useState(CURATED_BRIDAL_FALLBACK);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [activeLightboxIdx, setActiveLightboxIdx] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live bridal media from MongoDB API
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchBridalMedia = async () => {
      setIsLoading(true);
      try {
        const res = await mediaService.getGalleryMedia({ category: 'Bridal', limit: 30 });
        let items = [];
        if (res?.data?.media && Array.isArray(res.data.media)) {
          items = res.data.media;
        } else if (Array.isArray(res?.data)) {
          items = res.data;
        }

        // Filter strictly photo items categorized as Bridal
        const bridalOnly = items.filter(
          (m) =>
            m.type === 'photo' &&
            (m.category === 'Bridal' ||
              (m.title && m.title.toLowerCase().includes('bridal')) ||
              (m.description && m.description.toLowerCase().includes('bridal')))
        );

        if (isMounted && bridalOnly.length > 0) {
          // Merge API results with subcategory tags if missing
          const enriched = bridalOnly.map((b, idx) => {
            const fallbackItem = CURATED_BRIDAL_FALLBACK.find(
              (c) => c.url === b.url || (b.title && b.title.includes(c.title))
            );
            return {
              ...b,
              subcategory: fallbackItem ? fallbackItem.subcategory : idx % 2 === 0 ? 'airbrush' : 'rajasthani',
              subcategoryLabel: fallbackItem ? fallbackItem.subcategoryLabel : 'Bridal Artistry'
            };
          });
          setPhotos(enriched);
        }
      } catch (err) {
        console.warn('Failed to load bridal media from API, using curated high-definition showcase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBridalMedia();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle escape key to close modal
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && activeLightboxIdx === null) {
        onClose?.();
      }
    },
    [onClose, activeLightboxIdx]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Filter photos by subcategory
  const filteredPhotos = useMemo(() => {
    if (selectedSubcategory === 'all') return photos;
    return photos.filter((p) => p.subcategory === selectedSubcategory);
  }, [photos, selectedSubcategory]);

  const handleWhatsAppInquiry = (photo) => {
    const title = photo?.title || 'Royal Bridal Look';
    const message = encodeURIComponent(
      `Hi Anu Saini, I am viewing the "${title}" in the Enrich Royal Bridal Portfolio and would like to inquire about wedding dates, packages, and trial appointments.`
    );
    window.open(`https://wa.me/919667900313?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bridal-portfolio-title"
      >
        <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE1] rounded-3xl border border-rose-200/90 shadow-2xl shadow-stone-950/40 overflow-hidden">
          
          {/* Soft ambient decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* =========================================================================
              MODAL HEADER
              ========================================================================= */}
          <div className="relative z-10 px-5 sm:px-8 py-5 border-b border-rose-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-700">
                    Dedicated Bridal Showcase
                  </span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="hidden sm:inline-block text-xs text-stone-500 font-medium">
                    Only Bridal Transformations
                  </span>
                </div>
                <h2
                  id="bridal-portfolio-title"
                  className="text-lg sm:text-2xl font-serif font-bold text-stone-900 tracking-tight truncate"
                >
                  Royal Bridal Artistry Portfolio
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-600 font-normal truncate hidden sm:block">
                  Crafted under the personal direction of Lead Cosmetologist <strong>Anu Saini</strong> • Sikar, Rajasthan
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/gallery?category=Bridal"
                onClick={onClose}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                title="Open Bridal Gallery Page"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Bridal Portfolio"
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 flex items-center justify-center transition-all cursor-pointer border border-stone-200/80 shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              MODAL SUB-HEADER / FILTER TABS BAR
              ========================================================================= */}
          <div className="relative z-10 px-5 sm:px-8 py-3 bg-[#FAF5EE]/90 border-b border-rose-200/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
              {[
                { id: 'all', label: `All Looks (${photos.length})` },
                { id: 'airbrush', label: 'HD Airbrush' },
                { id: 'rajasthani', label: 'Royal Rajasthani' },
                { id: 'reception', label: 'Sangeet & Reception' },
                { id: 'veil', label: 'Veil & Draping' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSubcategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedSubcategory === tab.id
                      ? 'bg-rose-700 text-white shadow-xs font-bold'
                      : 'bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                18-Hr Waterproof Base
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                High-Definition Optics
              </span>
            </div>
          </div>

          {/* =========================================================================
              MODAL BODY: PHOTO GRID
              ========================================================================= */}
          <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
            
            {/* Editorial Kicker Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-rose-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-serif font-bold text-stone-900 sm:text-sm">
                  ✨ Exclusively Royal Bridal Photographs
                </p>
                <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed font-light">
                  Click on any photograph to zoom into high-definition details or chat directly with Anu Saini to reserve your wedding date.
                </p>
              </div>

              <a
                href="https://wa.me/919667900313?text=Hi%20Anu%20Saini,%20I%20am%20interested%20in%20reserving%20a%20bridal%20makeup%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Quick WhatsApp Consultation</span>
              </a>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredPhotos.map((photo, idx) => {
                const globalIdx = photos.findIndex((p) => p._id === photo._id);
                return (
                  <div
                    key={photo._id || idx}
                    className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div
                      className="relative aspect-[4/5] overflow-hidden bg-stone-950 cursor-pointer"
                      onClick={() => setActiveLightboxIdx(globalIdx !== -1 ? globalIdx : idx)}
                    >
                      <img
                        src={resolveImageUrl(photo.url || photo.thumbnail, DEFAULT_SALON_PLACEHOLDER)}
                        alt={photo.title || 'Enrich Sikar Royal Bridal Look'}
                        loading="lazy"
                        onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Gradient Vignette for Text Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-85 transition-opacity" />

                      {/* Top Category Badge */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-700/90 backdrop-blur-md text-white shadow-md">
                          {photo.subcategoryLabel || 'Royal Bridal'}
                        </span>
                      </div>

                      {/* Zoom Indicator on Hover */}
                      <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-stone-900/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>

                      {/* Bottom Image Hover Bar */}
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-[11px] font-medium opacity-90 group-hover:opacity-100">
                        <span className="flex items-center gap-1 text-rose-200">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Tap to Zoom Full HD</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Action Bar */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2">
                          {photo.title}
                        </h3>
                        {photo.description && (
                          <p className="text-stone-600 text-xs leading-relaxed line-clamp-2 font-light">
                            {photo.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleWhatsAppInquiry(photo)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-800 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                          <span>Inquire Look</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveLightboxIdx(globalIdx !== -1 ? globalIdx : idx)}
                          className="px-3 py-2.5 rounded-xl border border-stone-200 hover:border-rose-300 bg-stone-50 hover:bg-rose-50/50 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                          title="View High Resolution Photo"
                        >
                          <Eye className="w-4 h-4 text-stone-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* =========================================================================
              MODAL FOOTER
              ========================================================================= */}
          <div className="relative z-10 px-5 sm:px-8 py-4 bg-white/90 border-t border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Booking 2026-2027 Wedding Dates with Anu Saini • Advance trial consultations recommended.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                to="/gallery?category=Bridal"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-rose-700 hover:text-rose-800 font-semibold transition-colors"
              >
                <span>Dedicated Gallery Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/book?service=Bridal"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Bridal Consultation</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL FOR HIGH-RESOLUTION ZOOM */}
      {activeLightboxIdx !== null && (
        <PhotoLightbox
          mediaList={photos}
          currentIndex={activeLightboxIdx}
          onClose={() => setActiveLightboxIdx(null)}
          onNavigate={(newIdx) => setActiveLightboxIdx(newIdx)}
        />
      )}
    </>
  );
}
