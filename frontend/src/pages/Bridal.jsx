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
  Eye,
  Star,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkle
} from 'lucide-react';
import SEO from '../components/common/SEO';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';

/**
 * 16 Real Bridal Photographs from Enrich Beauty Parlour & Cosmetic Clinic, Sikar
 */
const ALL_BRIDAL_PHOTOS = [
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
    title: 'Traditional Shekhawati Poshak Styling',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Marwari and Shekhawati traditional bridal poshak with authentic borla and nath setting.',
    url: '/images/bridal/bridal1.webp',
    tag: 'Traditional Poshak'
  },
  {
    id: 'bridal_8',
    title: 'Couture Bridal Hair Bun & Floral Artistry',
    category: 'veil',
    categoryLabel: 'Veil & Draping',
    description: 'Intricate wedding hair updo adorned with fresh roses, baby breath, and secure dupatta anchoring.',
    url: '/images/bridal/bridal2.webp',
    tag: 'Floral Hair Bun'
  },
  {
    id: 'bridal_9',
    title: 'Modern Reception Glow & Velvet Lips',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Contemporary evening bridal glam with dewy finish and modern rose lip shades.',
    url: '/images/bridal/bridal3.webp',
    tag: 'Reception Glam'
  },
  {
    id: 'bridal_10',
    title: 'Heritage Matha Patti & Eye Detailing',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Precision eye artistry, winged definition, custom luxury lashes, and symmetrical jewelry alignment.',
    url: '/images/bridal/bridal4.jpeg',
    tag: 'Eye Artistry'
  },
  {
    id: 'bridal_11',
    title: 'Shekhawati Royal Bride Portrait',
    category: 'rajasthani',
    categoryLabel: 'Royal Rajasthani',
    description: 'Regal bridal elegance curated for traditional Sikar ceremonies with long-lasting flawless base.',
    url: '/images/bridal/bridal5.jpeg',
    tag: 'Royal Bride'
  },
  {
    id: 'bridal_12',
    title: 'Flawless High-Definition Camera Base',
    category: 'airbrush',
    categoryLabel: 'HD Airbrush',
    description: 'Tear-resistant, sweat-proof HD formula designed for high-resolution video and photo shoots.',
    url: '/images/bridal/bridal6.webp',
    tag: 'HD 4K Ready'
  },
  {
    id: 'bridal_13',
    title: 'Bridal Jewelry & Dupatta Setting',
    category: 'veil',
    categoryLabel: 'Veil & Draping',
    description: 'Secure, weight-balanced dupatta pinning and jewelry arrangement for all-day comfort.',
    url: '/images/bridal/bridal7.jpeg',
    tag: 'Dupatta Styling'
  },
  {
    id: 'bridal_14',
    title: 'Radiant Day Wedding Bridal Makeover',
    category: 'airbrush',
    categoryLabel: 'HD Airbrush',
    description: 'Luminous daytime wedding makeup with delicate peach and golden highlights.',
    url: '/images/bridal/bridal8.jpeg',
    tag: 'Day Bridal'
  },
  {
    id: 'bridal_15',
    title: 'Grand Wedding Celebration Look',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Glamorous post-wedding party makeup with soft illumination and sculpted features.',
    url: '/images/bridal/bridal9.jpeg',
    tag: 'Party Glam'
  },
  {
    id: 'bridal_16',
    title: 'Enrich Royal Sikar Bride Portrait',
    category: 'reception',
    categoryLabel: 'Reception & Sangeet',
    description: 'Signature bridal transformation created under the personal direction of Anu Saini.',
    url: '/images/bridal/bridal10.jpeg.jpg',
    tag: 'Signature Bride'
  }
];

/**
 * 4 Curated Bridal Packages
 */
