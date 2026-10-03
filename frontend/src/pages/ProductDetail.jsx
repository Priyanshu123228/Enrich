import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
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
  ChevronRight
} from 'lucide-react';
import { productService } from '../services/product.service';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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
      setProduct(data);
      setRelatedProducts(res?.relatedProducts || res?.data?.relatedProducts || []);
    } catch (err) {
      console.error('Fetch product detail error:', err);
      setError(err.message || 'Failed to load product details');
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
    return `https://wa.me/919024659116?text=${encodeURIComponent(text)}`;
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
        <Link to="/cosmetics" className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-xs">
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
            <Link to="/" className="hover:text-stone-900">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/cosmetics" className="hover:text-stone-900">Cosmetics</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Main Product Showcase Section */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 relative group">
              <img
                src={resolveImageUrl(images[activeImageIndex]?.url || product.thumbnail)}
                onError={handleImageError}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-rose-600 ring-2 ring-rose-600/20 scale-105' : 'border-stone-200 opacity-70 hover:opacity-100'
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
                <span className="text-xs font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                  {product.brand}
                </span>
                <span className="text-xs text-stone-400">• {product.category}</span>
                <span className="text-xs text-stone-400">• {product.volume}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2 leading-tight">
                {product.name}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-stone-900">{product.rating || 4.8} / 5.0</span>
                <span className="text-xs text-stone-400">({product.numReviews || 18} verified salon reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-baseline justify-between flex-wrap gap-2">
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
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {savings}% Discount
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-emerald-700">
                ✓✓ In Stock ({product.stock} units available)
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                Formula Description
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Benefits List */}
            {product.keyBenefits && product.keyBenefits.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2.5">
                  Proven Clinical Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Use Section */}
            {product.howToUse && (
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  How to Use & Salon Tips:
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {product.howToUse}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                Order Directly on WhatsApp (Fast Checkout)
              </a>

              <Link
                to="/contact"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-stone-600" />
                Inquire with Beauty Consultant
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
                View All Cosmetics
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/cosmetics/${rel.slug || rel._id}`}
                  className="group bg-white rounded-3xl border border-stone-200/80 p-4 shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-3">
                    <img src={resolveImageUrl(rel.thumbnail)}
                    onError={handleImageError} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">{rel.brand}</span>
                  <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-rose-700">{rel.name}</h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-serif font-bold text-sm text-stone-900">₹{rel.price.toLocaleString()}</span>
                    {rel.originalPrice > rel.price && (
                      <span className="text-xs text-stone-400 line-through">₹{rel.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
