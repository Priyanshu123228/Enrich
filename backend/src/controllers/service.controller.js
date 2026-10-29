import { Service } from '../models/Service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get all active services with search, filtering, sorting, and pagination
 * @route   GET /api/v1/services
 * @access  Public
 */
export const getServices = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    gender,
    sortBy = 'newest',
    page = 1,
    limit = 20,
    includeInactive
  } = req.query;

  const filter = {};

  // Active filter (customers only see active services)
  if (includeInactive === 'true' && req.user && req.user.role === 'admin') {
    // Admin requested all services
  } else {
    filter.isActive = true;
  }

  // Category filter
  if (category && category !== 'All') {
    filter.category = category;
  }

  // Gender filter
  if (gender && gender !== 'all') {
    filter.gender = { $in: [gender, 'all'] };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Text search
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { features: searchRegex }
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sortBy === 'price-asc') sortOption = { price: 1 };
  if (sortBy === 'price-desc') sortOption = { price: -1 };
  if (sortBy === 'duration-asc') sortOption = { duration: 1 };
  if (sortBy === 'duration-desc') sortOption = { duration: -1 };
  if (sortBy === 'rating') sortOption = { ratingAverage: -1 };
  if (sortBy === 'name-asc') sortOption = { name: 1 };

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.max(1, Math.min(200, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const [services, total] = await Promise.all([
    Service.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Service.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      },
      'Services fetched successfully'
    )
  );
});

/**
 * @desc    Get single service by ID or Slug
 * @route   GET /api/v1/services/:id
 * @access  Public
 */
export const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let service;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    service = await Service.findById(id);
  } else {
    service = await Service.findOne({ slug: id });
  }

  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  return res.status(200).json(
    new ApiResponse(200, service, 'Service fetched successfully')
  );
});

/**
 * @desc    Create a new service
 * @route   POST /api/v1/services
 * @access  Private / Admin
 */
export const createService = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    duration,
    bufferTimeMinutes,
    gender,
    images,
    features,
    isActive
  } = req.body;

  const service = await Service.create({
    name,
    description,
    category,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : 0,
    duration: Number(duration),
    bufferTimeMinutes: bufferTimeMinutes ? Number(bufferTimeMinutes) : 10,
    gender: gender || 'all',
    images: images && images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', public_id: '' }],
    features: features || [],
    isActive: isActive !== undefined ? isActive : true
  });

  return res.status(201).json(
    new ApiResponse(201, service, 'Service created successfully')
  );
});

/**
 * @desc    Update existing service
 * @route   PUT /api/v1/services/:id
 * @access  Private / Admin
 */
export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  const {
    name,
    description,
    category,
    price,
    discountPrice,
    duration,
    bufferTimeMinutes,
    gender,
    images,
    features,
    isActive
  } = req.body;

  if (name !== undefined) service.name = name;
  if (description !== undefined) service.description = description;
  if (category !== undefined) service.category = category;
  if (price !== undefined) service.price = Number(price);
  if (discountPrice !== undefined) service.discountPrice = Number(discountPrice);
  if (duration !== undefined) service.duration = Number(duration);
  if (bufferTimeMinutes !== undefined) service.bufferTimeMinutes = Number(bufferTimeMinutes);
  if (gender !== undefined) service.gender = gender;
  if (images !== undefined) service.images = images;
  if (features !== undefined) service.features = features;
  if (isActive !== undefined) service.isActive = isActive;

  await service.save();

  return res.status(200).json(
    new ApiResponse(200, service, 'Service updated successfully')
  );
});

/**
 * @desc    Delete service
 * @route   DELETE /api/v1/services/:id
 * @access  Private / Admin
 */
export const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findByIdAndDelete(id);
  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Service deleted successfully')
  );
});

/**
 * @desc    Get service categories with active service count
 * @route   GET /api/v1/services/categories
 * @access  Public
 */
export const getServiceCategories = asyncHandler(async (req, res) => {
  const defaultCategories = ['Hair', 'Skin', 'Makeup', 'Nails', 'Spa', 'Bridal'];

  const categoryCounts = await Service.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const countMap = categoryCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const result = defaultCategories.map((name) => ({
    name,
    count: countMap[name] || 0
  }));

  return res.status(200).json(
    new ApiResponse(200, result, 'Categories fetched successfully')
  );
});

/**
 * @desc    Seed initial services catalog for quick startup
 * @route   POST /api/v1/services/seed
 * @access  Public / Admin
 */
