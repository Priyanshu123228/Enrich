import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Sample Seed Products for Enrich Cosmetic Clinic
const SAMPLE_PRODUCTS = [
  {
    name: '24K Gold Radiance Youth Serum',
    brand: 'Enrich Clinical Luxury',
    category: 'Serums & Treatments',
    subcategory: 'Face Serums',
    price: 1899,
    originalPrice: 2499,
    rating: 4.9,
    numReviews: 48,
    stock: 25,
    volume: '30 ml / 1.0 fl oz',
    skinType: ['All Skin Types', 'Anti-Aging', 'Dull Skin'],
    isFeatured: true,
    isBestSeller: true,
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
    name: 'Pure Damask Rose Hydrating Face Mist',
    brand: 'Enrich Botanicals',
    category: 'Skincare',
    subcategory: 'Toners & Mists',
    price: 699,
    originalPrice: 899,
    rating: 4.8,
    numReviews: 34,
    stock: 40,
    volume: '100 ml / 3.4 fl oz',
    skinType: ['All Skin Types', 'Sensitive', 'Dry'],
    isFeatured: true,
    isBestSeller: true,
    badge: 'Popular',
    thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80', alt: 'Rose Mist Bottle' }
    ],
    description: 'Steam-distilled from freshly harvested organic Damask roses. Instantly hydrates, refines pores, balances pH levels, and revitalizes tired skin with a soothing aromatic sensation.',
    keyBenefits: [
      '100% pure organic Damask rose hydrosol',
      'Instantly refreshes makeup and hydrates skin throughout the day',
      'Calms redness, inflammation, and sensitivity',
      'Alcohol-free, chemical-free, and dermatologically tested'
    ],
    ingredients: ['Steam Distilled Rose Flower Water', 'Aloe Barbadensis Leaf Juice', 'Vegetable Glycerin', 'Witch Hazel Extract'],
    howToUse: 'Hold bottle 8-10 inches away and mist generously over face and neck. Use after cleansing, before serums, or over makeup to lock in moisture.'
  },
  {
    name: 'Moroccan Argan & Keratin Hair Elixir',
    brand: 'Enrich Salon Professional',
    category: 'Haircare',
    subcategory: 'Hair Oils & Serums',
    price: 1299,
    originalPrice: 1699,
    rating: 4.9,
    numReviews: 52,
    stock: 18,
    volume: '100 ml / 3.4 fl oz',
    skinType: ['All Hair Types', 'Frizzy Hair', 'Chemically Treated'],
    isFeatured: true,
    isBestSeller: true,
    badge: 'Salon Favorite',
    thumbnail: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80', alt: 'Argan Hair Oil' }
    ],
    description: 'A weightless luxury hair oil blend of cold-pressed Moroccan Argan Oil and hydrolyzed keratin. Tames frizz, seals split ends, and provides thermal heat protection up to 230°C.',
    keyBenefits: [
      'Delivers mirror-like gloss without greasiness',
      'Deeply nourishes damaged hair fibers and locks',
      'Provides thermal defense against blow-drying and straightening',
      'Long-lasting salon fragrance'
    ],
    ingredients: ['Cold Pressed Moroccan Argan Oil', 'Hydrolyzed Keratin', 'Sweet Almond Oil', 'Jojoba Seed Extract', 'Vitamin E'],
    howToUse: 'Rub 2-3 pumps between palms and distribute evenly through towel-dried or dry hair from mid-lengths to ends.'
  },
  {
    name: 'Bridal Velvet Matte Lip Pigment - Royal Crimson',
    brand: 'Enrich Cosmetic Studio',
    category: 'Makeup & Cosmetics',
    subcategory: 'Lipsticks',
    price: 899,
    originalPrice: 1199,
    rating: 4.9,
    numReviews: 61,
    stock: 30,
    volume: '4.5 g',
    skinType: ['All Skin Tones'],
    isFeatured: true,
    isBestSeller: true,
    badge: 'Bridal Edition',
    thumbnail: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80', alt: 'Velvet Lip Pigment' }
    ],
    description: 'An iconic high-intensity, smudge-proof velvet liquid lipstick designed for bridal longevity. Delivers rich pigmentation with 16-hour transfer-resistant wear enriched with shea butter.',
    keyBenefits: [
      'Intense, rich one-stroke pigmentation',
      'Non-drying, weightless velvet cushion comfort',
      '16-hour smudge-proof and waterproof wear',
      'Enriched with Vitamin E & organic Shea Butter'
    ],
    ingredients: ['Shea Butter', 'Vitamin E Oil', 'Candelilla Wax', 'Mineral Pigments', 'Jojoba Esters'],
    howToUse: 'Define lips with the precision wand tip, then fill in with the flat applicator edge. Allow 60 seconds to set for transfer-proof finish.'
  },
  {
    name: 'Advanced Vitamin C Glow & Spot Corrector Cream',
    brand: 'Enrich Clinical Luxury',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 1199,
    originalPrice: 1499,
    rating: 4.7,
    numReviews: 29,
    stock: 22,
    volume: '50 g / 1.7 oz',
    skinType: ['All Skin Types', 'Pigmentation', 'Uneven Tone'],
    isFeatured: true,
    isBestSeller: false,
    badge: '15% Active C',
    thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80', alt: 'Vitamin C Cream' }
    ],
    description: 'Formulated with 15% stabilized Vitamin C, Kakadu plum extract, and alpha arbutin. Fades hyperpigmentation, dark spots, and sun damage while delivering all-day barrier moisture.',
    keyBenefits: [
      'Visibly reduces dark spots and sun pigmentation in 14 days',
      'Defends against environmental oxidants and urban pollution',
      'Silky smooth whipped texture that absorbs instantly',
      'Dermatologist tested and paraben free'
    ],
    ingredients: ['Ethyl Ascorbic Acid (15%)', 'Kakadu Plum Extract', 'Alpha Arbutin (2%)', 'Centella Asiatica', 'Ceramides Complex'],
    howToUse: 'Apply a dime-sized amount to cleansed face and neck in the morning and evening. Follow with SPF during daytime.'
  },
  {
    name: 'Ayurvedic Kumkumadi Miraculous Night Oil',
    brand: 'Enrich Botanicals',
    category: 'Organic & Ayurvedic',
    subcategory: 'Facial Oils',
    price: 1599,
    originalPrice: 2099,
    rating: 5.0,
    numReviews: 43,
    stock: 15,
    volume: '25 ml / 0.85 fl oz',
    skinType: ['All Skin Types', 'Dry', 'Mature Skin'],
    isFeatured: true,
    isBestSeller: true,
    badge: 'Pure Saffron',
    thumbnail: 'https://images.unsplash.com/photo-1608248597359-460d3d5267a1?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1608248597359-460d3d5267a1?w=800&auto=format&fit=crop&q=80', alt: 'Kumkumadi Oil' }
    ],
    description: 'An authentic classical formulation crafted with precious Kashmiri Saffron (Kumkuma), sandalwood, and 26 rare Himalayan herbs in pure goat milk and sesame oil base.',
    keyBenefits: [
      '100% authentic Ayurvedic classical tailam recipe',
      'Transforms dull complexion into luminous golden glow',
      'Diminishes fine lines and dark circles naturally',
      'Free from artificial fragrances, mineral oils, and chemicals'
    ],
    ingredients: ['Kashmiri Saffron (Crocus Sativus)', 'Red Sandalwood', 'Lotus Stamen', 'Licorice Extract', 'Cold Pressed Sesame Oil'],
    howToUse: 'After cleansing at night, massage 3-4 drops gently over face with fingertips using upward circular strokes. Leave on overnight.'
  },
  {
    name: 'Sulfate-Free Caviar Volume & Repair Shampoo',
    brand: 'Enrich Salon Professional',
    category: 'Haircare',
    subcategory: 'Shampoos',
    price: 950,
    originalPrice: 1250,
    rating: 4.8,
    numReviews: 24,
    stock: 35,
    volume: '250 ml / 8.5 fl oz',
    skinType: ['Fine Hair', 'Color Treated', 'Oily Scalp'],
    isFeatured: false,
    isBestSeller: false,
    badge: 'Sulfate Free',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80', alt: 'Caviar Shampoo' }
    ],
    description: 'Infused with French caviar extract, marine botanicals, and rice protein. Gently removes scalp buildup while adding lightweight body, thickness, and salon bounce.',
    keyBenefits: [
      'Color-safe, 100% sulfate and paraben free formula',
      'Infuses hair with root-lifting volume and bounce',
      'Fortifies fragile strands with marine omega-3 lipids',
      'Safe for keratin and smoothing-treated hair'
    ],
    ingredients: ['Caviar Extract', 'Hydrolyzed Rice Protein', 'Biotin', 'Peppermint Essential Oil', 'Pro-Vitamin B5'],
    howToUse: 'Massage into wet scalp and hair until rich lather forms. Rinse thoroughly with lukewarm water. Follow with Enrich Silk Conditioner.'
  },
  {
    name: 'Ultra-Hydrating Sea Kelp Body Butter & Spa Polish',
    brand: 'Enrich Body & Spa',
    category: 'Body & Spa',
    subcategory: 'Body Creams',
    price: 850,
    originalPrice: 1100,
    rating: 4.8,
    numReviews: 19,
    stock: 20,
    volume: '200 g / 7.0 oz',
    skinType: ['Dry Skin', 'All Body Skin'],
    isFeatured: false,
    isBestSeller: false,
    badge: 'Deep Hydration',
    thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80', alt: 'Body Butter' }
    ],
    description: 'A whipped, deeply nourishing body cream blending oceanic sea kelp, unrefined African shea butter, and cocoa lipids for 48 hours of supple, smooth skin.',
    keyBenefits: [
      'Melts into skin without sticky or heavy residue',
      'Restores dry elbows, knees, and cracked heels',
      'Delicate Mediterranean spa aroma',
      'Rich in essential fatty acids and antioxidants'
    ],
    ingredients: ['Raw Shea Butter', 'Sea Kelp Bioferment', 'Cocoa Seed Butter', 'Coconut Oil', 'Vitamin E'],
    howToUse: 'Smooth generously over entire body immediately following a warm shower to lock in moisture.'
  }
];

