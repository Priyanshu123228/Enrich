import { Offer } from '../models/Offer.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Public: Get active, unexpired offers (optionally filter by offerType)
 */
export const getActiveOffers = asyncHandler(async (req, res) => {
  const { offerType } = req.query;
  const now = new Date();

  const filter = {
    isActive: true,
    endDate: { $gte: now }
  };
  if (offerType && offerType !== 'all') {
    filter.offerType = offerType;
  }

  let offers = await Offer.find(filter)
    .populate('applicableServices', 'name category price images duration')
    .populate('packageServices', 'name category price images duration')
    .sort({ createdAt: -1 })
    .lean();

  // If no offers in DB, auto-seed default luxury salon specials
  if (offers.length === 0) {
    await seedStarterOffers();
    offers = await Offer.find(filter)
      .populate('applicableServices', 'name category price images duration')
      .populate('packageServices', 'name category price images duration')
      .sort({ createdAt: -1 })
      .lean();
  }

  return res.status(200).json(
    new ApiResponse(200, offers, 'Active offers fetched successfully')
  );
});

/**
 * Admin: Get all offers (active, expired, inactive)
 */
export const getAllOffers = asyncHandler(async (req, res) => {
  const { offerType, status } = req.query;
  const filter = {};

  if (offerType && offerType !== 'all') filter.offerType = offerType;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const offers = await Offer.find(filter)
    .populate('applicableServices', 'name category price')
    .populate('packageServices', 'name category price')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, offers, 'All offers fetched successfully')
  );
});

/**
 * Admin: Create new discount, package, or seasonal offer
 */
export const createOffer = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    offerType = 'discount',
    code,
    discountType = 'percentage',
    discountValue,
    startDate,
    endDate,
    validTill,
    applicableServices = [],
    isAllServices = true,
    packageServices = [],
    minBookingAmount = 0,
    maxDiscountAmount = 1000,
    usageLimit = 100,
    bannerImage = '',
    badgeText = 'Special Offer',
    isActive = true
  } = req.body;

  if (!title) throw new ApiError(400, 'Offer title is required');
  if (!code) throw new ApiError(400, 'Coupon/Promo code is required');
  if (!discountValue || Number(discountValue) <= 0) {
    throw new ApiError(400, 'Discount value must be greater than 0');
  }

  const effectiveEndDate = endDate ? new Date(endDate) : validTill ? new Date(validTill) : null;
  if (!effectiveEndDate) {
    throw new ApiError(400, 'End / Expiry date is required');
  }

  const existing = await Offer.findOne({ code: code.toUpperCase().trim() });
  if (existing) {
    throw new ApiError(409, `Promo code "${code.toUpperCase()}" already exists`);
  }

  const offer = await Offer.create({
    title,
    description,
    offerType,
    code: code.toUpperCase().trim(),
    discountType,
    discountValue: Number(discountValue),
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: effectiveEndDate,
    validTill: effectiveEndDate,
    applicableServices: Array.isArray(applicableServices) ? applicableServices : [],
    isAllServices: applicableServices.length === 0 ? true : Boolean(isAllServices),
    packageServices: Array.isArray(packageServices) ? packageServices : [],
    minBookingAmount: Number(minBookingAmount) || 0,
    maxDiscountAmount: Number(maxDiscountAmount) || 1000,
    usageLimit: Number(usageLimit) || 100,
    bannerImage,
    badgeText,
    isActive: Boolean(isActive)
  });

  const populated = await Offer.findById(offer._id)
    .populate('applicableServices', 'name category price')
    .populate('packageServices', 'name category price');

  return res.status(201).json(
    new ApiResponse(201, populated, 'Offer created successfully')
  );
});

/**
 * Admin: Update offer
 */
export const updateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const offer = await Offer.findById(id);
  if (!offer) throw new ApiError(404, 'Offer not found');

  const {
    title,
    description,
    offerType,
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    validTill,
    applicableServices,
    isAllServices,
    packageServices,
    minBookingAmount,
    maxDiscountAmount,
    usageLimit,
    bannerImage,
    badgeText,
    isActive
  } = req.body;

  if (code && code.toUpperCase().trim() !== offer.code) {
    const existing = await Offer.findOne({
      code: code.toUpperCase().trim(),
      _id: { $ne: id }
    });
    if (existing) throw new ApiError(409, `Promo code "${code.toUpperCase()}" already exists`);
    offer.code = code.toUpperCase().trim();
  }

  if (title !== undefined) offer.title = title;
  if (description !== undefined) offer.description = description;
  if (offerType !== undefined) offer.offerType = offerType;
  if (discountType !== undefined) offer.discountType = discountType;
  if (discountValue !== undefined) offer.discountValue = Number(discountValue);
  if (startDate !== undefined) offer.startDate = new Date(startDate);
  if (endDate !== undefined) {
    offer.endDate = new Date(endDate);
    offer.validTill = new Date(endDate);
  } else if (validTill !== undefined) {
    offer.endDate = new Date(validTill);
    offer.validTill = new Date(validTill);
  }
  if (applicableServices !== undefined) {
    offer.applicableServices = applicableServices;
    offer.isAllServices = applicableServices.length === 0;
  }
  if (isAllServices !== undefined) offer.isAllServices = Boolean(isAllServices);
  if (packageServices !== undefined) offer.packageServices = packageServices;
  if (minBookingAmount !== undefined) offer.minBookingAmount = Number(minBookingAmount);
  if (maxDiscountAmount !== undefined) offer.maxDiscountAmount = Number(maxDiscountAmount);
  if (usageLimit !== undefined) offer.usageLimit = Number(usageLimit);
  if (bannerImage !== undefined) offer.bannerImage = bannerImage;
  if (badgeText !== undefined) offer.badgeText = badgeText;
  if (isActive !== undefined) offer.isActive = Boolean(isActive);

  await offer.save();

  const populated = await Offer.findById(offer._id)
    .populate('applicableServices', 'name category price')
    .populate('packageServices', 'name category price');

  return res.status(200).json(
    new ApiResponse(200, populated, 'Offer updated successfully')
  );
});

