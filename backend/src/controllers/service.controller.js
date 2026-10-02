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
  const limitNumber = Math.max(1, parseInt(limit, 10));
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
