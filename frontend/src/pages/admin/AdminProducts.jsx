import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  RefreshCw, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Star, 
  Tag, 
  Layers, 
  Upload, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { productService } from '../../services/product.service';

const CATEGORIES = [
  'Skincare',
  'Haircare',
  'Makeup & Cosmetics',
  'Serums & Treatments',
  'Bridal Essentials',
  'Body & Spa',
  'Organic & Ayurvedic'
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Enrich Clinical Luxury',
    category: 'Skincare',
    subcategory: 'General',
    price: '',
    originalPrice: '',
    stock: 20,
    volume: '50 ml',
    thumbnail: '',
    description: '',
    keyBenefits: '',
    ingredients: '',
    howToUse: '',
    isFeatured: true,
    isBestSeller: false,
    badge: ''
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      const res = await productService.getProducts(params);
      const list = res?.products || res?.data?.products || (Array.isArray(res) ? res : []);
      setProducts(list);
    } catch (err) {
      console.error('Fetch admin products error:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: 'Enrich Clinical Luxury',
      category: 'Skincare',
      subcategory: 'General',
      price: '',
      originalPrice: '',
      stock: 25,
      volume: '50 ml',
      thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      description: '',
      keyBenefits: '',
      ingredients: '',
      howToUse: 'Apply evenly to clean skin or hair.',
      isFeatured: true,
      isBestSeller: false,
      badge: 'New Arrival'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || 'Enrich Clinical Luxury',
      category: product.category || 'Skincare',
      subcategory: product.subcategory || 'General',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock !== undefined ? product.stock : 20,
      volume: product.volume || '50 ml',
      thumbnail: product.thumbnail || (product.images && product.images[0]?.url) || '',
      description: product.description || '',
      keyBenefits: Array.isArray(product.keyBenefits) ? product.keyBenefits.join('\n') : (product.keyBenefits || ''),
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || ''),
      howToUse: product.howToUse || '',
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : true,
      isBestSeller: Boolean(product.isBestSeller),
      badge: product.badge || ''
    });
    setModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
        stock: Number(formData.stock),
        keyBenefits: formData.keyBenefits.split('\n').map(s => s.trim()).filter(Boolean),
        ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        images: [{ url: formData.thumbnail || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80' }]
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        showFeedback('Cosmetic product updated successfully');
      } else {
        await productService.createProduct(payload);
        showFeedback('New cosmetic product added to catalog');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      showFeedback(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      showFeedback('Product deleted from catalog');
    } catch (err) {
      showFeedback(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Reset and re-seed 8 luxury cosmetic products?')) {
      return;
    }
    try {
      setLoading(true);
      await productService.seedProducts();
      showFeedback('Successfully seeded luxury cosmetic products');
      fetchProducts();
    } catch (err) {
      showFeedback(err.message || 'Failed to seed products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(q);
    const brandMatch = p.brand?.toLowerCase().includes(q);
    const catMatch = p.category?.toLowerCase().includes(q);
    return nameMatch || brandMatch || catMatch;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 5).length,
    lowStock: products.filter(p => p.stock <= 5 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock <= 0).length
  };
  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              Cosmetic Products & Retail Catalog
            </h1>
          </div>
          <p className="text-sm text-stone-500 mt-1.5">
            Manage cosmetic pharmacy inventory, pricing, stock levels, clinical formulations, and customer retail listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Seed Sample Formulas
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Cosmetic Product
          </button>
        </div>
      </div>

      {/* 2. Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 border shadow-xs animate-in fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* 3. Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Products</div>
          <div className="text-3xl font-bold font-serif text-stone-900 mt-2">{stats.total}</div>
          <div className="text-xs text-stone-400 mt-0.5">Catalog listings</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">In Stock</div>
          <div className="text-3xl font-bold font-serif text-emerald-700 mt-2">{stats.inStock}</div>
          <div className="text-xs text-stone-400 mt-0.5">Healthy inventory</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Low Stock (&le; 5)</div>
          <div className="text-3xl font-bold font-serif text-amber-700 mt-2">{stats.lowStock}</div>
          <div className="text-xs text-stone-400 mt-0.5">Reorder recommended</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Categories</div>
          <div className="text-3xl font-bold font-serif text-stone-800 mt-2">{CATEGORIES.length}</div>
          <div className="text-xs text-stone-400 mt-0.5">Cosmetic categories</div>
        </div>
      </div>

      {/* 4. Search & Category Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search products by title, brand, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-stone-900 placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm font-semibold text-stone-700">Loading cosmetic catalog...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Package className="w-12 h-12 text-stone-300" />
            <p className="text-base font-bold text-stone-800">No cosmetic products found</p>
            <p className="text-xs text-stone-400">Click "Add Cosmetic Product" or "Seed Sample Formulas" to create items.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50/90 text-[11px] uppercase font-bold text-stone-500 border-b border-stone-200/80 tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Product & Brand</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((product) => {
                  const isLow = product.stock <= 5 && product.stock > 0;
                  const isOut = product.stock <= 0;

                  return (
                    <tr key={product._id} className="hover:bg-rose-50/20 transition-colors group">
                      {/* Product & Thumbnail */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail || (product.images && product.images[0]?.url)}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">{product.brand}</span>
                            <div className="font-bold text-sm text-stone-900">{product.name}</div>
                            <span className="text-[11px] text-stone-400">{product.volume}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm text-stone-900 font-serif">₹{product.price.toLocaleString()}</div>
                        {product.originalPrice > product.price && (
                          <div className="text-[11px] text-stone-400 line-through">₹{product.originalPrice.toLocaleString()}</div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isOut ? 'bg-red-100 text-red-800' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{product.rating || 4.8}</span>
                          <span className="text-stone-400 text-[11px]">({product.numReviews || 0})</span>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {product.isFeatured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Featured
                            </span>
                          )}
                          {product.isBestSeller && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              Best Seller
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* 6. Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  {editingProduct ? 'Edit Cosmetic Formulation' : 'Add New Cosmetic Product'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Fill in the clinical specs, retail pricing, and stock quantity.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 24K Gold Radiance Youth Serum"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Brand / Line</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Enrich Clinical Luxury"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              {/* Category, Subcategory & Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30 font-medium"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Face Serums"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Volume / Size</label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    placeholder="e.g. 50 ml / 1.7 fl oz"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              {/* Price, Original Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1899"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="2499"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30 font-bold"
                  />
                </div>
              </div>

              {/* Thumbnail Image URL */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Image URL (Unsplash or CDN)</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Product Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide clinical benefits and texture description..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30 resize-none"
                />
              </div>

              {/* Key Benefits (newline separated) */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Key Benefits (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.keyBenefits}
                  onChange={(e) => setFormData({ ...formData, keyBenefits: e.target.value })}
                  placeholder="Deep 72-hour hydration&#10;Boosts collagen and radiance&#10;Non-comedogenic finish"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30 resize-none font-mono"
                />
              </div>

              {/* Ingredients & How to Use */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Key Ingredients (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="24K Gold, Hyaluronic Acid, Niacinamide"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Best Seller, 20% OFF"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Featured in Showcase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Best Seller Tag</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