/**
 * Admin: Toggle Offer Active Status
 */
export const toggleOfferStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const offer = await Offer.findById(id);
  if (!offer) throw new ApiError(404, 'Offer not found');

  offer.isActive = !offer.isActive;
  await offer.save();

  return res.status(200).json(
    new ApiResponse(200, offer, `Offer marked as ${offer.isActive ? 'Active' : 'Inactive'}`)
  );
});

/**
 * Admin: Delete offer
 */
export const deleteOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const offer = await Offer.findByIdAndDelete(id);
  if (!offer) throw new ApiError(404, 'Offer not found');

  return res.status(200).json(
    new ApiResponse(200, null, 'Offer deleted successfully')
  );
});

/**
 * Customer: Validate coupon code during booking
 */
export const validateOfferCode = asyncHandler(async (req, res) => {
  const { code, bookingAmount, serviceId } = req.body;

  if (!code) throw new ApiError(400, 'Promo code is required');
  const now = new Date();

  const offer = await Offer.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    endDate: { $gte: now }
  }).populate('applicableServices', 'name price');

  if (!offer) {
    throw new ApiError(404, 'Invalid, expired, or inactive promo code');
  }

  if (offer.usedCount >= offer.usageLimit) {
    throw new ApiError(400, 'This promo code has reached its maximum usage limit');
  }

  if (bookingAmount < offer.minBookingAmount) {
    throw new ApiError(
      400,
      `Minimum booking amount of $${offer.minBookingAmount} required for coupon "${offer.code}"`
    );
  }

  // If offer applies only to specific services, verify serviceId match
  if (!offer.isAllServices && offer.applicableServices && offer.applicableServices.length > 0) {
    if (serviceId) {
      const isApplicable = offer.applicableServices.some(
        (s) => s._id.toString() === serviceId.toString()
      );
      if (!isApplicable) {
        throw new ApiError(
          400,
          `Promo code "${offer.code}" is not applicable to the selected service`
        );
      }
    }
  }

  let discount = 0;
  if (offer.discountType === 'percentage') {
    discount = (bookingAmount * offer.discountValue) / 100;
    if (offer.maxDiscountAmount && discount > offer.maxDiscountAmount) {
      discount = offer.maxDiscountAmount;
    }
  } else {
    discount = offer.discountValue;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offer,
        discountAmount: Math.min(discount, bookingAmount),
        finalAmount: Math.max(0, bookingAmount - discount)
      },
      `Promo code "${offer.code}" applied successfully! You saved $${Math.min(discount, bookingAmount)}`
    )
  );
});

/**
 * Helper: Starter offers seeder
 */
const seedStarterOffers = async () => {
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const sampleOffers = [
    {
      title: 'First-Time Client Welcome Glamour',
      description: 'Enjoy 25% off any hair, skincare, or makeup service on your initial appointment with our master stylists.',
      offerType: 'discount',
      code: 'WELCOME25',
      discountType: 'percentage',
      discountValue: 25,
      minBookingAmount: 50,
      maxDiscountAmount: 100,
      startDate: new Date(),
      endDate: in60Days,
      validTill: in60Days,
      isAllServices: true,
      badgeText: 'New Client Special',
      bannerImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      usageLimit: 500
    },
    {
      title: 'Summer Radiant Glow Seasonal Special',
      description: 'Beat the heat with our rejuvenating organic facial, vitamin C skin peel, and hydra-infusion treatment.',
      offerType: 'seasonal',
      code: 'SUMMERGLOW',
      discountType: 'percentage',
      discountValue: 20,
      minBookingAmount: 70,
      maxDiscountAmount: 80,
      startDate: new Date(),
      endDate: in30Days,
      validTill: in30Days,
      isAllServices: true,
      badgeText: 'Seasonal Limited',
      bannerImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      usageLimit: 250
    },
    {
      title: 'Royal Bridal & Pre-Wedding Couture Package',
      description: 'Complete luxury bridal makeover including HD Airbrush makeup, couture hair updo, and gel nail extensions.',
      offerType: 'package',
      code: 'ROYALBRIDE',
      discountType: 'fixed',
      discountValue: 50,
      minBookingAmount: 150,
      maxDiscountAmount: 50,
      startDate: new Date(),
      endDate: in60Days,
      validTill: in60Days,
      isAllServices: true,
      badgeText: 'Luxury Package',
      bannerImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      usageLimit: 100
    }
  ];

  await Offer.insertMany(sampleOffers);
};

