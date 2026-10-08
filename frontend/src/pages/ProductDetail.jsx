import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Lock, 
  Star, 
  ShieldCheck, 
  Leaf, 
  Award, 
  Check, 
  MessageCircle, 
  ArrowLeft, 
  Heart, 
  Share2, 
  RefreshCw, 
  Package, 
  Truck, 
  HelpCircle, 
  Clock, 
  Phone,
  ChevronRight,
  ArrowRight,
  X,
  UserCheck
} from 'lucide-react';
import { productService } from '../services/product.service';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

const AUTHENTIC_CATALOG = [
  {
    _id: 'enrich-prod-1',
    name: '24K Gold Radiance Youth Serum',
    slug: '24k-gold-radiance-youth-serum',
    brand: 'Enrich Clinical Luxury',
    category: 'Serums & Treatments',
    subcategory: 'Face Serums',
    price: 1899,
    originalPrice: 2499,
    discountPercent: 24,
    rating: 4.9,
    numReviews: 48,
    stock: 25,
    volume: '30 ml / 1.0 fl oz',
    skinType: ['All Skin Types', 'Anti-Aging', 'Dull Skin'],
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    badge: 'Best Seller',
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80', alt: 'Gold Radiance Serum' },
      { url: 'https://images.unsplash.com/photo-1608248597359-460d3d5267a1?w=800&auto=format&fit=crop&q=80', alt: 'Gold Dropper Texture' }
    ],
    description: 'An ultra-luxurious rejuvenating serum infused with pure 24-karat gold flakes, bioactive peptides, and botanical hyaluronic acid. Visibly firms, illuminates, and restores radiant youthful elasticity.',
    keyBenefits: [
      'Boosts natural collagen synthesis and micro-circulation',
      'Infuses skin with 24K real gold luminescence',
      'Deep 72-hour hydration with tri-molecular hyaluronic acid',
      'Non-comedogenic, lightweight velvet finish'
    ],
    ingredients: ['24K Pure Gold Flakes', 'Hyaluronic Acid Complex', 'Niacinamide (5%)', 'Rosehip Seed Oil', 'Vitamin E & C Ester'],
    howToUse: 'Apply 3–4 drops onto freshly cleansed face and décolletage every morning and evening. Pat gently with fingertips in an upward motion before moisturizing.'
  },
  {
    _id: 'enrich-prod-2',
    name: 'Pure Damask Rose Hydrating Face Mist',
    slug: 'pure-damask-rose-hydrating-face-mist',
    brand: 'Enrich Botanicals',
    category: 'Skincare',
    subcategory: 'Toners & Mists',
    price: 699,
    originalPrice: 899,
    discountPercent: 22,
    rating: 4.8,
    numReviews: 34,
    stock: 40,
    volume: '100 ml / 3.4 fl oz',
    skinType: ['All Skin Types', 'Sensitive', 'Dry'],
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    badge: 'Popular',
    thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80', alt: 'Rose Mist Bottle' }
    ],
    description: 'Steam-distilled from freshly harvested organic Damask roses. Instantly hydrates, refines pores, balances pH levels, and revitalizes tired skin with a soothing aromatic sensation.',
    keyBenefits: [
      '100% pure organic steam-distilled rose distillate',
      'Instantly tightens pores and restores skin barrier',
      'Calms redness, irritation, and sun exposure',
      'Alcohol-free and gentle for sensitive skin'
    ],
    ingredients: ['Pure Rosa Damascena Flower Water', 'Glycerin', 'Aloe Barbadensis Leaf Juice', 'Sodium Hyaluronate'],
    howToUse: 'Hold bottle 6–8 inches away from face and spritz 2–3 times. Use post-cleansing, to set makeup, or anytime throughout the day for an instant refresh.'
  },
  {
    _id: 'enrich-prod-3',
    name: 'Moroccan Argan & Keratin Hair Elixir',
    slug: 'moroccan-argan-keratin-hair-elixir',
    brand: 'Enrich Hair Rituals',
    category: 'Haircare',
    subcategory: 'Hair Oils & Serums',
    price: 1249,
    originalPrice: 1599,
    discountPercent: 21,
    rating: 4.9,
    numReviews: 56,
    stock: 30,
    volume: '100 ml / 3.4 fl oz',
    skinType: ['All Hair Types', 'Frizzy Hair', 'Fine Hair'],
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    badge: 'Salon Pick',
    thumbnail: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80', alt: 'Hair Elixir Bottle' }
    ],
    description: 'Cold-pressed Moroccan Argan oil blended with hydrolyzed micro-keratin protein. Delivers salon mirror-gloss, tames stubborn frizz, protects up to 230°C heat styling, and repairs split ends.',
    keyBenefits: [
      'Thermal defense up to 230°C heat styling',
      'Eliminates 99% humidity-induced frizz instantly',
      'Non-greasy, fast-absorbing weightless formula',
      'Intense silk gloss and deep cortex hydration'
    ],
    ingredients: ['Organic Argania Spinosa Kernel Oil', 'Hydrolyzed Keratin', 'Cyclopentasiloxane', 'Vitamin E Acetate'],
    howToUse: 'Rub 1–2 pumps between palms and apply evenly through mid-lengths and ends of damp or dry hair before styling.'
  },
  {
    _id: 'enrich-prod-4',
    name: 'Bridal Velvet Matte Lip Pigment - Royal Crimson',
    slug: 'bridal-velvet-matte-lip-pigment-royal-crimson',
    brand: 'Enrich Cosmetic Studio',
    category: 'Makeup & Cosmetics',
    subcategory: 'Lipsticks',
    price: 899,
    originalPrice: 1199,
    discountPercent: 25,
    rating: 4.7,
    numReviews: 29,
    stock: 50,
    volume: '4.5 g / 0.16 oz',
    skinType: ['All Skin Tones'],
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    badge: 'Bridal Choice',
    thumbnail: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80', alt: 'Velvet Lip Pigment' }
    ],
    description: 'High-intensity, transfer-resistant bridal red pigment with comfortable botanical conditioning oils. Provides 16-hour rich color payoff without drying or feathering.',
    keyBenefits: [
      '16-hour transfer-proof bridal hold',
      'Infused with jojoba butter & vitamin E',
      'Ultra-saturated high-definition color payoff',
      'Smudge-resistant velvet matte finish'
    ],
    ingredients: ['Isododecane', 'Simmondsia Chinensis (Jojoba) Butter', 'Tocopherol (Vitamin E)', 'Mineral Pigments'],
    howToUse: 'Define lip perimeter with the precision applicator tip, then fill in with single stroke for opaque coverage. Allow 60 seconds to set.'
  },
  {
    _id: 'enrich-prod-5',
    name: 'Advanced Vitamin C Glow & Spot Corrector Cream',
    slug: 'advanced-vitamin-c-glow-spot-corrector-cream',
    brand: 'Enrich Clinical Luxury',
    category: 'Skincare',
    subcategory: 'Creams & Moisturizers',
    price: 1499,
    originalPrice: 1899,
    discountPercent: 21,
    rating: 4.8,
    numReviews: 41,
    stock: 20,
    volume: '50 g / 1.76 oz',
    skinType: ['All Skin Types', 'Pigmentation', 'Dull Skin'],
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    badge: 'Dermat Tested',
    thumbnail: 'https://images.unsplash.com/photo-1608248597359-460d3d5267a1?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1608248597359-460d3d5267a1?w=800&auto=format&fit=crop&q=80', alt: 'Vitamin C Cream Pot' }
    ],
    description: 'Formulated with 15% stabilized Ethyl Ascorbic Acid, Ferulic Acid, and Glutathione. Clinically targets hyperpigmentation, uneven skin tone, and dark spots while restoring luminous clarity.',
    keyBenefits: [
      'Fades dark spots and sun-induced discoloration',
      'Shields against environmental oxidative stressors',
      'Enhances natural collagen bounce & firmness',
      'Silky non-greasy day & night cream base'
    ],
    ingredients: ['3-O-Ethyl Ascorbic Acid (15%)', 'Ferulic Acid (1%)', 'Glutathione', 'Shea Butter', 'Hyaluronic Acid'],
    howToUse: 'Warm a pea-sized amount between fingers and massage onto clean face and neck in circular motions every morning and night.'
  },
  {
    _id: 'enrich-prod-6',
    name: 'Ayurvedic Kumkumadi Miraculous Night Oil',
    slug: 'ayurvedic-kumkumadi-miraculous-night-oil',
    brand: 'Enrich Organic & Ayurvedic',
    category: 'Organic & Ayurvedic',
    subcategory: 'Face Oils',
    price: 2199,
    originalPrice: 2799,
    discountPercent: 21,
    rating: 5.0,
    numReviews: 62,
    stock: 15,
    volume: '25 ml / 0.85 fl oz',
    skinType: ['All Skin Types', 'Dull Skin', 'Anti-Aging'],
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    badge: 'Heritage Elixir',
    thumbnail: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80', alt: 'Kumkumadi Oil Dropper' }
    ],
    description: 'An ancient classical Ayurvedic preparation formulated with pure Kashmiri Saffron, Sandalwood, Manjistha, and 26 rare Himalayan herbs slow-cooked in goat milk and sesame oil for overnight renewal.',
    keyBenefits: [
      'Authentic Kashmiri Mogra Saffron infusion',
      'Illuminates complexion and clears blemishes',
      'Slows cellular aging and softens fine lines',
      '100% Ayurvedic, zero chemicals or preservatives'
    ],
    ingredients: ['Kashmiri Kesar (Saffron)', 'Chandan (Sandalwood)', 'Manjistha', 'Goat Milk', 'Sesamum Indicum Seed Oil'],
    howToUse: 'Take 3–4 drops in palms, gently press over cleansed face and neck, and massage in upward strokes before sleeping.'
  },
  {
    _id: 'enrich-prod-7',
    name: 'Sulfate-Free Caviar Volume & Repair Shampoo',
    slug: 'sulfate-free-caviar-volume-repair-shampoo',
    brand: 'Enrich Hair Rituals',
    category: 'Haircare',
    subcategory: 'Shampoos',
    price: 1099,
    originalPrice: 1399,
    discountPercent: 21,
    rating: 4.7,
    numReviews: 38,
    stock: 35,
    volume: '250 ml / 8.45 fl oz',
    skinType: ['Fine Hair', 'All Hair Types', 'Frizzy Hair'],
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    badge: 'Sulfate Free',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', alt: 'Caviar Shampoo Bottle' }
    ],
    description: 'A gentle sulfate-free cleanser enriched with French Caviar extract, Wheat Protein, and Provitamin B5. Restores root volume, locks in color vibrancy, and deeply fortifies weak hair shafts.',
    keyBenefits: [
      '100% Sulfate, Paraben & Salt Free',
      'Preserves keratin & smoothing treatments',
      'Adds touchable weightless root bounce',
      'Nourishes scalp and reduces hair breakage'
    ],
    ingredients: ['Caviar Extract', 'Hydrolyzed Wheat Protein', 'Panthenol (Pro-Vitamin B5)', 'Sodium Lauroyl Sarcosinate'],
    howToUse: 'Apply to wet scalp and massage vigorously to create creamy foam. Rinse thoroughly with lukewarm water.'
  },
  {
    _id: 'enrich-prod-8',
    name: 'Ultra-Hydrating Sea Kelp Body Butter & Spa Polish',
    slug: 'ultra-hydrating-sea-kelp-body-butter-spa-polish',
    brand: 'Enrich Body & Spa',
    category: 'Body & Spa',
    subcategory: 'Body Lotions & Butters',
    price: 999,
    originalPrice: 1299,
    discountPercent: 23,
    rating: 4.9,
    numReviews: 24,
    stock: 25,
    volume: '200 g / 7.05 oz',
    skinType: ['Dry', 'All Skin Types'],
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    badge: 'Spa Luxury',
    thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80', alt: 'Body Butter Tub' }
    ],
    description: 'Deep ocean mineral sea kelp whipped with African Shea Butter and Sweet Almond Oil. Delivers 48-hour intense nourishment for silky soft, velvety, and supple body texture.',
    keyBenefits: [
      'Whipped rich texture that melts instantly into skin',
      '48-hour moisture barrier repair',
      'Enriched with ocean marine minerals',
      'Subtle calming jasmine and sea salt fragrance'
    ],
    ingredients: ['Laminaria Digitata (Sea Kelp) Extract', 'Butyrospermum Parkii (Shea) Butter', 'Prunus Amygdalus Dulcis (Sweet Almond) Oil'],
    howToUse: 'Smooth generously all over body after bath or shower, focusing on dry areas like elbows, knees, and heels.'
  }
];

