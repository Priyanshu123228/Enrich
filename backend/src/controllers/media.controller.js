import { Media, mediaCategories } from '../models/Media.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get public gallery media with category & type filtering
 * @route   GET /api/v1/media
 * @access  Public
 */
export const getGalleryMedia = asyncHandler(async (req, res) => {
  const { type, category, featured, page = 1, limit = 50 } = req.query;

  const filter = { isActive: true };

  if (type && type !== 'all') {
    filter.type = type;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (featured === 'true') {
    filter.isFeatured = true;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [media, total] = await Promise.all([
    Media.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Media.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        media,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      'Gallery media fetched successfully'
    )
  );
});

/**
 * @desc    Get featured photos, videos & transformations for Homepage
 * @route   GET /api/v1/media/featured
 * @access  Public
 */
export const getFeaturedMedia = asyncHandler(async (req, res) => {
  let [featuredPhotos, featuredVideos, beforeAfters] = await Promise.all([
    Media.find({ isActive: true, type: 'photo', isFeatured: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(8)
      .lean(),
    Media.find({ isActive: true, type: 'video', isFeatured: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(4)
      .lean(),
    Media.find({ isActive: true, category: 'Before & After' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(4)
      .lean()
  ]);

  // Fallback to newest active photos/videos if none are explicitly flagged as isFeatured
  if (!featuredPhotos || featuredPhotos.length === 0) {
    featuredPhotos = await Media.find({ isActive: true, type: 'photo' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(8)
      .lean();
  }

  if (!featuredVideos || featuredVideos.length === 0) {
    featuredVideos = await Media.find({ isActive: true, type: 'video' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(4)
      .lean();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        photos: featuredPhotos,
        videos: featuredVideos,
        transformations: beforeAfters,
        beforeAfters
      },
      'Featured showcase media fetched successfully'
    )
  );
});

/**
 * @desc    Get media category list with item counts
 * @route   GET /api/v1/media/categories
 * @access  Public
 */
export const getMediaCategoriesList = asyncHandler(async (req, res) => {
  const counts = await Media.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, type: { $first: '$type' } } }
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id] = c.count;
  });

  const categoriesWithCounts = mediaCategories.map((cat) => ({
    name: cat,
    count: countMap[cat] || 0
  }));

  return res.status(200).json(
    new ApiResponse(200, categoriesWithCounts, 'Media categories fetched')
  );
});

/**
 * @desc    Get media item details by ID
 * @route   GET /api/v1/media/:id
 * @access  Public
 */
export const getMediaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Media.findById(id);
  if (!item) {
    throw new ApiError(404, 'Media item not found');
  }

  // Increment views count non-blockingly
  item.viewsCount += 1;
  await item.save();

  return res.status(200).json(
    new ApiResponse(200, item, 'Media item retrieved successfully')
  );
});

/**
 * @desc    Admin: Get all media with management filters
 * @route   GET /api/v1/media/admin/all
 * @access  Private / Admin
 */
export const adminGetAllMedia = asyncHandler(async (req, res) => {
  const { type, category, status, search, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (type && type !== 'all') filter.type = type;
  if (category && category !== 'all') filter.category = category;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [media, total] = await Promise.all([
    Media.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Media.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        media,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      'Admin media list fetched'
    )
  );
});

/**
 * @desc    Admin: Upload single file (image or video) directly
 * @route   POST /api/v1/media/upload
 * @access  Private / Admin
 */
export const uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select a file to upload');
  }

  const isVideo = req.file.mimetype.startsWith('video/');
  const resource_type = isVideo ? 'video' : 'image';

  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      resource_type,
      folder: 'luxeparlour/direct_uploads',
      originalname: req.file.originalname,
      mimetype: req.file.mimetype
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          url: uploadResult.secure_url || uploadResult.url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          resource_type: uploadResult.resource_type
        },
        'File uploaded successfully'
      )
    );
  } catch (err) {
    console.error('File upload error:', err);
    throw new ApiError(500, `Upload failed: ${err.message}`);
  }
});

/**
 * @desc    Admin: Upload / create new media item
 * @route   POST /api/v1/media
 * @access  Private / Admin
 */
