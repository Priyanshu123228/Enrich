import { SocialLink, SUPPORTED_PLATFORMS, PLATFORM_META } from '../models/SocialLink.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Starter social links seed for Enrich Beauty Parlour & Cosmetic Clinic
 */

const DEFAULT_STARTER_LINKS = [
  {
    platform: 'instagram',
    displayName: 'Instagram',
    url: 'https://www.instagram.com/enrich_beauty25/',
    handle: '@enrich_beauty25',
    description: 'Daily hair transformations, bridal reels, and skincare tips.',
    isActive: true,
    order: 1
  },
  {
    platform: 'whatsapp',
    displayName: 'WhatsApp',
    url: 'https://wa.me/919667900313',
    handle: '+91 96679 00313',
    description: 'Instant customer assistance, appointment inquiries, and bridal bookings.',
    isActive: true,
    order: 2
  },
  {
    platform: 'facebook',
    displayName: 'Facebook',
    url: 'https://www.facebook.com/enrichparloursikar',
    handle: '@enrichparloursikar',
    description: 'Community updates, beauty workshops, and customer reviews.',
    isActive: true,
    order: 3
  },
  {
    platform: 'youtube',
    displayName: 'YouTube',
    url: 'https://youtube.com/@enrichbeautyparlour',
    handle: '@enrichbeautyparlour',
    description: 'Full treatment walk-throughs, makeover vlogs, and beauty tutorials.',
    isActive: true,
    order: 4
  },
  {
    platform: 'google',
    displayName: 'Google Business Profile',
    url: 'https://maps.google.com/?q=Enrich+Beauty+Parlour+and+Cosmetic+Clinic+Sikar',
    handle: 'Enrich Beauty Parlour Sikar',
    description: 'Verified salon reviews, clinic location directions, and opening hours.',
    isActive: true,
    order: 5
  },
  {
    platform: 'threads',
    displayName: 'Threads',
    url: 'https://threads.net/@enrich_beauty_parlour_sikar',
    handle: '@enrich_beauty_parlour_sikar',
    description: 'Behind-the-scenes conversations, announcements, and salon thoughts.',
    isActive: true,
    order: 6
  }
];

async function seedStarterSocialLinks() {
  const count = await SocialLink.countDocuments();
  if (count === 0) {
    try {
      await SocialLink.insertMany(DEFAULT_STARTER_LINKS);
      console.log('✅ Default starter social media links seeded successfully');
    } catch (e) {
      console.warn('Notice: Starter social links seed skipped:', e.message);
    }
  }
}

function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string') return false;
  const trimmed = string.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_) {
    return false;
  }
}

/**
 * Public: Get active social media links configured by admin
 * GET /api/v1/social-links
 */
export const getActiveSocialLinks = asyncHandler(async (req, res) => {
  let links = await SocialLink.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  if (links.length === 0) {
    const totalCount = await SocialLink.countDocuments();
    if (totalCount === 0) {
      await seedStarterSocialLinks();
      links = await SocialLink.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, links, 'Active social media links fetched successfully')
  );
});

/**
 * Admin: Get all social media links (both active and inactive)
 * GET /api/v1/social-links/admin
 */
export const getAllSocialLinks = asyncHandler(async (req, res) => {
  let links = await SocialLink.find()
    .sort({ order: 1, createdAt: 1 })
    .lean();

  if (links.length === 0) {
    await seedStarterSocialLinks();
    links = await SocialLink.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
  }

  return res.status(200).json(
    new ApiResponse(200, links, 'All social media links fetched successfully')
  );
});

/**
 * Admin: Add new social platform configuration
 * POST /api/v1/social-links
 */
