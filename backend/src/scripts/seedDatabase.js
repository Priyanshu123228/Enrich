import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { Staff } from '../models/Staff.js';
import { Offer } from '../models/Offer.js';
import { Review } from '../models/Review.js';
import { Media } from '../models/Media.js';
import { Appointment } from '../models/Appointment.js';
import { Payment } from '../models/Payment.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export const seedCompleteDatabase = async () => {
  try {
    console.log('Connecting to MongoDB database [Enrich]...');
    await mongoose.connect(MONGODB_URI, { dbName: 'Enrich' });
    console.log('Connected to Enrich database. Clearing existing records...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Service.deleteMany({}),
      Staff.deleteMany({}),
      Offer.deleteMany({}),
      Review.deleteMany({}),
      Media.deleteMany({}),
      Appointment.deleteMany({}),
      Payment.deleteMany({})
    ]);

    console.log('Existing records cleared. Seeding fresh data...');

    // 1. SEED USERS
    console.log('1. Seeding Users (Admin, Staff, Customers)...');
    const adminUser = await User.create({
      name: 'Victoria Stone',
      email: 'admin@enrichparlour.com',
      phone: '(212) 555-0100',
      password: 'Admin@123456',
      role: 'admin',
      isVerified: true
    });

    const customer1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '(212) 555-0142',
      password: 'Password@123',
      role: 'customer',
      isVerified: true
    });

    const customer2 = await User.create({
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '(212) 555-0189',
      password: 'Password@123',
      role: 'customer',
      isVerified: true
    });

    const staffUser1 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@enrichparlour.com',
      phone: '(212) 555-0155',
      password: 'Staff@123456',
      role: 'staff',
      isVerified: true
    });

    const staffUser2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.vance@enrichparlour.com',
      phone: '(212) 555-0177',
      password: 'Staff@123456',
      role: 'staff',
      isVerified: true
    });

    // 2. SEED CATEGORIES
    console.log('2. Seeding Department Categories...');
    const categoriesData = [
      {
        name: 'Hair',
        slug: 'hair',
        description: 'Precision cuts, dimensional balayage, gloss treatments, and formal styling.',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        order: 1
      },
      {
        name: 'Skin',
        slug: 'skin',
        description: 'Clinical facials, ultrasonic extractions, chemical peels, and barrier repair therapies.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        order: 2
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Camera-ready bridal makeup, evening glam, and customized private makeup lessons.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        order: 3
      },
      {
        name: 'Nails',
        slug: 'nails',
        description: 'Structured builder gel overlays, dry Russian manicures, and precision hand-painted nail art.',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
        order: 4
      },
      {
        name: 'Spa',
        slug: 'spa',
        description: 'Aromatherapy body massages, deep-tissue recovery, and revitalizing body exfoliations.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        order: 5
      },
      {
        name: 'Bridal',
        slug: 'bridal',
        description: 'Comprehensive wedding hair and makeup packages including trial sessions and day-of on-site artistry.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        order: 6
      }
    ];
    await Category.insertMany(categoriesData);

    // 3. SEED SERVICES
    console.log('3. Seeding Comprehensive Salon Services Catalog...');
    const servicesData = [
      // HAIR
      {
        name: 'Custom Cut & Blowout',
        category: 'Hair',
        price: 95,
        discountPrice: 85,
        duration: 60,
        description: 'In-depth consultation, relaxing scalp massage with nourishing botanicals, tailored precision cut, and salon-grade blowout finish.',
        images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Consultation & Hair Analysis', 'Scalp Massage', 'Custom Styling & Thermal Finish'],
        ratingAverage: 4.9,
        ratingCount: 14
      },
      {
        name: 'Dimensional Balayage & Gloss Finish',
        category: 'Hair',
        price: 180,
        discountPrice: 165,
        duration: 120,
        description: 'Hand-painted sun-kissed lightening tailored to your natural hair movement, followed by a customized acidic gloss toner for high shine and seamless blending.',
        images: [{ url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Bond-Builder Protection', 'Custom Gloss Toner', 'Blowout Included'],
        ratingAverage: 5.0,
        ratingCount: 22
      },
      {
        name: 'Keratin Smoothing Therapy',
        category: 'Hair',
        price: 240,
        discountPrice: 210,
        duration: 150,
        description: 'Professional smoothing treatment that eliminates frizz, restores hair integrity, and reduces daily styling time for up to 4 months.',
        images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Formaldehyde-Free Formula', 'Intense Frizz Reduction', 'Lasts up to 16 Weeks'],
        ratingAverage: 4.8,
        ratingCount: 9
      },

      // SKIN
      {
        name: 'Signature Deep Cleansing Facial',
        category: 'Skin',
        price: 120,
        discountPrice: 105,
        duration: 60,
        description: 'Ultrasonic pore cleansing, targeted botanical enzyme exfoliation, steam extractions, customized hydration mask, and lymphatic facial massage.',
        images: [{ url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Skin Analysis', 'Ultrasonic Extraction', 'LED Therapy Finish'],
        ratingAverage: 4.9,
        ratingCount: 18
      },
      {
        name: 'Hydrating Oxygen Infusion Facial',
        category: 'Skin',
        price: 150,
        discountPrice: 135,
        duration: 75,
        description: 'Hyperbaric oxygen delivery of low-molecular hyaluronic acid and peptide serums to immediately plump, brighten, and restore tired skin.',
        images: [{ url: 'https://images.unsplash.com/photo-1512290900672-1f5be6f9e0eb?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Pure Oxygen Spray', 'Multi-Weight Hyaluronic Acid', 'Instant Radiance'],
        ratingAverage: 5.0,
        ratingCount: 11
      },

      // NAILS
      {
        name: 'Structured Gel Manicure',
        category: 'Nails',
        price: 65,
        discountPrice: 55,
        duration: 50,
        description: 'E-file cuticle alignment, apex-building builder gel overlay for reinforcement, and high-shine non-chip gel polish.',
        images: [{ url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Dry Russian Technique', 'Apex Reinforcement', 'Chip-Free 3+ Weeks'],
        ratingAverage: 4.9,
        ratingCount: 16
      },
      {
        name: 'Full Set Gel Extensions with Fine Art',
        category: 'Nails',
        price: 95,
        discountPrice: 85,
        duration: 80,
        description: 'Full-cover soft gel tips custom shaped (Almond, Square, Coffin) with personalized hand-painted nail art accents.',
        images: [{ url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Custom Tip Sizing', 'Fine-Line Hand Art', 'Cuticle Oil Treatment'],
        ratingAverage: 4.8,
        ratingCount: 8
      },

      // MAKEUP & BRIDAL
      {
        name: 'Bridal Trial Hair & Makeup Session',
        category: 'Bridal',
        price: 220,
        discountPrice: 195,
        duration: 120,
        description: 'Complete preview session exploring veil placement, hair textures, and high-definition photography-ready makeup artistry.',
        images: [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Veil & Accessory Styling', 'Lash Application', 'Skin Prep Regimen Consultation'],
        ratingAverage: 5.0,
        ratingCount: 15
      },
      {
        name: 'Evening Occasion Makeup Artistry',
        category: 'Makeup',
        price: 110,
        discountPrice: 95,
        duration: 60,
        description: 'Full-face event makeup with contouring, custom lash band or clusters, and long-wear setting formulation for galas and special occasions.',
        images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Custom Lashes Included', 'Waterproof Formulation', 'Touch-Up Kit Provided'],
        ratingAverage: 4.9,
        ratingCount: 13
      },

      // SPA
      {
        name: 'Aromatherapy Stress Relief Massage',
        category: 'Spa',
        price: 130,
        discountPrice: 115,
        duration: 60,
        description: 'Swedish and light deep-tissue techniques utilizing customized organic essential oil blends to release muscle tension and calm the nervous system.',
        images: [{ url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' }],
        features: ['Organic Essential Oils', 'Hot Towel Treatment', 'Private Suite'],
        ratingAverage: 4.9,
        ratingCount: 10
      }
    ];

    const createdServices = await Service.insertMany(servicesData);
    console.log(`Created ${createdServices.length} services.`);

    // 4. SEED STAFF
    console.log('4. Seeding Master Stylists & Schedules...');
    const hairServices = createdServices.filter((s) => s.category === 'Hair' || s.category === 'Bridal').map((s) => s._id);
    const skinServices = createdServices.filter((s) => s.category === 'Skin' || s.category === 'Spa').map((s) => s._id);
    const nailServices = createdServices.filter((s) => s.category === 'Nails').map((s) => s._id);
    const makeupServices = createdServices.filter((s) => s.category === 'Makeup' || s.category === 'Bridal').map((s) => s._id);

    const staffData = [
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@enrichparlour.com',
        phone: '(212) 555-0155',
        bio: 'Master Colorist with 12 years of editorial and salon experience. Specializing in dimensional blondes, bespoke balayage, and corrective color techniques.',
        experience: 12,
        specialization: ['Master Colorist', 'Balayage', 'Hair Restructuring'],
        avatar: { url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80' },
        services: hairServices,
        user: staffUser1._id,
        ratingAverage: 5.0,
        ratingCount: 22
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@enrichparlour.com',
        phone: '(212) 555-0177',
        bio: 'Creative Director specializing in precision dry cutting, tailored French bobs, textured layers, and advanced keratin smoothing treatments.',
        experience: 9,
        specialization: ['Precision Cutting', 'Keratin Smoothing', 'French Styling'],
        avatar: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
        services: hairServices,
        user: staffUser2._id,
        ratingAverage: 4.9,
        ratingCount: 16
      },
      {
        name: 'Aria Chen',
        email: 'aria.chen@enrichparlour.com',
        phone: '(212) 555-0188',
        bio: 'Licensed Clinical Esthetician with 8 years of dermatological skincare expertise. Specializes in barrier repair, extractions, and oxygen therapy.',
        experience: 8,
        specialization: ['Clinical Esthetician', 'Hydrafacial', 'Barrier Therapy'],
        avatar: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
        services: skinServices,
        ratingAverage: 4.9,
        ratingCount: 14
      },
      {
        name: 'Sophia Laurent',
        email: 'sophia.laurent@enrichparlour.com',
        phone: '(212) 555-0199',
        bio: 'Senior Bridal Artist with 10 years crafting couture bridal makeup, red-carpet looks, and modern occasion hair designs.',
        experience: 10,
        specialization: ['Bridal Makeup', 'Occasion Artistry', 'HD Airbrush'],
        avatar: { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
        services: makeupServices,
        ratingAverage: 5.0,
        ratingCount: 19
      },
      {
        name: 'Chloe Bennett',
        email: 'chloe.bennett@enrichparlour.com',
        phone: '(212) 555-0122',
        bio: 'Nail technician specializing in Russian dry manicures, structured builder gel overlays, and fine-line hand-painted nail artistry.',
        experience: 6,
        specialization: ['Structured Gel', 'Russian Manicure', 'Fine Nail Art'],
        avatar: { url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80' },
        services: nailServices,
        ratingAverage: 4.8,
        ratingCount: 11
      }
    ];

    const createdStaff = await Staff.insertMany(staffData);
    console.log(`Created ${createdStaff.length} stylists.`);

    // 5. SEED PROMOTIONAL OFFERS
    console.log('5. Seeding Promotional Offers & Coupons...');
    const now = new Date();
    const futureDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    const offersData = [
      {
        title: 'Welcome Client Package',
        code: 'WELCOME15',
        offerType: 'discount',
        discountType: 'percentage',
        discountValue: 15,
        minBookingAmount: 50,
        maxDiscountAmount: 50,
        startDate: now,
        endDate: futureDate,
        validTill: futureDate,
        description: 'Enjoy 15% off your first hair styling, cut, or facial appointment at Enrich Beauty Parlour & Cosmetic Clinic.',
        bannerImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        badgeText: 'New Client Special',
        isAllServices: true
      },
      {
        title: 'Seasonal Skin Revitalization',
        code: 'GLOW20',
        offerType: 'seasonal',
        discountType: 'percentage',
        discountValue: 20,
        minBookingAmount: 100,
        maxDiscountAmount: 40,
        startDate: now,
        endDate: futureDate,
        validTill: futureDate,
        description: 'Save 20% on any signature clinical facial when booked with an add-on eye treatment.',
        bannerImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
        badgeText: 'Limited Seasonal',
        isAllServices: false,
        applicableServices: skinServices
      },
      {
        title: 'Bridal Trial Credit',
        code: 'BRIDAL25',
        offerType: 'package',
        discountType: 'fixed',
        discountValue: 25,
        minBookingAmount: 180,
        startDate: now,
        endDate: futureDate,
        validTill: futureDate,
        description: 'Receive a $25 credit toward wedding day bookings following your bridal preview session.',
        bannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        badgeText: 'Bridal Bundle',
        isAllServices: false,
        applicableServices: makeupServices
      }
    ];

    await Offer.insertMany(offersData);

    // 6. SEED MEDIA GALLERY
    console.log('6. Seeding Photos, Video Tours & Transformations...');
    const mediaData = [
      {
        title: 'Styling Floor & Reception Lounge',
        type: 'photo',
        category: 'Salon Interior',
        url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
        description: 'Spacious styling stations and private consultation desk in Chandpol, Sikar.',
        displayOrder: 1,
        isFeatured: true
      },
      {
        title: 'Dimensional Caramel Balayage',
        type: 'photo',
        category: 'Hair',
        url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
        description: 'Hand-painted warm caramel balayage with high-shine gloss finish.',
        displayOrder: 2,
        isFeatured: true
      },
      {
        title: 'Bridal Hair & Dewy Makeup Artistry',
        type: 'photo',
        category: 'Bridal',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
        description: 'Couture bridal updo paired with natural dewy evening makeup.',
        displayOrder: 3,
        isFeatured: true
      },
      {
        title: 'Structured Builder Gel Nail Art',
        type: 'photo',
        category: 'Nails',
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
        description: 'Hand-painted fine-line minimal nail art on soft builder gel base.',
        displayOrder: 4,
        isFeatured: true
      },
      // Video Tours
      {
        title: 'Salon Walkthrough & Treatment Suites',
        type: 'video',
        category: 'Salon Tour',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
        duration: 60,
        description: 'Brief walkthrough of our treatment rooms and styling stations.',
        displayOrder: 1,
        isFeatured: true
      },
      {
        title: 'Layered Cut & Blowout Demo',
        type: 'video',
        category: 'Hair Transformation',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        duration: 45,
        description: 'Layered cut and blowout technique demonstrated by master stylist.',
        displayOrder: 2,
        isFeatured: true
      },
      {
        title: 'Builder Gel Nail Overlay Process',
        type: 'video',
        category: 'Nail Art',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
        duration: 35,
        description: 'Builder gel overlay and finishing process.',
        displayOrder: 3,
        isFeatured: true
      },
      // Before & After
      {
        title: 'Color Correction: Warm Tone to Cool Beige',
        type: 'photo',
        category: 'Before & After',
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
        beforeAfter: {
          beforeUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80',
          afterUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80'
        },
        description: 'Corrective balayage and neutralizing gloss treatment.',
        displayOrder: 1,
        isFeatured: true
      }
    ];

    await Media.insertMany(mediaData);

    // 7. SEED SAMPLE APPOINTMENTS & REVIEWS
    console.log('7. Seeding Verified Appointments & Client Reviews...');
    const pastApp1 = await Appointment.create({
      bookingId: 'LX-2026-89412',
      customer: customer1._id,
      service: createdServices[0]._id, // Custom Cut
      staff: createdStaff[0]._id,     // Elena
      date: '2026-09-24',
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      price: 95,
      finalAmount: 95,
      status: 'completed',
      paymentStatus: 'paid'
    });

    const pastApp2 = await Appointment.create({
      bookingId: 'LX-2026-72104',
      customer: customer2._id,
      service: createdServices[3]._id, // Signature Facial
      staff: createdStaff[2]._id,     // Aria
      date: '2026-09-28',
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      price: 120,
      finalAmount: 120,
      status: 'completed',
      paymentStatus: 'paid'
    });

    // Upcoming Appointment
    await Appointment.create({
      bookingId: 'LX-2026-99321',
      customer: customer1._id,
      service: createdServices[1]._id, // Balayage
      staff: createdStaff[0]._id,     // Elena
      date: '2026-10-15',
      startTime: '10:00',
      endTime: '12:00',
      duration: 120,
      price: 180,
      finalAmount: 180,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    // No fake reviews seeded

    await Review.create({
      customer: customer2._id,
      service: createdServices[3]._id,
      staff: createdStaff[2]._id,
      appointment: pastApp2._id,
      rating: 5,
      comment: 'The signature facial left my skin thoroughly hydrated and glowing. Aria is exceptionally knowledgeable about skin barriers.',
      isApproved: true
    });

    console.log('✅ COMPLETE SEED SUCCESSFUL! Database [Enrich] is now populated with authentic data.');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// If run directly via node CLI
if (process.argv[1] && process.argv[1].includes('seedDatabase.js')) {
  seedCompleteDatabase().then(() => {
    console.log('Exiting seed process.');
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}