export default function ProductDetail() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await productService.getProduct(id);
      const data = res?.product || res?.data?.product || res?.data || res;
      if (data && data.name) {
        setProduct(data);
        const rels = res?.relatedProducts || res?.data?.relatedProducts || [];
        setRelatedProducts(rels.length > 0 ? rels : AUTHENTIC_CATALOG.filter(p => (p.slug !== id && p._id !== id)).slice(0, 4));
      } else {
        throw new Error('Product not found in database');
      }
    } catch (err) {
      console.warn('Fetch product detail API notice, searching authentic catalog:', err.message);
      // Find matching item in fallback catalog
      const match = AUTHENTIC_CATALOG.find(p => p.slug === id || p._id === id || p.name.toLowerCase().includes(String(id).toLowerCase()));
      if (match) {
        setProduct(match);
        setRelatedProducts(AUTHENTIC_CATALOG.filter(p => p.slug !== match.slug && p._id !== match._id).slice(0, 4));
      } else {
        setError(err.message || 'Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getWhatsAppUrl = () => {
    if (!product) return '#';
    const text = `Hello Enrich Beauty & Cosmetic Clinic! I am interested in purchasing "${product.name}" (Price: ₹${product.price}). Please share order instructions and salon delivery details.`;
    return `https://wa.me/919667900313?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50/60">
        <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mb-3" />
        <p className="text-sm font-semibold text-stone-700">Loading cosmetic formulation...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50/60 p-4 text-center">
        <h2 className="text-xl font-bold font-serif text-stone-900 mb-2">Cosmetic Product Not Found</h2>
        <p className="text-xs text-stone-500 mb-4 max-w-sm">{error || 'The requested cosmetic product formulation is not available.'}</p>
        <Link to="/cosmetics" className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors">
          Return to Cosmetics Catalog
        </Link>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0) ? product.images : [{ url: product.thumbnail }];
  const savings = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="bg-stone-50/60 min-h-screen pb-20">
      {/* Breadcrumbs Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/cosmetics" className="hover:text-stone-900 transition-colors">Cosmetics</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Main Product Showcase Section */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative group">
              <img
                src={resolveImageUrl(images[activeImageIndex]?.url || product.thumbnail)}
                onError={handleImageError}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white shadow-xs">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-rose-600 ring-2 ring-rose-600/20 scale-102' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveImageUrl(img.url)}
                    onError={handleImageError} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Specifications & Direct Purchase CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-wide font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  {product.brand || 'Enrich Cosmetic Studio'}
                </span>
                <span className="text-xs text-stone-400">• {product.category}</span>
                <span className="text-xs text-stone-400">• {product.volume}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2 leading-tight">
                {product.name}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center text-amber-500" aria-label={`Rating: ${product.rating || 4.8} out of 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-900">{product.rating || 4.8} / 5.0</span>
                <span className="text-xs text-stone-400">({product.numReviews || 18} verified reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            {isAuthenticated ? (
              <div className="p-5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif font-bold text-stone-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-base text-stone-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      {savings}% OFF
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-emerald-700">
                  ✓ In Stock ({product.stock} units available)
                </div>
              </div>
            ) : (
              <div
                onClick={() => setShowAuthModal(true)}
                className="group relative p-6 bg-gradient-to-r from-rose-50/70 via-stone-50 to-rose-50/70 rounded-xl border border-rose-200/90 hover:border-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden select-none"
                title="Click to sign in and unlock verified clinical pricing"
              >
                {/* Blurred Price in Background */}
                <div className="flex items-baseline justify-between flex-wrap gap-2 blur-md opacity-30 group-hover:opacity-20 transition-opacity">
                  <span className="text-3xl font-serif font-bold text-stone-900">
                    ₹{product.price || 1299}
                  </span>
                  <span className="text-base text-stone-400 line-through">
                    ₹{product.originalPrice || 1699}
                  </span>
                </div>

                {/* Gate Overlay */}
                <div className="absolute inset-0 flex items-center justify-between p-6 bg-white/70 backdrop-blur-xs group-hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-rose-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Salon Pricing Locked</h3>
                      <p className="text-xs text-rose-700 font-semibold">Sign in to view retail formulation price</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-lg bg-rose-700 group-hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-all shrink-0">
                    Sign In
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Key Benefits */}
            {product.keyBenefits && product.keyBenefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Clinical Benefits:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.keyBenefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Active Formulation Ingredients:
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing, i) => (
                    <span key={i} className="text-xs font-medium text-stone-700 bg-stone-100 border border-stone-200/80 px-2.5 py-1 rounded-lg">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* How to Use Section */}
            {product.howToUse && (
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                <h3 className="text-xs font-bold uppercase tracking-wide text-rose-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  How to Use & Salon Tips:
                </h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {product.howToUse}
                </p>
              </div>
            )}

            {/* Action Buttons - Standardized button system */}
            <div className="pt-2 space-y-3">
              {isAuthenticated ? (
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-6 rounded-lg text-xs sm:text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 shadow-xs transition-colors active:scale-98 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-6 rounded-lg text-xs sm:text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 shadow-xs transition-colors active:scale-98 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to View Price & Order</span>
                </button>
              )}

              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
              >
                <Phone className="w-4 h-4 text-stone-600" />
                <span>Inquire with Beauty Consultant</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Cosmetic Formulations */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  Related Cosmetic Formulations
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">Explore complementary skincare and beauty rituals</p>
              </div>
              <Link to="/cosmetics" className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1">
                <span>View All Cosmetics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel._id || rel.slug}
                  to={`/cosmetics/${rel.slug || rel._id}`}
                  className="group bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-stone-100 mb-3">
                    <img 
                      src={resolveImageUrl(rel.thumbnail)}
                      onError={handleImageError} 
                      alt={rel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <span className="text-xs tracking-wide font-semibold text-rose-700">{rel.brand || 'Enrich Cosmetic Studio'}</span>
                  <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-rose-700 mt-0.5">{rel.name}</h3>
                  
                  <div className="mt-2">
                    {isAuthenticated ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif font-bold text-sm text-stone-900">₹{rel.price.toLocaleString()}</span>
                        {rel.originalPrice > rel.price && (
                          <span className="text-xs text-stone-400 line-through">₹{rel.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                        <Lock className="w-3 h-3" />
                        Sign in for price
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Interactive Sign-In Modal Dialog */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Heading */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-100 via-rose-50 to-amber-50 text-rose-700 flex items-center justify-center mx-auto shadow-xs border border-rose-200">
              <Lock className="w-8 h-8 text-rose-700" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold tracking-wide text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                Exclusive Salon Retail Access
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900 mt-2">
                Sign In to Unlock Clinical Pricing
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto font-light">
                Please sign in to view official formulation pricing, batch testing records, and direct WhatsApp checkout for <strong>{product.name}</strong>.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Link
                to={`/login?redirect=/cosmetics/${id}`}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs tracking-wide shadow-xs transition-colors cursor-pointer active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
              >
                Sign In to My Account
              </Link>

              <Link
                to={`/signup?redirect=/cosmetics/${id}`}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 shadow-2xs transition-colors cursor-pointer active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
              >
                Create New Account
              </Link>
            </div>

            <p className="text-xs text-stone-400">
              Instant access • 100% Authentic Clinical Formulations
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
