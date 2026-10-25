import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  MessageCircle,
  ArrowRight,
  Maximize2,
  Eye,
  Phone,
  Sparkle
} from 'lucide-react';
import PhotoLightbox from '../gallery/PhotoLightbox';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

/**
 * 16 Real Bridal Photographs from Enrich Beauty Parlour & Cosmetic Clinic, Sikar
 */
export const ALL_BRIDAL_PHOTOS = [
  {
    id: 'bridal_1',
    title: 'Royal Rajasthani Heritage Bridal Glam',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Authentic royal poshak styling, matha patti pinning, antique gold jewelry, and radiant HD base by Anu Saini.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792325848/enrich/direct_uploads/rwtxitnjispxjnyy2hqs.jpg',
    tag: 'Signature Look'
  },
  {
    id: 'bridal_2',
    title: 'Signature HD Airbrush Crimson Bridal',
    category: 'airbrush',
    categoryLabel: 'HD Airbrush',
    description: '18-hour waterproof airbrush base, deep crimson velvet lips, defined royal kohl eyes.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227018/enrich/direct_uploads/vyyui5c3eyspxjmmrncu.jpg',
    tag: '18-Hr Waterproof'
  },
  {
    id: 'bridal_3',
    title: 'Soft Glam Royal Rajputana Portrait',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Natural bone structure sculpted with featherweight lashes, soft contouring, and heritage jewelry.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227056/enrich/direct_uploads/irxsb86saihhpru4s5i6.jpg',
    tag: 'Soft Royal Glam'
  },
  {
    id: 'bridal_4',
    title: 'Clinical Glass-Skin Bridal Glow',
    category: 'airbrush',
    categoryLabel: 'HD Airbrush',
    description: 'Hydrafacial clinical skin prep ensuring luminous, crease-free endurance under 4K wedding lights.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227069/enrich/direct_uploads/hfyuczf9lkdbv1sn0dzr.jpg',
    tag: 'Glass Skin'
  },
  {
    id: 'bridal_5',
    title: 'Pastel Rose & Gold Double-Veil Draping',
    category: 'veil',
    categoryLabel: 'Veil & Draping',
    description: 'Modern romantic pastel palette with couture double-veil placement and poshak styling.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227096/enrich/direct_uploads/xtesfwcvix3ahpjwbyls.jpg',
    tag: 'Veil Pinning'
  },
  {
    id: 'bridal_6',
    title: 'Timeless Sangeet & Reception Elegance',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Softly blended smokey eyes, sculpted cheekbones, and glass-skin radiance for evening events.',
    url: 'https://res.cloudinary.com/dzahy6r3o/image/upload/v1792227121/enrich/direct_uploads/g85tb2zulgvdbzfubmec.jpg',
    tag: 'Evening Cocktail'
  },
  {
    id: 'bridal_7',
    title: 'Evening Champagne Reception Glam',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Contemporary champagne bridal gown makeover with sculpted neckline and diamond choker styling.',
    url: '/images/bridal/bridal1.webp',
    tag: 'Reception Glam'
  },
  {
    id: 'bridal_8',
    title: 'Royal Haldi & Mehendi Yellow Poshak',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Vibrant mustard poshak with emerald jadau jewelry, kundan matha patti, and fresh dewy glow.',
    url: '/images/bridal/bridal2.webp',
    tag: 'Haldi & Mehendi'
  },
  {
    id: 'bridal_9',
    title: 'Vibrant Turquoise Sheer Veil Styling',
    category: 'veil',
    categoryLabel: 'Veil & Draping',
    description: 'Luminous teal bridal draping with lightweight poshak pinning and glowing natural radiance.',
    url: '/images/bridal/bridal3.webp',
    tag: 'Veil Styling'
  },
  {
    id: 'bridal_10',
    title: 'Royal Lilac & Mauve Shimmer Lehenga',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Modern pastel lilac bridal ensemble with soft rose lips, winged liner, and fine diamond set.',
    url: '/images/bridal/bridal4.webp',
    tag: 'Pastel Lehenga'
  },
  {
    id: 'bridal_11',
    title: 'Grand Rajputana Gotta Patti Poshak',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Traditional Marwari orange and gold royal poshak styling with heavy gotta patti and borla.',
    url: '/images/bridal/bridal5.webp',
    tag: 'Royal Poshak'
  },
  {
    id: 'bridal_12',
    title: 'Traditional Shekhawati Pink Bridal Look',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Signature Rajasthani crimson-pink poshak, authentic bridal nath, borla, and chuda styling.',
    url: '/images/bridal/bridal6.webp',
    tag: 'Shekhawati Bride'
  },
  {
    id: 'bridal_13',
    title: 'Outdoor Wedding Courtyard Portrait',
    category: 'airbrush',
    categoryLabel: 'HD Airbrush',
    description: 'Flawless daytime wedding makeup with floral courtyard setting, fresh roses, and gold kundan.',
    url: '/images/bridal/bridal7.webp',
    tag: 'Courtyard Bridal'
  },
  {
    id: 'bridal_14',
    title: 'Peacock Royal Blue Poshak Makeover',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Rich peacock blue poshak with silver zardozi border, heritage matha patti, and glass skin.',
    url: '/images/bridal/bridal8.webp',
    tag: 'Royal Blue Poshak'
  },
  {
    id: 'bridal_15',
    title: 'Couture Lavender Floral Sangeet Glam',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Romantic evening bridal look with intricate floral backdrop, mauve lids, and dewy finish.',
    url: '/images/bridal/bridal9.webp',
    tag: 'Sangeet Look'
  },
  {
    id: 'bridal_16',
    title: 'Grand Banquet Hall Bride in Lilac',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Royal aisle entrance look in soft lilac poshak with floral walkway and full jewelry ensemble.',
    url: '/images/bridal/bridal10.webp',
    tag: 'Royal Aisle'
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Bridal Looks (16)' },
  { id: 'rajasthani', label: 'Royal Rajasthani' },
  { id: 'airbrush', label: 'HD Airbrush' },
  { id: 'reception', label: 'Reception & Sangeet' },
  { id: 'veil', label: 'Veil & Draping' }
];

export default function BridalShowcase({ isEmbedded = false }) {
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxState, setLightboxState] = useState({ isOpen: false, index: 0, list: [] });

  const activeHeroPhoto = ALL_BRIDAL_PHOTOS[activeHeroIdx] || ALL_BRIDAL_PHOTOS[0];

  const getWhatsAppUrl = (customText) => {
    const text = customText || 'Hi Anu Saini, I want to book a Bridal Makeup appointment at Enrich Sikar. Please share available wedding dates.';
    return `https://wa.me/919667900313?text=${encodeURIComponent(text)}`;
  };

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return ALL_BRIDAL_PHOTOS;
    return ALL_BRIDAL_PHOTOS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const openLightbox = (list, index) => {
    setLightboxState({
      isOpen: true,
      index,
      list: list.map((item) => ({
        url: item.url,
        title: item.title,
        category: item.categoryLabel || 'Bridal Artistry',
        description: item.description
      }))
    });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, index: 0, list: [] });
  };

  const navigateLightbox = (newIdx) => {
    setLightboxState((prev) => ({ ...prev, index: newIdx }));
  };

  return (
    <div className={`space-y-10 sm:space-y-14 ${isEmbedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
      
      {/* =========================================================================
          HERO SPOTLIGHT: Large Featured Full-Width Bridal Look & Switcher Thumbnails
          ========================================================================= */}
      <div className="space-y-6">
        {/* Title Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-rose-50 text-rose-800 border border-rose-200/90 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-700" />
            <span>Sikar's Premier Bridal Studio • Directed by Anu Saini</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            Bridal Makeup
          </h2>
          <p className="text-xs sm:text-base text-stone-600 font-light">
            Your special day, your perfect look. Royal Shekhawati poshak, HD airbrush, and couture bridal artistry.
          </p>
        </div>

        {/* Featured Bridal Photo - 100% Completely Visible in True 3:4 Portrait Ratio */}
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto space-y-3.5">
          
          {/* Main Featured Photo Frame: object-contain with ambient backdrop ensures ZERO cropping */}
          <div
            onClick={() => openLightbox(ALL_BRIDAL_PHOTOS, activeHeroIdx)}
            className="relative aspect-[3/4] w-full max-h-[540px] sm:max-h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-stone-950 border border-stone-200/90 group cursor-pointer flex items-center justify-center mx-auto"
          >
            {/* Ambient Blurred Backdrop so letterboxing is luxurious */}
            <img
              src={resolveImageUrl(activeHeroPhoto.url, DEFAULT_SALON_PLACEHOLDER)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
            />

            {/* Main Uncropped Photo: 100% visible from matha patti to poshak */}
            <img
              key={activeHeroPhoto.url}
              src={resolveImageUrl(activeHeroPhoto.url, DEFAULT_SALON_PLACEHOLDER)}
              alt={activeHeroPhoto.title}
              className="relative z-1 w-full h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
              onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
            />

            {/* Top Badges */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10 pointer-events-auto">
              <span className="text-[11px] font-bold text-white bg-rose-700/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rose-400/30 shadow-md flex items-center gap-1.5">
                <Sparkle className="w-3 h-3 text-amber-300 fill-current" />
                <span>{activeHeroPhoto.tag}</span>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(ALL_BRIDAL_PHOTOS, activeHeroIdx);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-stone-900/85 hover:bg-stone-900 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="View Fullscreen Photo"
                aria-label="View photo in fullscreen lightbox"
              >
                <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                <span>View Full Photo</span>
              </button>
            </div>
          </div>

          {/* Title & Description: Cleanly positioned BELOW the photo so nothing covers the bride */}
          <div className="text-center space-y-1 px-2 pt-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest block">
              {activeHeroPhoto.categoryLabel}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {activeHeroPhoto.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-light max-w-lg mx-auto leading-relaxed">
              {activeHeroPhoto.description}
            </p>
          </div>

          {/* 5 Thumbnails Row in Natural Portrait 3:4 Aspect Ratio */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500 px-0.5">
              <span className="font-semibold text-stone-700 uppercase tracking-wider">
                Featured Looks (Tap to switch):
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {ALL_BRIDAL_PHOTOS.slice(0, 5).map((thumb, idx) => {
                const isSelected = activeHeroIdx === idx;
                return (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => setActiveHeroIdx(idx)}
                    className={`group relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-rose-700 ring-offset-2 ring-offset-white scale-[1.03] shadow-md'
                        : 'border border-stone-200 opacity-80 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                    aria-label={`Select ${thumb.title}`}
                  >
                    <img
                      src={resolveImageUrl(thumb.url, DEFAULT_SALON_PLACEHOLDER)}
                      alt={thumb.title}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Actions: Book on WhatsApp + Call */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={getWhatsAppUrl(`Hi Anu Saini, I am interested in booking the "${activeHeroPhoto.title}" bridal look for my wedding.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-current shrink-0" />
              <span>Book this Bridal Look on WhatsApp</span>
            </a>

            <a
              href="tel:+919667900313"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold border border-stone-200/80 transition-colors"
            >
              <Phone className="w-4 h-4 text-stone-700" />
              <span>Call: 96679 00313</span>
            </a>

            {isEmbedded && (
              <Link
                to="/bridal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold border border-stone-200/80 transition-colors"
              >
                <Camera className="w-4 h-4 text-rose-700" />
                <span>View Dedicated Bridal Page</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          PHOTO GALLERY: 16 Real Photos Completely Visible with "Book on WhatsApp" on Every Card
          ========================================================================= */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-stone-200/80 pb-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            <span>Real Brides of Enrich Atelier</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
            Bridal Portfolio
          </h3>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-rose-700 text-white shadow-xs font-bold scale-[1.02]'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Responsive Grid: 2 cols on Mobile, 4 cols on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-rose-200 transition-all duration-300 flex flex-col"
            >
              {/* Image Frame: Unobstructed, 3:4 portrait ratio matches photos */}
              <div
                onClick={() => openLightbox(filteredPhotos, idx)}
                className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 cursor-pointer"
              >
                <img
                  src={resolveImageUrl(photo.url, DEFAULT_SALON_PLACEHOLDER)}
                  alt={photo.title}
                  className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-500"
                  onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                />

                {/* Subtle top tag badge */}
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <span className="text-[10px] font-bold text-white bg-stone-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                    {photo.tag}
                  </span>
                </div>

                {/* Accessible Zoom Button on Photo */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(filteredPhotos, idx);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-stone-900/80 hover:bg-rose-700 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-10 shadow-xs cursor-pointer"
                  title="View Fullscreen Photo"
                  aria-label={`View ${photo.title} in fullscreen`}
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Subtle hover overlay hint only on desktop, never blocking photo on mobile */}
                <div className="hidden sm:flex absolute inset-0 bg-stone-950/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-900/90 text-white text-xs font-semibold shadow-md">
                    <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                    <span>View Full Photo</span>
                  </span>
                </div>
              </div>

              {/* Card Footer: Cleanly positioned BELOW image so photo is never obscured */}
              <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-2.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                    {photo.categoryLabel}
                  </span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 leading-snug">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-light line-clamp-1 leading-relaxed">
                    {photo.description}
                  </p>
                </div>

                {/* Direct WhatsApp Booking Button */}
                <a
                  href={getWhatsAppUrl(`Hi Anu Saini, I saw the "${photo.title}" look in your bridal gallery and would like to book an appointment for my wedding.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors"
                  title="Book this bridal look on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>Book on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

            {/* Accessible Full-Screen Lightbox */}
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