export const seedDefaultServices = asyncHandler(async (req, res) => {
  const sampleServices = [
    {
      name: 'Precision Hair Cut & Styling',
      description: 'Consultation, scalp massage, luxury shampoo wash, custom precision cut, and blowout finish.',
      category: 'Hair',
      price: 45,
      discountPrice: 40,
      duration: 45,
      gender: 'all',
      images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['Personalized consultation', 'Moroccan Oil shampoo', 'Blowdry finish', 'Hot towel service'],
      ratingAverage: 4.9,
      ratingCount: 38
    },
    {
      name: 'Balayage & Hair Gloss Treatment',
      description: 'Hand-painted dimensional highlighting tailored to your skin tone, sealed with high-shine glossing.',
      category: 'Hair',
      price: 130,
      discountPrice: 115,
      duration: 120,
      gender: 'female',
      images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['Custom color mixing', 'Olaplex bond protector', 'Deep gloss finish', 'Blowout styling'],
      ratingAverage: 4.8,
      ratingCount: 24
    },
    {
      name: 'Hydra-Oxygen Facial Therapy',
      description: 'Deep pore vortex vacuum extraction infused with hyaluronic acid, peptides, and cold hammer therapy.',
      category: 'Skin',
      price: 90,
      discountPrice: 80,
      duration: 60,
      gender: 'all',
      images: [{ url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['Pore extraction', 'Hydra-dermabrasion', 'Oxygen serum infusion', 'LED light therapy'],
      ratingAverage: 4.9,
      ratingCount: 52
    },
    {
      name: '24K Gold Luxury Radiance Facial',
      description: 'An indulgent anti-aging ritual with pure gold leaf mask, collagen stimulation, and jade roller lymphatic drainage.',
      category: 'Skin',
      price: 120,
      discountPrice: 105,
      duration: 75,
      gender: 'all',
      images: [{ url: 'https://images.unsplash.com/photo-1512290900672-1f4007804473?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['24K pure gold mask', 'Collagen ampoule', 'Neck & shoulder massage', 'Instant glass glow'],
      ratingAverage: 5.0,
      ratingCount: 19
    },
    {
      name: 'Red Carpet Evening Glam Makeup',
      description: 'Full coverage radiant HD makeup tailored for galas, events, and photography with premium lashes included.',
      category: 'Makeup',
      price: 85,
      discountPrice: 75,
      duration: 60,
      gender: 'female',
      images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['HD foundation base', 'Smokey or Cut-crease eye look', 'Mink false lashes', '16-hour setting spray'],
      ratingAverage: 4.9,
      ratingCount: 41
    },
    {
      name: 'Royal Bridal Glow & Makeup Package',
      description: 'Comprehensive bridal transformation including HD airbrush makeup, jewelry setting, and bridal hairstyling.',
      category: 'Bridal',
      price: 280,
      discountPrice: 250,
      duration: 180,
      gender: 'female',
      images: [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['Airbrush HD bridal base', 'Pre-bridal skin prep', 'Saree / Veil draping', 'Jewelry setting assistance'],
      ratingAverage: 5.0,
      ratingCount: 64
    },
    {
      name: 'Gel Nail Extensions & Chrome Art',
      description: 'Sculpted gel extensions with custom cuticle care, shape refinement, and mirror chrome nail art.',
      category: 'Nails',
      price: 65,
      discountPrice: 55,
      duration: 60,
      gender: 'female',
      images: [{ url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['Cuticle treatment', 'Hard gel extension', 'Chrome / Ombre art', 'Moisturizing hand mask'],
      ratingAverage: 4.8,
      ratingCount: 33
    },
    {
      name: 'Swedish Aromatherapy Massage',
      description: 'Full body muscle relaxation utilizing warm botanical essential oils to soothe tension and elevate serenity.',
      category: 'Spa',
      price: 95,
      discountPrice: 85,
      duration: 60,
      gender: 'all',
      images: [{ url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      features: ['Custom essential oil blend', 'Full body tension release', 'Hot stone finish', 'Herbal tea retreat'],
      ratingAverage: 4.9,
      ratingCount: 29
    }
  ];

  // Insert or update sample services
  for (const item of sampleServices) {
    await Service.findOneAndUpdate(
      { name: item.name },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const allServices = await Service.find();
  return res.status(200).json(
    new ApiResponse(200, allServices, `Catalog seeded with ${allServices.length} services`)
  );
});


/**
 * @desc    Admin-only: Sync master service catalog to MongoDB (safe upsert)
 * @route   POST /api/v1/services/sync-catalog
 * @access  Admin only
 */
export const syncMasterCatalog = asyncHandler(async (req, res) => {
  const masterServices = [
    // BRIDAL
    { name: 'Bridal Makeup In Sikar', category: 'Bridal', duration: 150, price: 6999, discountPrice: 5999, description: 'Signature bridal makeover with luxury HD waterproof cosmetics, matching jewelry setting, dupatta draping, and customized lash extensions.', features: ['HD Waterproof Makeup', 'Dupatta & Jewelry Draping', 'Premium Eyelashes', 'Hair Styling Included'], gender: 'female', isActive: true },
    { name: 'Best Bridal Makeup Artist In Sikar', category: 'Bridal', duration: 180, price: 9999, discountPrice: 8499, description: 'Airbrush & HD royal bridal package by our master cosmetologist. Longest-wearing flawless glow for wedding photography.', features: ['Airbrush Makeup Finish', 'Pre-Bridal Skin Prep', 'Complete Bridal Accessories Setting'], gender: 'female', isActive: true },
    { name: 'Bridal Hairstyle In Sikar', category: 'Bridal', duration: 60, price: 1999, discountPrice: 1699, description: 'Traditional rose bun, contemporary textured braids, or Hollywood waves crafted with real hair florals and accessories.', features: ['Floral Setting', 'Hair Padding & Volume', 'Long-Lasting Hold Spray'], gender: 'female', isActive: true },
    { name: 'Wedding and event preparation', category: 'Bridal', duration: 120, price: 3499, discountPrice: 2999, description: 'Full pre-wedding grooming package: D-tan, radiant facial, full waxing, and nail care.', features: ['Pre-Event Glow', 'Full Body Prep', 'Complete Family Grooming'], gender: 'female', isActive: true },
    { name: 'Wedding Makeup Near Me In Sikar', category: 'Bridal', duration: 120, price: 5999, discountPrice: 4999, description: 'Bespoke destination & local wedding glam with custom contouring and bridal draping.', features: ['Custom Contouring', 'Hydration Primer Base', 'Dupatta Draping'], gender: 'female', isActive: true },
    { name: 'Bridal services', category: 'Bridal', duration: 150, price: 7499, discountPrice: 6499, description: 'Complete luxury bridal care package: engagement, mehndi, sangeet, and final wedding day makeover.', features: ['Multi-Day Event Package', 'Personalized Consultation', 'Bridal Suite Access'], gender: 'female', isActive: true },
    { name: 'Bridal Makeup near me', category: 'Bridal', duration: 150, price: 6499, discountPrice: 5499, description: 'Local bridal glam at Piprali Road, Sikar. Flawless coverage, waterproof eye makeup, and matching floral bun.', features: ['Studio Location Sikar', 'Waterproof Formula', 'Flower Styling'], gender: 'female', isActive: true },
    { name: 'Mobile salon service', category: 'Bridal', duration: 120, price: 2999, discountPrice: 2499, description: 'Doorstep bridal makeup, family hair styling, and event dressing at your home or wedding venue in Sikar.', features: ['At-Home Service', 'Full Professional Kit', 'Wedding Venue Visits'], gender: 'all', isActive: true },
    { name: 'Online beauty salon booking', category: 'Bridal', duration: 15, price: 99, discountPrice: 0, description: 'Instant VIP priority reservation with zero advance deposit, WhatsApp confirmation, and zero waiting time.', features: ['Zero Advance Deposit', 'Instant WhatsApp Confirmation', 'Priority VIP Slot'], gender: 'all', isActive: true },
    // MAKEUP
    { name: 'Party Makeup Near me in Sikar', category: 'Makeup', duration: 60, price: 1499, discountPrice: 1299, description: 'HD glowing party makeup for weddings, sangeet, reception, or anniversary functions with smudge-proof eye makeup.', features: ['HD Foundation', 'Smokey or Shimmer Eyes', 'Hairstyling Included'], gender: 'female', isActive: true },
    { name: 'Party Makeup Near me', category: 'Makeup', duration: 60, price: 1399, discountPrice: 1199, description: 'Express glam look for evening parties, birthdays, and festive gatherings with premium lightweight cosmetics.', features: ['Lightweight Finish', 'Lash Application', 'Setting Spray'], gender: 'female', isActive: true },
    { name: 'Make-up', category: 'Makeup', duration: 60, price: 1299, discountPrice: 999, description: 'Everyday elegance or soft glam look crafted using dermatologically tested, non-comedogenic luxury cosmetics.', features: ['Non-Comedogenic Products', 'Soft Natural Radiance', 'Custom Lip Shade'], gender: 'female', isActive: true },
    { name: 'Eyebrow beautification', category: 'Makeup', duration: 20, price: 99, discountPrice: 79, description: 'Hygienic threading, brow shaping, mapping, and tinted brow definition for crisp, elegant arches.', features: ['Precise Shaping', 'Painless Threading', 'Brow Calming Gel'], gender: 'female', isActive: true },
    { name: 'Eyelashes', category: 'Makeup', duration: 45, price: 999, discountPrice: 799, description: 'Individual cluster lashes or classic volume lash extensions for naturally dense, long, and dramatic eyes.', features: ['Weightless Feel', 'Waterproof Adhesive', 'Up to 3 Weeks Hold'], gender: 'female', isActive: true },
    { name: 'Permanent makeup', category: 'Makeup', duration: 90, price: 3999, discountPrice: 3499, description: 'Semi-permanent microblading, ombre powder brows, and natural lip blush pigments for effortless daily beauty.', features: ['Certified Pigments', 'Smudge-Proof', 'Lasts 1-2 Years'], gender: 'female', isActive: true },
    // HAIR
    { name: 'Keratin Treatment In Sikar', category: 'Hair', duration: 150, price: 2999, discountPrice: 2499, description: 'Formaldehyde-free intensive keratin smoothing therapy. Eliminates 95% frizz and leaves hair mirror-shiny.', features: ['Frizz-Free Silk Finish', 'Lasts 3-5 Months', 'Deep Protein Infusion'], gender: 'all', isActive: true },
    { name: 'Hair Color In Sikar', category: 'Hair', duration: 120, price: 2499, discountPrice: 1999, description: 'Ammonia-free global hair color, balayage, honey blonde streaks, or gray root coverage.', features: ['Ammonia-Free', 'Bond Protection Shield', 'Vibrant Shine'], gender: 'all', isActive: true },
    { name: 'Haircut', category: 'Hair', duration: 45, price: 399, discountPrice: 299, description: 'Precision layered cut, feather cut, blunt bob, or split-ends trim with bouncy blowdry finish.', features: ['Personalized Consultation', 'Scalp Wash', 'Thermal Blowdry Finish'], gender: 'all', isActive: true },
    { name: 'Hairstyling', category: 'Hair', duration: 45, price: 799, discountPrice: 599, description: 'Tong curls, beach waves, straight iron finish, or festive half-up hairstyles with heat protection.', features: ['Heat Shield Protection', 'Bouncy Curls or Waves', 'Volume Root Boost'], gender: 'female', isActive: true },
    { name: 'Hair extensions', category: 'Hair', duration: 90, price: 4999, discountPrice: 3999, description: '100% human remy hair extensions: clip-on, micro-ring, or tape-in for instant length and volume.', features: ['100% Remy Human Hair', 'Heat-Stylable', 'Seamless Color Blend'], gender: 'female', isActive: true },
    { name: 'Shampoo & conditioning', category: 'Hair', duration: 30, price: 299, discountPrice: 199, description: 'Therapeutic scalp wash with sulfate-free salon shampoo, deep conditioning hair mask, and blast dry.', features: ['Relaxing Scalp Wash', 'Hydrating Hair Mask', 'Fresh Blowdry'], gender: 'all', isActive: true },
    // SKIN
    { name: 'Skin Brightening Treatment In Sikar', category: 'Skin', duration: 60, price: 1499, discountPrice: 1199, description: 'D-tan exfoliation, vitamin C serum infusion, ultrasonic brightening peel, and whitening mask.', features: ['Instant Tan Removal', 'Vitamin C Infusion', 'Long-Lasting Radiance'], gender: 'all', isActive: true },
    { name: 'Skin Brightening Treatment near me In Sikar', category: 'Skin', duration: 60, price: 1499, discountPrice: 1199, description: 'Express anti-pigmentation and skin de-tan therapy for Rajasthan sun exposure and dry desert climate.', features: ['Sun Damage Repair', 'Anti-Pigmentation Formula', 'Hydrating Peel-off Mask'], gender: 'all', isActive: true },
    { name: 'Anti Ageing Facial Sikar', category: 'Skin', duration: 75, price: 1899, discountPrice: 1599, description: 'Collagen-boosting microcurrent lift, hyaluronic peptide infusion, and firming mask targeting fine lines.', features: ['Collagen Lift Mask', 'Skin Tightening', 'Wrinkle Softening'], gender: 'all', isActive: true },
    { name: 'Facials', category: 'Skin', duration: 60, price: 999, discountPrice: 799, description: 'Gold, Diamond, O3+, or Fruit facials with herbal steam, deep pore blackhead removal, and glow mask.', features: ['Customized Skin Choice', 'Herbal Face Massage', 'Blackhead Removal'], gender: 'all', isActive: true },
    { name: 'Skin care', category: 'Skin', duration: 60, price: 1299, discountPrice: 999, description: 'Comprehensive dermatological skin checkup, dead cell exfoliation, acne reduction, and deep hydration.', features: ['Acne & Pimple Control', 'Hydrating Hyaluronic Mist', 'Soothing Gel Finish'], gender: 'all', isActive: true },
    // WAXING
    { name: 'Body waxing', category: 'Waxing', duration: 60, price: 1199, discountPrice: 999, description: 'Full arms, legs, underarms, and stomach waxing using premium painless Rica Italian wax.', features: ['Gentle Rica Wax', 'Tan-Free Smooth Skin', 'Post-Wax Soothing Lotion'], gender: 'female', isActive: true },
    { name: 'Waxing', category: 'Waxing', duration: 30, price: 499, discountPrice: 399, description: 'Arms or half legs waxing with hygienic single-use strips and temperature-controlled soothing wax.', features: ['Painless Technique', 'Single-Use Strips', 'Aloe Vera Aftercare'], gender: 'female', isActive: true },
    { name: 'Shaving', category: 'Waxing', duration: 20, price: 199, discountPrice: 149, description: 'Hygienic single-use dermaplaning facial razor for smooth peach-fuzz free foundation base.', features: ['Sterilized Single-Use Blade', 'Soothing Aloe Vera', 'Flawless Base Prep'], gender: 'all', isActive: true },
    // NAILS
    { name: 'Manicure', category: 'Nails', duration: 40, price: 499, discountPrice: 399, description: 'Hand soak, nail trimming, cuticle treatment, exfoliating walnut scrub, hand massage, and polish.', features: ['Deep Cuticle Care', 'Aromatherapy Hand Massage', 'Glossy Polish'], gender: 'all', isActive: true },
    { name: 'Pedicure', category: 'Nails', duration: 50, price: 699, discountPrice: 599, description: 'Warm foot spa with dead skin heel filing, callus softening scrub, cooling peppermint pack, and foot massage.', features: ['Heel Crack Softening', 'Dead Skin Filing', 'Foot Massage'], gender: 'all', isActive: true },
    // SPA
    { name: 'Massage', category: 'Spa', duration: 60, price: 1499, discountPrice: 1299, description: 'Full body Swedish oil massage, head champi, and hot towel wipe for total muscle relief.', features: ['Ayurvedic & Essential Oils', 'Head & Back Relief', 'Private Cozy Cabin'], gender: 'female', isActive: true },
    { name: 'Spa services', category: 'Spa', duration: 90, price: 1999, discountPrice: 1699, description: 'Holistic luxury body polish, warm herbal steam bath, deep tissue relaxation, and detoxifying oil wrap.', features: ['Full Body Polish', 'Herbal Steam Bath', 'Stress Relief Aromatherapy'], gender: 'female', isActive: true },
  ];

  let inserted = 0;
  let updated = 0;

  for (const s of masterServices) {
    const slug = s.name.toLowerCase().trim().replace(/[\s_-]+/g, '-').replace(/[^\w-]+/g, '');
    const result = await Service.findOneAndUpdate(
      { name: s.name },
      {
        $set: { ...s, slug, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), ratingAverage: 4.9, ratingCount: 28, bufferTimeMinutes: 10 }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (result && result.isNew) {
      inserted++;
    } else {
      updated++;
    }
  }

  const total = await Service.countDocuments();
  return res.status(200).json(
    new ApiResponse(200, { total, inserted, updated }, `Catalog sync complete. Total: ${total} services in database.`)
  );
});