const BRIDAL_PACKAGES = [
  {
    id: 'pkg_rajasthani',
    title: 'Royal Rajputana Heritage Bridal',
    subtitle: 'Signature Shekhawati & Marwari Poshak Styling',
    badge: 'Most Popular',
    duration: '3.5 Hours',
    features: [
      '18-Hour Waterproof HD Base with Tear-Proof Seal',
      'Authentic Rajasthani Poshak & Double-Veil Pinning',
      'Matha Patti, Borla, Nath & Heavy Jewelry Setting',
      'Intricate Floral Couture Bun & Hair Accessories',
      'Custom Lashes & Waterproof Kohl Eye Styling'
    ],
    inquiryMsg: 'Hi Anu Saini, I want to book the "Royal Rajputana Heritage Bridal Package" for my wedding.'
  },
  {
    id: 'pkg_hd_airbrush',
    title: 'Signature HD Airbrush Bridal',
    subtitle: 'Ultra-Lightweight 4K Camera & Studio Finish',
    badge: 'High-Definition',
    duration: '3 Hours',
    features: [
      'Micro-Fine HD Airbrush Application (Zero Cakey Finish)',
      '18-Hour Sweat-Resistant & Waterproof Durability',
      'Flawless Optical Reflection for 4K Wedding Videos',
      'Couture Modern Hair Styling & Dupatta Placement',
      'Premium Silk Lashes & Eye Detailing'
    ],
    inquiryMsg: 'Hi Anu Saini, I want to book the "Signature HD Airbrush Bridal Package" for my wedding.'
  },
  {
    id: 'pkg_reception',
    title: 'Sangeet, Cocktail & Reception Glam',
    subtitle: 'Sculpted Glow for Pre-Wedding & Post-Wedding Events',
    badge: 'Evening Glam',
    duration: '2.5 Hours',
    features: [
      'Glass-Skin Luminous Radiance & Cream Contouring',
      'Smokey Eyes or Rose-Gold Shimmer Lid Artistry',
      'Textured Hollywood Waves or Contemporary Updo',
      'Gown, Lehenga or Saree Draping with Secure Pinning',
      'Long-Wear Velvet Matte Lip Styling'
    ],
    inquiryMsg: 'Hi Anu Saini, I want to book the "Sangeet & Reception Glam Package" for my celebration.'
  },
  {
    id: 'pkg_prebridal',
    title: 'Complete Pre-Bridal Skin & Hair Glow',
    subtitle: 'Clinical Preparation 7–14 Days Prior to Wedding',
    badge: 'Skin Prep',
    duration: 'Full Day Care',
    features: [
      'Medical-Grade Hydrafacial Deep Pore & Hydration Infusion',
      'Diamond Skin Polishing & Natural Herbal Ubtan Glow',
      'Deep-Conditioning Keratin & Moroccan Hair Spa',
      'Bridal Manicure & Pedicure with Long-Stay Polish',
      'Personal Skin Analysis with Cosmetologist Anu Saini'
    ],
    inquiryMsg: 'Hi Anu Saini, I want to book the "Pre-Bridal Skin & Hair Glow Ritual" at Enrich Sikar.'
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Bridal Looks (16)' },
  { id: 'rajasthani', label: 'Royal Rajasthani' },
  { id: 'airbrush', label: 'HD Airbrush' },
  { id: 'reception', label: 'Reception & Sangeet' },
  { id: 'veil', label: 'Veil & Draping' }
];

export default function Bridal() {
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxState, setLightboxState] = useState({ isOpen: false, index: 0, list: [] });

  const activeHeroPhoto = ALL_BRIDAL_PHOTOS[activeHeroIdx] || ALL_BRIDAL_PHOTOS[0];

  const getWhatsAppUrl = (customText) => {
    const text = customText || 'Hi Anu Saini, I want to book a Bridal Makeup appointment at Enrich Sikar. Please share package details and available wedding dates.';
    return `https://wa.me/919667900313?text=${encodeURIComponent(text)}`;
  };

  // Filter gallery photos
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
    <div className="min-h-screen bg-stone-50/60 text-stone-900 pb-28 md:pb-20">
      <SEO
        title="Royal Bridal Makeup Studio Sikar | Enrich Beauty Parlour"
        description="Experience luxury bridal transformations by Lead Cosmetologist Anu Saini at Enrich Sikar. HD Airbrush, Traditional Rajasthani poshak draping, 18-hr waterproof makeup. Book on WhatsApp."
        url="/bridal"
      />

      {/* =========================================================================
          SECTION 1: HERO SPOTLIGHT (Image-Rich, Professional & High-Converting)
          ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-stone-50 border-b border-stone-200/80 pt-4 sm:pt-8 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Top Elegant Breadcrumb & Title */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-rose-50 text-rose-800 border border-rose-200/90 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-700" />
              <span>Sikar's Premier Bridal Studio • Directed by Anu Saini</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
              Bridal Makeup
            </h1>
            <p className="text-xs sm:text-base text-stone-600 font-light">
              Your special day, your perfect look. Royal Shekhawati poshak, HD airbrush, and couture bridal artistry.
            </p>
          </div>

          {/* Hero Grid: Left = Big Photo & Thumbnails; Right = Professional Consultation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left 7 Columns: Featured Photo with 5 Clickable Thumbnails */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-stone-900 border border-stone-200/90 group">
                <img
                  key={activeHeroPhoto.url}
                  src={resolveImageUrl(activeHeroPhoto.url, DEFAULT_SALON_PLACEHOLDER)}
                  alt={activeHeroPhoto.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102"
                  onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/20 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-auto">
                  <span className="text-[11px] font-bold text-white bg-rose-700/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-400/30 shadow-sm flex items-center gap-1.5">
                    <Sparkle className="w-3 h-3 text-amber-300 fill-current" />
                    <span>{activeHeroPhoto.tag}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => openLightbox(ALL_BRIDAL_PHOTOS, activeHeroIdx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-stone-900/85 hover:bg-stone-900 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    title="View Fullscreen Photo"
                    aria-label="View photo in fullscreen lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-rose-300" />
                    <span className="hidden sm:inline">Zoom Fullscreen</span>
                  </button>
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    {activeHeroPhoto.categoryLabel}
                  </span>
                  <h2 className="text-base sm:text-xl font-serif font-bold leading-tight drop-shadow-md">
                    {activeHeroPhoto.title}
                  </h2>
                  <p className="text-xs text-stone-200 line-clamp-1 font-light drop-shadow-sm">
                    {activeHeroPhoto.description}
                  </p>
                </div>
              </div>

              {/* 5 Thumbnails Row Beneath Featured Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-stone-500 px-0.5">
                  <span className="font-semibold text-stone-700 uppercase tracking-wider">
                    Featured Looks (Tap to switch):
                  </span>
                  <span className="text-stone-400">16 Total Looks Below ↓</span>
                </div>

                <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                  {ALL_BRIDAL_PHOTOS.slice(0, 5).map((thumb, idx) => {
                    const isSelected = activeHeroIdx === idx;
                    return (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={() => setActiveHeroIdx(idx)}
                        className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
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
            </div>

            {/* Right 5 Columns: Professional Consultation & Booking Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-lg p-5 sm:p-7 space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit border border-amber-200/80">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>4.9★ Rated • 500+ Brides Styled in Sikar</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                  Book Your Wedding Look
                </h3>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Personal 1-on-1 bridal styling under Lead Cosmetologist <strong>Anu Saini</strong> at our Sharda Heights studio.
                </p>
              </div>

              {/* Verified Feature Bullets */}
              <div className="space-y-2.5 text-xs text-stone-700 border-y border-stone-100 py-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>18-Hour Waterproof Base:</strong> Tear-proof, humidity-resistant, 4K camera ready.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Authentic Rajasthani Draping:</strong> Heavy poshak, double dupatta & matha patti pinning.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Premium Cosmetics:</strong> MAC, Huda Beauty, NARS, and Temptu HD Airbrush.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                  <span><strong>Private Suite:</strong> Air-conditioned bridal dressing room with dedicated vanity.</span>
                </div>
              </div>

              {/* Primary Booking Actions: Clear, Prominent, WhatsApp-First */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={getWhatsAppUrl(`Hi Anu Saini, I am interested in booking the "${activeHeroPhoto.title}" bridal look for my wedding.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                  <span>Book on WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+919667900313"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200/80 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-700" />
                    <span>Call: 96679 00313</span>
                  </a>

                  <a
                    href="#bridal-gallery"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200/80 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-700" />
                    <span>View 16 Photos</span>
                  </a>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 text-center font-light">
                ⚡ Only 2 brides accepted per auspicious wedding date for undivided focus.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 4 PROFESSIONAL BRIDAL PACKAGES (With "Book on WhatsApp")
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Wedding Packages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Bridal Packages & Services
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light">
            Every package includes direct consultation with Anu Saini and premium cosmetic brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {BRIDAL_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md hover:border-rose-300 transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200/70">
                    {pkg.badge}
                  </span>
                  <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pkg.duration}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-rose-700 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-light mt-0.5">
                    {pkg.subtitle}
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-stone-600 pt-1">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct WhatsApp Booking Button for This Package */}
              <div className="pt-2">
                <a
                  href={getWhatsAppUrl(pkg.inquiryMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Book on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PHOTO GALLERY (16 Real Photos, Every Photo Has "Book on WhatsApp")
          ========================================================================= */}
      <section id="bridal-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-6 scroll-mt-16">
        
        {/* Gallery Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>Real Brides of Enrich Atelier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
              Bridal Portfolio ({ALL_BRIDAL_PHOTOS.length} Looks)
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light">
              Tap any photo to zoom in high-definition, or tap "Book on WhatsApp" to reserve that exact look.
            </p>
          </div>

          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-3 py-1 rounded-full self-start sm:self-end">
            Showing {filteredPhotos.length} of {ALL_BRIDAL_PHOTOS.length} Looks
          </span>
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

        {/* Responsive Grid: 2 columns on Mobile, 4 columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-rose-200 transition-all duration-300 flex flex-col"
            >
              {/* Photo Area with Lightbox Click & Hover Zoom */}
              <div
                onClick={() => openLightbox(filteredPhotos, idx)}
                className="relative aspect-[3/4] w-full overflow-hidden bg-stone-900 cursor-pointer"
              >
                <img
                  src={resolveImageUrl(photo.url, DEFAULT_SALON_PLACEHOLDER)}
                  alt={photo.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/15 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

                {/* Tag Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="text-[10px] font-bold text-white bg-stone-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                    {photo.tag}
                  </span>
                </div>

                {/* Zoom Icon Button in Top Right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(filteredPhotos, idx);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-stone-900/80 hover:bg-rose-700 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-10"
                  title="Zoom Photo"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Hover Caption Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] uppercase font-bold text-rose-300">
                    {photo.categoryLabel}
                  </span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm line-clamp-1 drop-shadow-sm">
                    {photo.title}
                  </h4>
                </div>
              </div>

              {/* Card Footer: Short Title & Direct "Book on WhatsApp" */}
              <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 space-y-2.5">
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-light line-clamp-1 mt-0.5">
                    {photo.description}
                  </p>
                </div>

                <a
                  href={getWhatsAppUrl(`Hi Anu Saini, I saw the "${photo.title}" photo in your bridal gallery and would like to book an appointment for this look.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                  title="Book this bridal look on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Book on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ANU SAINI ARTIST SPOTLIGHT & BRIDAL CONSULTATION BANNER
          ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-stone-800">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-rose-400/50 shadow-xl shrink-0">
              <img
                src={ALL_BRIDAL_PHOTOS[0].url}
                alt="Lead Artist Anu Saini"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="space-y-2 text-center md:text-left flex-1">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-widest bg-rose-950/60 border border-rose-800/60 px-3 py-1 rounded-full">
                Lead Cosmetologist & Bridal Specialist
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Anu Saini • Enrich Sikar
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl leading-relaxed">
                Specializing in couture Rajasthani bridal transformations, precision jewelry setting, and long-wear HD airbrush artistry. Every bride receives undivided personal consultation and custom styling.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href={getWhatsAppUrl('Hi Anu Saini, I would like to schedule a personal bridal consultation and makeup trial at your Sikar salon.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Book on WhatsApp</span>
                </a>

                <a
                  href="tel:+919667900313"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
                >
                  <Phone className="w-4 h-4 text-rose-300" />
                  <span>Call: +91 96679 00313</span>
                </a>
              </div>
            </div>
          </div>
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
