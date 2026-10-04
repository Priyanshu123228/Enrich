import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Star, 
  ShoppingBag, 
  Eye, 
  Check, 
  ShieldCheck, 
  Leaf, 
  Heart, 
  RefreshCw, 
  X, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  SlidersHorizontal,
  Package,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { productService } from '../services/product.service';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: Sparkles },
  { id: 'Skincare', label: 'Skincare', icon: Leaf },
  { id: 'Haircare', label: 'Haircare', icon: Zap },
  { id: 'Makeup & Cosmetics', label: 'Makeup & Cosmetics', icon: Heart },
  { id: 'Serums & Treatments', label: 'Serums & Treatments', icon: Award },
  { id: 'Organic & Ayurvedic', label: 'Organic & Ayurvedic', icon: Leaf },
  { id: 'Body & Spa', label: 'Body & Spa', icon: Package }
];

const SKIN_TYPES = [
  'All Skin Types',
  'Anti-Aging',
  'Dull Skin',
  'Dry',
  'Sensitive',
  'All Hair Types',
  'Frizzy Hair',
  'Fine Hair',
  'Pigmentation',
  'All Skin Tones'
];

export default function Cosmetics() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkinType, setSelectedSkinType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSkinType, sortBy, inStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        sort: sortBy,
        inStock: inStockOnly ? 'true' : 'false'
      };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedSkinType !== 'all') {
        params.skinType = selectedSkinType;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await productService.getProducts(params);
      const list = res?.products || res?.data?.products || (Array.isArray(res) ? res : []);
      setProducts(list);
    } catch (err) {
      console.error('Fetch cosmetics error:', err);
      setError(err.message || 'Failed to load cosmetic products catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const getWhatsAppUrl = (product) => {
    const text = `Hello Enrich Beauty & Cosmetic Clinic! I would like to inquire about / purchase "${product.name}" (₹${product.price}). Please share order details and availability.`;
    return `https://wa.me/919667900313?text=${encodeURIComponent(text)}`;
  };
  return (
    <div className="bg-stone-50/60 min-h-screen pb-20">
      {/* 1. Ultra-Luxury Champagne & Rose Hero Banner */}
      <section className="relative bg-gradient-to-b from-[#FDFBF7] via-[#FAF5EE] to-[#F5EFEB] text-stone-900 overflow-hidden py-16 sm:py-24 border-b border-stone-200/90">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-200/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-rose-50 text-rose-800 border border-rose-200 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            Enrich Cosmetic Pharmacy & Luxury Salon Retail
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Clinical Aesthetics & <span className="text-rose-700 italic font-serif">Salon Formulations</span>
          </h1>
          <p className="mt-4 text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Dermatologically tested facial elixirs, organic Kashmiri saffron oils, and salon-grade hair rituals formulated for high-performance beauty care.
          </p>

          {/* Trust Pillars */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-xs backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">100% Authentic</div>
                <div className="text-[10px] text-stone-500">Clinical Formulation</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-xs backdrop-blur-xs">
              <Award className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">Dermatologist Tested</div>
                <div className="text-[10px] text-stone-500">Paraben & Toxin Free</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-xs backdrop-blur-xs">
              <Leaf className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">Cruelty Free</div>
                <div className="text-[10px] text-stone-500">Ethically Sourced</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-xs backdrop-blur-xs">
              <MessageCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-stone-900">Direct WhatsApp Order</div>
                <div className="text-[10px] text-stone-500">Salon Pickup & Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/20'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-stone-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Skin Type & Sort Filter Bar */}
        <div className="mt-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-stone-900 placeholder-stone-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Skin Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500 hidden lg:inline">Skin/Hair:</span>
              <select
                value={selectedSkinType}
                onChange={(e) => setSelectedSkinType(e.target.value)}
                className="text-xs font-semibold px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
              >
                <option value="all">All Compatibility</option>
                {SKIN_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500 hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="best_sellers">Best Sellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>
        {/* 3. Product Catalog Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="py-24 bg-white rounded-3xl border border-stone-200 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm font-semibold text-stone-700">Loading cosmetic formulations...</p>
            </div>
          ) : error ? (
            <div className="py-16 bg-white rounded-3xl border border-rose-200 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
              <p className="text-sm font-bold text-rose-700">{error}</p>
              <button onClick={fetchProducts} className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold">
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 bg-white rounded-3xl border border-stone-200 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No cosmetic products found</h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Try selecting another category or clearing your search filters to view more products.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSkinType('all');
                  setSearchQuery('');
                  setInStockOnly(false);
                }}
                className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0 || !product.isAvailable;
                const savings = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-stone-100">
                        <img
                          src={resolveImageUrl(product.thumbnail || (product.images && product.images[0]?.url))}
                          onError={handleImageError}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {product.badge && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                              {product.badge}
                            </span>
                          )}
                          {savings > 0 && !product.badge && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                              {savings}% OFF
                            </span>
                          )}
                        </div>

                        {/* Quick View Button on Image Hover */}
                        <div className="absolute bottom-3 inset-x-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <button
                            onClick={() => {
                              setQuickViewProduct(product);
                              setActiveImageIndex(0);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-bold shadow-lg backdrop-blur-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-rose-600" />
                            Quick Details View
                          </button>
                        </div>
                      </div>

                      {/* Product Content Details */}
                      <div className="p-5">
                        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                          <span className="uppercase tracking-wider font-semibold text-rose-700">{product.brand}</span>
                          <span>{product.volume}</span>
                        </div>

                        <Link to={`/cosmetics/${product.slug || product._id}`}>
                          <h3 className="font-serif font-bold text-base text-stone-900 mt-1 line-clamp-1 group-hover:text-rose-700 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Star Rating & Review Count */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-stone-700">{product.rating || 4.8}</span>
                          <span className="text-[11px] text-stone-400">({product.numReviews || 18})</span>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs text-stone-500 mt-2.5 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Price Row */}
                        <div className="mt-4 flex items-baseline gap-2 pt-3 border-t border-stone-100">
                          <span className="text-xl font-bold font-serif text-stone-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-stone-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {savings > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Save {savings}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-5 pt-0 flex flex-col gap-2">
                      <a
                        href={getWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Order on WhatsApp
                      </a>

                      <Link
                        to={`/cosmetics/${product.slug || product._id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                      >
                        View Full Clinical Specs
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {/* 4. Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Image & Thumbnails */}
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={resolveImageUrl((quickViewProduct.images && quickViewProduct.images[activeImageIndex]?.url) || quickViewProduct.thumbnail)}
                    onError={handleImageError}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {quickViewProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                          activeImageIndex === idx ? 'border-rose-600' : 'border-stone-200 opacity-70'
                        }`}
                      >
                        <img src={resolveImageUrl(img.url)}
                        onError={handleImageError} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info & Specs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      {quickViewProduct.brand}
                    </span>
                    <span className="text-xs text-stone-400">• {quickViewProduct.category}</span>
                  </div>
                  <h2 className="text-xl font-bold font-serif text-stone-900 mt-1">
                    {quickViewProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-stone-700">{quickViewProduct.rating || 4.8}</span>
                    <span className="text-xs text-stone-400">({quickViewProduct.numReviews || 18} reviews)</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                  <span className="text-2xl font-bold font-serif text-stone-900">
                    ₹{quickViewProduct.price.toLocaleString()}
                  </span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{quickViewProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full ml-auto">
                    In Stock ({quickViewProduct.stock || 20} available)
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Key Benefits */}
                {quickViewProduct.keyBenefits && quickViewProduct.keyBenefits.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                      Key Clinical Benefits:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      {quickViewProduct.keyBenefits.slice(0, 3).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Direct Order Actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={getWhatsAppUrl(quickViewProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order / Inquire on WhatsApp
                  </a>

                  <Link
                    to={`/cosmetics/${quickViewProduct.slug || quickViewProduct._id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    Full Specs
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