export const createSocialLink = asyncHandler(async (req, res) => {
  const { platform, displayName, url, handle, description, isActive, order } = req.body;

  if (!platform || typeof platform !== 'string') {
    throw new ApiError(400, 'Platform identifier is required');
  }

  const normalizedPlatform = platform.trim().toLowerCase();

  if (!SUPPORTED_PLATFORMS.includes(normalizedPlatform)) {
    throw new ApiError(400, 'Invalid platform ' + platform + '. Supported platforms: ' + SUPPORTED_PLATFORMS.join(', '));
  }

  if (!url || typeof url !== 'string') {
    throw new ApiError(400, 'Profile URL is required');
  }

  const trimmedUrl = url.trim();
  if (!isValidHttpUrl(trimmedUrl)) {
    throw new ApiError(400, 'Please enter a valid HTTP or HTTPS profile URL');
  }

  // Prevent duplicate platform entries
  const existing = await SocialLink.findOne({ platform: normalizedPlatform });
  if (existing) {
    const pName = PLATFORM_META[normalizedPlatform]?.displayName || normalizedPlatform;
    throw new ApiError(409, 'Platform ' + pName + ' is already configured. Please edit the existing entry.');
  }

  let calculatedOrder = Number(order);
  if (isNaN(calculatedOrder)) {
    const highest = await SocialLink.findOne().sort({ order: -1 }).select('order').lean();
    calculatedOrder = (highest?.order || 0) + 1;
  }

  const defaultMeta = PLATFORM_META[normalizedPlatform] || {};

  const newLink = await SocialLink.create({
    platform: normalizedPlatform,
    displayName: (displayName && displayName.trim()) || defaultMeta.displayName || normalizedPlatform,
    url: trimmedUrl,
    handle: (handle && handle.trim()) || '',
    description: (description && description.trim()) || defaultMeta.defaultDescription || '',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    order: calculatedOrder
  });

  return res.status(201).json(
    new ApiResponse(201, newLink, 'Social platform configured successfully')
  );
});

/**
 * Admin: Update existing social platform configuration
 * PUT /api/v1/social-links/:id
 */
export const updateSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { displayName, url, handle, description, isActive, order, platform } = req.body;

  const socialLink = await SocialLink.findById(id);
  if (!socialLink) {
    throw new ApiError(404, 'Social platform configuration not found');
  }

  if (platform) {
    const normalizedPlatform = platform.trim().toLowerCase();
    if (!SUPPORTED_PLATFORMS.includes(normalizedPlatform)) {
      throw new ApiError(400, 'Invalid platform ' + platform + '. Supported platforms: ' + SUPPORTED_PLATFORMS.join(', '));
    }

    if (normalizedPlatform !== socialLink.platform) {
      const existing = await SocialLink.findOne({
        platform: normalizedPlatform,
        _id: { $ne: id }
      });
      if (existing) {
        const pName = PLATFORM_META[normalizedPlatform]?.displayName || normalizedPlatform;
        throw new ApiError(409, 'Platform ' + pName + ' is already configured.');
      }
      socialLink.platform = normalizedPlatform;
    }
  }

  if (url !== undefined) {
    const trimmedUrl = String(url).trim();
    if (!isValidHttpUrl(trimmedUrl)) {
      throw new ApiError(400, 'Please enter a valid HTTP or HTTPS profile URL');
    }
    socialLink.url = trimmedUrl;
  }

  if (displayName !== undefined) {
    socialLink.displayName = String(displayName).trim();
  }

  if (handle !== undefined) {
    socialLink.handle = String(handle).trim();
  }

  if (description !== undefined) {
    socialLink.description = String(description).trim();
  }

  if (isActive !== undefined) {
    socialLink.isActive = Boolean(isActive);
  }

  if (order !== undefined && !isNaN(Number(order))) {
    socialLink.order = Number(order);
  }

  await socialLink.save();

  return res.status(200).json(
    new ApiResponse(200, socialLink, 'Social platform updated successfully')
  );
});

/**
 * Admin: Quick toggle platform active/inactive status
 * PATCH /api/v1/social-links/:id/toggle
 */
export const toggleSocialLinkStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const socialLink = await SocialLink.findById(id);
  if (!socialLink) {
    throw new ApiError(404, 'Social platform configuration not found');
  }

  socialLink.isActive = !socialLink.isActive;
  await socialLink.save();

  const statusText = socialLink.isActive ? 'active' : 'disabled';
  return res.status(200).json(
    new ApiResponse(200, socialLink, socialLink.displayName + ' is now ' + statusText)
  );
});

/**
 * Admin: Batch reorder platforms
 * PATCH /api/v1/social-links/reorder
 */
export const reorderSocialLinks = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'An array of items with { id, order } is required');
  }

  const bulkOps = items.map(item => ({
    updateOne: {
      filter: { _id: item.id || item._id },
      update: { $set: { order: Number(item.order) || 0 } }
    }
  }));

  await SocialLink.bulkWrite(bulkOps);

  const updatedLinks = await SocialLink.find().sort({ order: 1, createdAt: 1 }).lean();

  return res.status(200).json(
    new ApiResponse(200, updatedLinks, 'Social platforms reordered successfully')
  );
});

/**
 * Admin: Delete social platform configuration
 * DELETE /api/v1/social-links/:id
 */
export const deleteSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const socialLink = await SocialLink.findByIdAndDelete(id);
  if (!socialLink) {
    throw new ApiError(404, 'Social platform configuration not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, socialLink.displayName + ' removed successfully')
  );
});