/**
 * @desc    Get all products with filters, sorting, and pagination
 * @route   GET /api/v1/products | GET /api/v1/cosmetics
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  // Auto-seed if database is empty
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(SAMPLE_PRODUCTS);
  }

  const {
    category,
    brand,
    skinType,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    inStock,
    sort = 'popular',
    page = 1,
    limit = 24
  } = req.query;

  const query = {};

  // Category Filter
  if (category && category !== 'all' && category !== 'All') {
    query.category = category;
  }

  // Brand Filter
  if (brand && brand !== 'all') {
    query.brand = brand;
  }

  // Skin Type Filter
  if (skinType && skinType !== 'all') {
    query.skinType = { $in: [skinType] };
  }

  // Price Range Filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // In-stock Filter
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
    query.isAvailable = true;
  }

  // Featured Filter
  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  // Search
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { brand: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { subcategory: { $regex: s, $options: 'i' } },
      { ingredients: { $in: [new RegExp(s, 'i')] } },
      { keyBenefits: { $in: [new RegExp(s, 'i')] } }
    ];
  }

  // Sorting
  let sortOptions = { createdAt: -1 };
  if (sort === 'popular' || sort === 'best_sellers') {
    sortOptions = { isBestSeller: -1, rating: -1, numReviews: -1 };
  } else if (sort === 'price_asc') {
    sortOptions = { price: 1 };
  } else if (sort === 'price_desc') {
    sortOptions = { price: -1 };
  } else if (sort === 'rating') {
    sortOptions = { rating: -1 };
  } else if (sort === 'newest') {
    sortOptions = { createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total, categories, brands] = await Promise.all([
    Product.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
    Product.distinct('category'),
    Product.distinct('brand')
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1
        },
        meta: {
          categories,
          brands
        }
      },
      'Cosmetic products retrieved successfully'
    )
  );
});

/**
 * @desc    Get single product by ID or Slug
 * @route   GET /api/v1/products/:idOrSlug
 * @access  Public
 */