export const createMedia = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type = 'photo',
    category,
    url: providedUrl,
    thumbnail: providedThumbnail,
    duration,
    displayOrder,
    isFeatured,
    isActive,
    beforeUrl,
    afterUrl,
    tags
  } = req.body;

  if (!title) throw new ApiError(400, 'Title is required for media');
  if (!category) throw new ApiError(400, 'Category is required');

  let mediaUrl = providedUrl;
  let publicId = '';
  let thumbnail = providedThumbnail;

  // 1. If file was uploaded via multipart, stream directly to Cloudinary
  if (req.file) {
    const resource_type = type === 'video' ? 'video' : 'image';
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        resource_type,
        folder: `luxeparlour/${type}s`
      });

      mediaUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;

      if (resource_type === 'video') {
        // Generate video poster thumbnail from Cloudinary
        thumbnail = uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg');
      } else {
        thumbnail = uploadResult.secure_url;
      }
    } catch (uploadErr) {
      console.error('Cloudinary Upload Failed:', uploadErr);
      throw new ApiError(500, `Cloudinary upload failed: ${uploadErr.message}`);
    }
  }

  if (!mediaUrl && !beforeUrl) {
    throw new ApiError(400, 'Either upload a media file or provide a valid media URL');
  }

  const media = await Media.create({
    title,
    description,
    type,
    category,
    url: mediaUrl || beforeUrl,
    publicId,
    thumbnail: thumbnail || mediaUrl || beforeUrl,
    duration: duration ? Number(duration) : 0,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isActive: isActive !== 'false' && isActive !== false,
    beforeAfter: {
      beforeUrl: beforeUrl || '',
      afterUrl: afterUrl || ''
    },
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : []
  });

  return res.status(201).json(
    new ApiResponse(201, media, 'Media asset created successfully')
  );
});

/**
 * @desc    Admin: Update media information
 * @route   PUT /api/v1/media/:id
 * @access  Private / Admin
 */
export const updateMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    type,
    category,
    url,
    thumbnail,
    duration,
    displayOrder,
    isFeatured,
    isActive,
    beforeUrl,
    afterUrl
  } = req.body;

  const media = await Media.findById(id);
  if (!media) {
    throw new ApiError(404, 'Media asset not found');
  }

  // If a new file was uploaded, replace on Cloudinary
  if (req.file) {
    const resource_type = (type || media.type) === 'video' ? 'video' : 'image';
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      resource_type,
      folder: `luxeparlour/${resource_type}s`
    });

    // Delete old asset if existing
    if (media.publicId) {
      await deleteFromCloudinary(media.publicId, resource_type);
    }

    media.url = uploadResult.secure_url;
    media.publicId = uploadResult.public_id;
    media.thumbnail =
      resource_type === 'video'
        ? uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg')
        : uploadResult.secure_url;
  } else if (url) {
    media.url = url;
  }

  if (title) media.title = title;
  if (description !== undefined) media.description = description;
  if (type) media.type = type;
  if (category) media.category = category;
  if (type === 'photo' || media.type === 'photo') {
    media.thumbnail = url || media.url;
  } else if (thumbnail) {
    media.thumbnail = thumbnail;
  }
  if (duration !== undefined) media.duration = Number(duration);
  if (displayOrder !== undefined) media.displayOrder = Number(displayOrder);
  if (isFeatured !== undefined) media.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (isActive !== undefined) media.isActive = isActive === 'true' || isActive === true;

  if (beforeUrl !== undefined || afterUrl !== undefined) {
    media.beforeAfter = {
      beforeUrl: beforeUrl !== undefined ? beforeUrl : media.beforeAfter?.beforeUrl,
      afterUrl: afterUrl !== undefined ? afterUrl : media.beforeAfter?.afterUrl
    };
  }

  await media.save();

  return res.status(200).json(
    new ApiResponse(200, media, 'Media asset updated successfully')
  );
});

/**
 * @desc    Admin: Toggle active/inactive status
 * @route   PUT /api/v1/media/:id/status
 * @access  Private / Admin
 */
export const toggleMediaStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await Media.findById(id);
  if (!media) {
    throw new ApiError(404, 'Media item not found');
  }

  media.isActive = !media.isActive;
  await media.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: media._id, isActive: media.isActive },
      `Media marked as ${media.isActive ? 'Active' : 'Inactive'}`
    )
  );
});

