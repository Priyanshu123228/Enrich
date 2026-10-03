import { Staff } from '../models/Staff.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get all staff members with optional search and filters
 * @route   GET /api/v1/staff
 * @access  Public
 */
export const getStaffList = asyncHandler(async (req, res) => {
  const {
    serviceId,
    specialization,
    status = 'active',
    search,
    includeInactive
  } = req.query;

  const filter = {};

  // Status filter (admin can view all staff, customers view active by default)
  if (includeInactive === 'true' && req.user && req.user.role === 'admin') {
    // Admin requested all staff
  } else if (status && status !== 'all') {
    filter.status = status;
  }

  // Filter by service offered
  if (serviceId) {
    filter.services = serviceId;
  }

  // Filter by specialization
  if (specialization && specialization !== 'All') {
    filter.specialization = { $in: [new RegExp(specialization, 'i')] };
  }

  // Search by name or bio
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { bio: searchRegex },
      { specialization: searchRegex }
    ];
  }

  const staffMembers = await Staff.find(filter)
    .populate('services', 'name category price duration discountPrice images')
    .sort({ experience: -1, ratingAverage: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, staffMembers, 'Staff roster fetched successfully')
  );
});

/**
 * @desc    Get single staff member profile with assigned services & schedule
 * @route   GET /api/v1/staff/:id
 * @access  Public
 */
export const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findById(id).populate(
    'services',
    'name category price duration discountPrice description features images'
  );

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  return res.status(200).json(
    new ApiResponse(200, staff, 'Staff profile fetched successfully')
  );
});

/**
 * @desc    Create / Onboard a new staff member
 * @route   POST /api/v1/staff
 * @access  Private / Admin
 */
export const createStaff = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    avatar,
    bio,
    experience,
    specialization,
    services,
    schedule,
    status
  } = req.body;

  // Check if email is already taken
  const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
  if (existingStaff) {
    throw new ApiError(409, 'A staff member with this email already exists');
  }

  const staff = await Staff.create({
    name,
    email: email.toLowerCase(),
    phone,
    avatar: avatar || {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      public_id: ''
    },
    bio,
    experience: Number(experience),
    specialization: specialization || [],
    services: services || [],
    schedule: schedule || undefined, // Uses schema defaults if omitted
    status: status || 'active'
  });

  const populatedStaff = await Staff.findById(staff._id).populate(
    'services',
    'name category price duration'
  );

  return res.status(201).json(
    new ApiResponse(201, populatedStaff, 'Staff member onboarded successfully')
  );
});

/**
 * @desc    Update staff profile, assigned services, or working schedule
 * @route   PUT /api/v1/staff/:id
 * @access  Private / Admin
 */
export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findById(id);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  const {
    name,
    email,
    phone,
    avatar,
    bio,
    experience,
    specialization,
    services,
    schedule,
    status
  } = req.body;

  // If email updated, verify uniqueness
  if (email && email.toLowerCase() !== staff.email) {
    const existing = await Staff.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
    if (existing) {
      throw new ApiError(409, 'This email is already in use by another staff member');
    }
    staff.email = email.toLowerCase();
  }

  if (name !== undefined) staff.name = name;
  if (phone !== undefined) staff.phone = phone;
  if (avatar !== undefined) staff.avatar = avatar;
  if (bio !== undefined) staff.bio = bio;
  if (experience !== undefined) staff.experience = Number(experience);
  if (specialization !== undefined) staff.specialization = specialization;
  if (services !== undefined) staff.services = services;
  if (schedule !== undefined) staff.schedule = schedule;
  if (status !== undefined) staff.status = status;

  await staff.save();

  const updatedStaff = await Staff.findById(staff._id).populate(
    'services',
    'name category price duration'
  );

  return res.status(200).json(
    new ApiResponse(200, updatedStaff, 'Staff details updated successfully')
  );
});

/**
 * @desc    Delete staff member
 * @route   DELETE /api/v1/staff/:id
 * @access  Private / Admin
 */
export const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findByIdAndDelete(id);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Staff member removed successfully')
  );
});

/**
 * @desc    Seed default master beauticians
 * @route   POST /api/v1/staff/seed
 * @access  Public / Admin
 */
export const seedDefaultStaff = asyncHandler(async (req, res) => {
  const services = await Service.find();
  const hairServices = services.filter((s) => s.category === 'Hair').map((s) => s._id);
  const skinServices = services.filter((s) => s.category === 'Skin').map((s) => s._id);
  const makeupServices = services.filter((s) => ['Makeup', 'Bridal'].includes(s.category)).map((s) => s._id);
  const nailSpaServices = services.filter((s) => ['Nails', 'Spa'].includes(s.category)).map((s) => s._id);

  const sampleStaff = [
    {
      name: 'Elena Vance',
      email: 'elena@enrichparlour.com',
      phone: '+1 (555) 234-5678',
      avatar: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        public_id: ''
      },
      bio: 'Trained in Paris and London with 12+ years of experience in couture balayage, precision styling, and bespoke texture treatments.',
      experience: 12,
      specialization: ['Hair Styling', 'Balayage & Color', 'Hair Restoration'],
      services: hairServices.length > 0 ? hairServices : [],
      status: 'active',
      ratingAverage: 4.9,
      ratingCount: 64
    },
    {
      name: 'Aria Montgomery',
      email: 'aria@enrichparlour.com',
      phone: '+1 (555) 345-6789',
      avatar: {
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        public_id: ''
      },
      bio: 'Licensed clinical aesthetician specializing in European hydra-facials, lymphatic sculpt, and restorative 24K gold skin therapies.',
      experience: 8,
      specialization: ['European Facials', 'Anti-Aging Therapy', 'Lymphatic Drainage'],
      services: skinServices.length > 0 ? skinServices : [],
      status: 'active',
      ratingAverage: 5.0,
      ratingCount: 52
    },
    {
      name: 'Zara Chen',
      email: 'zara@enrichparlour.com',
      phone: '+1 (555) 456-7890',
      avatar: {
        url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
        public_id: ''
      },
      bio: 'Celebrity and bridal artist famed for signature dewy glass skin, airbrush wedding glam, and red carpet elegance.',
      experience: 10,
      specialization: ['HD Bridal Makeup', 'Airbrush Makeup', 'Editorial Glam'],
      services: makeupServices.length > 0 ? makeupServices : [],
      status: 'active',
      ratingAverage: 4.9,
      ratingCount: 78
    },
    {
      name: 'Mia Laurent',
      email: 'mia@enrichparlour.com',
      phone: '+1 (555) 567-8901',
      avatar: {
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        public_id: ''
      },
      bio: 'Artisan nail technician and licensed spa therapist delivering Swedish deep tissue relaxation and luxury sculpted chrome art.',
      experience: 6,
      specialization: ['Chrome Nail Extensions', 'Swedish Massage', 'Aromatherapy'],
      services: nailSpaServices.length > 0 ? nailSpaServices : [],
      status: 'active',
      ratingAverage: 4.8,
      ratingCount: 39
    }
  ];

  for (const staffData of sampleStaff) {
    await Staff.findOneAndUpdate(
      { email: staffData.email },
      staffData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const allStaff = await Staff.find().populate('services', 'name category price duration');
  return res.status(200).json(
    new ApiResponse(200, allStaff, `Staff roster populated with ${allStaff.length} master stylists`)
  );
});