export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let product;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(idOrSlug);
  } else {
    product = await Product.findOne({ slug: idOrSlug });
  }

  if (!product) {
    throw new ApiError(404, 'Cosmetic product not found');
  }

  // Fetch related products in the same category
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category
  })
    .limit(4)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
        relatedProducts
      },
      'Product details retrieved'
    )
  );
});

/**
 * @desc    Get featured products
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isAvailable: true })
    .sort({ rating: -1, isBestSeller: -1 })
    .limit(8)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, products, 'Featured cosmetics retrieved')
  );
});

/**
 * @desc    Create a new product (Admin)
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    category,
    subcategory,
    price,
    originalPrice,
    stock,
    volume,
    skinType,
    thumbnail,
    images,
    description,
    keyBenefits,
    ingredients,
    howToUse,
    isFeatured,
    isBestSeller,
    badge
  } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Please provide a product title');
  }

  if (!price || Number(price) <= 0) {
    throw new ApiError(400, 'Please provide a valid product price');
  }

  if (!description || !description.trim()) {
    throw new ApiError(400, 'Please provide product description');
  }

  const product = await Product.create({
    name: name.trim(),
    brand: brand ? brand.trim() : 'Enrich Luxury Clinic',
    category: category || 'Skincare',
    subcategory: subcategory ? subcategory.trim() : 'General',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price),
    stock: stock !== undefined ? Number(stock) : 25,
    volume: volume ? volume.trim() : '50 ml',
    skinType: Array.isArray(skinType) ? skinType : (skinType ? [skinType] : ['All Skin Types']),
    thumbnail: thumbnail || (Array.isArray(images) && images[0]?.url) || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    images: Array.isArray(images) && images.length > 0 ? images : [{ url: thumbnail || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80' }],
    description: description.trim(),
    keyBenefits: Array.isArray(keyBenefits) ? keyBenefits : (keyBenefits ? [keyBenefits] : []),
    ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? [ingredients] : []),
    howToUse: howToUse ? howToUse.trim() : 'Apply evenly to clean skin.',
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
    isBestSeller: Boolean(isBestSeller),
    badge: badge ? badge.trim() : ''
  });

  return res.status(201).json(
    new ApiResponse(201, product, 'Cosmetic product created successfully')
  );
});

/**
 * @desc    Update a product (Admin)
 * @route   PATCH /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return res.status(200).json(
    new ApiResponse(200, product, 'Product updated successfully')
  );
});

/**
 * @desc    Delete a product (Admin)
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Product deleted successfully')
  );
});

/**
 * @desc    Reset and Seed sample cosmetics products (Admin)
 * @route   POST /api/v1/products/seed
 * @access  Private/Admin
 */
export const seedProducts = asyncHandler(async (req, res) => {
  await Product.deleteMany({});
  const seeded = await Product.insertMany(SAMPLE_PRODUCTS);

  return res.status(200).json(
    new ApiResponse(200, seeded, `Successfully seeded ${seeded.length} luxury cosmetic products!`)
  );
});