/**
 * @desc    Admin: Delete media asset
 * @route   DELETE /api/v1/media/:id
 * @access  Private / Admin
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await Media.findById(id);
  if (!media) {
    throw new ApiError(404, 'Media item not found');
  }

  // Cleanup Cloudinary asset if publicId exists
  if (media.publicId) {
    await deleteFromCloudinary(media.publicId, media.type === 'video' ? 'video' : 'image');
  }

  await Media.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, null, 'Media asset deleted successfully')
  );
});

/**
 * @desc    Admin: Seed default rich gallery items
 * @route   POST /api/v1/media/seed
 * @access  Private / Admin
 */
export const seedDefaultMedia = asyncHandler(async (req, res) => {
  const defaultItems = [
    // 1. Photos
    {
      title: 'Grand Velvet & Marble Styling Floor',
      description: 'Our luxurious flagship styling stations with Italian ergonomic leather chairs and natural sunlight.',
      type: 'photo',
      category: 'Salon Interior',
      url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Private VIP Bridal & Spa Suite',
      description: 'Secluded sanctuary for brides and wedding parties with champagne service and personal vanity mirrors.',
      type: 'photo',
      category: 'Salon Interior',
      url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Sunlit Glass Facade & Salon Entrance',
      description: 'Enrich Beauty Parlour & Cosmetic Clinic situated at First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001.',
      type: 'photo',
      category: 'Salon Exterior',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
      isFeatured: false,
      isActive: true
    },
    {
      title: 'Balayage & Golden Caramel Waves',
      description: 'Seamless dimensional honey-blonde balayage finished with soft Hollywood blowout waves.',
      type: 'photo',
      category: 'Hair',
      url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Royal Regal Bridal Glam',
      description: 'Full high-definition bridal glow, handcrafted smoky eye, and 24K gold foil setting.',
      type: 'photo',
      category: 'Bridal',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Sculpted Chrome & Crystal Gel Nail Art',
      description: 'Custom Japanese gel overlay with metallic chrome accents and Swarovski micro-crystals.',
      type: 'photo',
      category: 'Nails',
      url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      displayOrder: 6,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Hydra-Infusion Botanical Facial Glow',
      description: 'Deep pore oxygenation and hyaluronic acid ultrasonic infusion for radiant glass skin.',
      type: 'photo',
      category: 'Skin Care',
      url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      displayOrder: 7,
      isFeatured: true,
      isActive: true
    },
    // 2. Before & After Transformations
    {
      title: 'Brass to Icy Champagne Blonde Makeover',
      description: 'Full color correction from brassy orange tones to luminous cool champagne platinum.',
      type: 'photo',
      category: 'Before & After',
      url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      beforeAfter: {
        beforeUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'
      },
      displayOrder: 8,
      isFeatured: true,
      isActive: true
    },
    // 3. Videos
    {
      title: 'Enrich Beauty Parlour & Cosmetic Clinic Virtual Tour',
      description: 'Take a step inside our tranquil beauty oasis and experience the serene ambiance.',
      type: 'video',
      category: 'Salon Tour',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      duration: 60,
      displayOrder: 9,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Couture Bridal Hair & Veil Placement',
      description: 'Behind the scenes master styling for our royal bride featuring intricate crown braiding.',
      type: 'video',
      category: 'Hair Transformation',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      duration: 45,
      displayOrder: 10,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Artisan Chrome Ombre Nail Process',
      description: 'Watch master nail technician Elena craft mirror-finish French ombre nails in 4K.',
      type: 'video',
      category: 'Nail Art',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      duration: 35,
      displayOrder: 11,
      isFeatured: true,
      isActive: true
    },
    {
      title: 'Client Journey & Pampering Experience',
      description: 'From warm herbal welcome tea to full head massage and runway styling.',
      type: 'video',
      category: 'Customer Experience',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      duration: 50,
      displayOrder: 12,
      isFeatured: true,
      isActive: true
    }
  ];

  await Media.deleteMany({});
  const created = await Media.insertMany(defaultItems);

  return res.status(201).json(
    new ApiResponse(201, { count: created.length }, 'Default gallery media successfully seeded')
  );
});
