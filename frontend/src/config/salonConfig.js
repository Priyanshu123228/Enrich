/**
 * Central Salon Configuration & Business Data
 * Enrich Beauty Parlour & Cosmetic Clinic
 * 
 * All static business details, hours, contact information,
 * about stats, standards, and default data fallbacks live here.
 */

export const SALON_CONFIG = {
  // Business Identity
  business: {
    name: 'Enrich Beauty Parlour & Cosmetic Clinic',
    shortName: 'Enrich Parlour',
    tagline: 'Hair, Makeup, Skin & Cosmetic Clinic Services in Sikar, Rajasthan',
    badge: 'First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar',
    description: 'A dedicated beauty boutique offering personalized hair color, precision styling, clinical skincare, and luxury nail services. Book your appointment online or visit our studio.',
    establishedYear: 2018,
  },

  // Currency
  currency: {
    symbol: '₹',
    code: 'INR',
  },

  // Contact & Concierge
  contact: {
    phone: '96679 00313',
    phoneFormatted: '+91 96679 00313',
    phoneTel: 'tel:9667900313',
    email: 'enrichparlour1212@gmail.com',
    emailMailto: 'mailto:enrichparlour1212@gmail.com',
    whatsapp: 'https://wa.me/919667900313',
    instagram: 'https://www.instagram.com/enrich_beauty25/',
    facebook: 'https://www.facebook.com/enrichparloursikar',
    address: 'First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001',
    addressShort: 'First Floor, Sharda Heights, Chandpol, Sikar',
    directionsHint: 'Near Ramlila Maidan and Parshuram Park, Chandpol. Dedicated parking and easy premises access.',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sharda+Heights+near+Ramlila+Maidan+Parshuram+Park+Chandpol+Sikar+Rajasthan+332001',
  },

  // Operating Hours
  hours: {
    weekday: 'Mon - Sat: 9:00 AM - 8:00 PM',
    weekdays: 'Mon - Sat: 9:00 AM - 8:00 PM',
    sunday: 'Sun: 10:00 AM - 5:00 PM',
    summary: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM',
  },

  // Transit & Parking / Location Details
  location: {
    address: 'First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001',
    transitHint: 'Conveniently accessible near Ramlila Maidan / Parshuram Park, Chandpol, Sikar.',
    parkingHint: 'Dedicated customer parking spaces available in front of the premises.',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sharda+Heights+near+Ramlila+Maidan+Parshuram+Park+Chandpol+Sikar+Rajasthan+332001',
  },

  transit: {
    access: 'Conveniently accessible near Ramlila Maidan and Parshuram Park, Chandpol, Sikar.',
    parking: 'Dedicated customer parking space available in front of the building complex.',
  },

  // About Section Configurable Highlights & Stats
  aboutStats: [
    {
      value: '100%',
      label: 'Licensed Specialists',
      title: 'Licensed Specialists',
      description: 'Every team member holds full professional certification and clinical expertise.',
    },
    {
      value: 'Clean',
      label: 'Hospital Sanitation',
      title: 'Hospital Sanitation',
      description: 'Medical-grade autoclaving for all metal implements and single-use sanitary kits.',
    },
    {
      value: 'Direct',
      label: 'Online Reservations',
      title: 'Online Reservations',
      description: 'Real-time schedule availability with instant booking and SMS/email confirmation.',
    },
    {
      value: 'Sikar, RJ',
      label: 'Prime Location',
      title: 'Prime Location',
      description: 'Easily accessible at Shubham Apartment on State Highway 8A, Chandpol.',
    },
  ],

  // Why Choose Us / Quality Standards
  standards: [
    {
      icon: 'ShieldCheck',
      title: 'Licensed Professionals',
      description: 'Every treatment is performed by certified cosmetologists and certified skin therapists.',
    },
    {
      icon: 'CheckCircle',
      title: 'Medical-Grade Sanitation',
      description: 'Hospital-grade autoclaving for all metal implements and single-use sanitary kits for every client.',
    },
    {
      icon: 'Sparkles',
      title: 'Clean Formulations',
      description: 'We partner with dermatologically tested, cruelty-free professional hair, nail, and skincare lines.',
    },
    {
      icon: 'Clock',
      title: 'Dedicated Consultations',
      description: 'Every appointment begins with a focused assessment of your hair, skin, and personal styling goals.',
    },
  ],

  // Service Categories for Filtering
  serviceCategories: ['All', 'Hair', 'Makeup', 'Skin', 'Nails', 'Bridal'],

  // Gallery Categories for Filtering
  galleryCategories: ['All', 'Photos', 'Videos', 'Before & After', 'Hair', 'Makeup', 'Skin', 'Bridal', 'Nails'],

  // Default Services Fallback
  defaultServices: [
    {
      _id: 'srv_hair_cut',
      name: 'Precision Haircut & Styling',
      category: 'Hair',
      duration: 45,
      price: 499,
      description: 'Comprehensive styling consultation, hair cleanse, custom cut, and blowout finish.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      _id: 'srv_bridal_hd',
      name: 'Signature Bridal HD Makeover',
      category: 'Bridal',
      duration: 120,
      price: 4999,
      description: 'High-definition bridal makeup with premium waterproof cosmetics, lash extension, and hair setting.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      _id: 'srv_skin_hydra',
      name: 'Clinical Hydrafacial Treatment',
      category: 'Skin',
      duration: 60,
      price: 1899,
      description: 'Deep pore vacuum extraction, antioxidant serum infusion, and ultrasound skin brightening.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      _id: 'srv_hair_color',
      name: 'Balayage & Global Highlights',
      category: 'Hair',
      duration: 90,
      price: 2499,
      description: 'Custom hand-painted multidimensional balayage with bonded gloss tone treatment.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      _id: 'srv_nails_gel',
      name: 'Luxury Gel Nail Extensions & Art',
      category: 'Nails',
      duration: 60,
      price: 999,
      description: 'Cuticle restoration, sculpted tips, non-chipping LED gel lacquer, and bespoke nail design.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
    {
      _id: 'srv_makeup_party',
      name: 'Party Glam Makeup & Hair',
      category: 'Makeup',
      duration: 60,
      price: 1499,
      description: 'Smokey or soft dewy look with professional setting mist, lashes, and curls.',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  ],

  // Default Stylists Fallback
  defaultStylists: [
    {
      _id: 'st_priya',
      name: 'Priya Sharma',
      specialization: ['Master Colorist', 'Hair Aesthetics'],
      experience: 7,
      avatar: { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80' },
      bio: 'Specialist in precision cuts, balayage color dynamics, and keratin protein therapies.',
      isActive: true,
      status: 'active',
    },
    {
      _id: 'st_pooja',
      name: 'Pooja Verma',
      specialization: ['Clinical Esthetician', 'Hydrafacial'],
      experience: 6,
      avatar: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
      bio: 'Certified cosmetic therapist focusing on deep dermal hydration, acne therapy, and anti-aging treatments.',
      isActive: true,
      status: 'active',
    },
    {
      _id: 'st_ananya',
      name: 'Ananya Saini',
      specialization: ['Bridal Artistry', 'HD Makeup'],
      experience: 8,
      avatar: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
      bio: 'Celebrated makeup artist specializing in royal Rajasthan bridal looks and contemporary occasion styling.',
      isActive: true,
      status: 'active',
    },
    {
      _id: 'st_neha',
      name: 'Neha Joshi',
      specialization: ['Nail Artist', 'Gel Extensions'],
      experience: 5,
      avatar: { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
      bio: 'Creative nail technician offering luxury extensions, ombre art, and relaxing hand spa treatments.',
      isActive: true,
      status: 'active',
    },
  ],

  // Default Offers Fallback
  defaultOffers: [
    {
      _id: 'off_welcome',
      title: 'Welcome Client Special',
      code: 'ENRICH15',
      discountType: 'percentage',
      discountValue: 15,
      description: 'Receive 15% off any haircut, skincare, or cosmetic treatment on your first online booking.',
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      _id: 'off_bridal',
      title: 'Bridal Package Discount',
      code: 'BRIDAL500',
      discountType: 'fixed',
      discountValue: 500,
      description: 'Flat ₹500 off on pre-bridal grooming and complete wedding day makeup packages.',
      validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      _id: 'off_glow',
      title: 'Festival Skin Glow Combo',
      code: 'GLOW20',
      discountType: 'percentage',
      discountValue: 20,
      description: 'Get 20% discount when booking a signature Hydrafacial combined with hair spa.',
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
  ],

  // Default Reviews Fallback
  defaultReviews: [
    {
      _id: 'rev_1',
      customerName: 'Sunita Meena',
      rating: 5,
      review: 'The best parlour in Sikar! My bridal makeup was absolutely flawless and lasted throughout the ceremony without any creasing.',
      service: 'Signature Bridal HD Makeover',
      date: '2026-09-12',
      isVerified: true,
      isPublished: true,
    },
    {
      _id: 'rev_2',
      customerName: 'Komal Sharma',
      rating: 5,
      review: 'Very hygienic and modern environment. The hydrafacial gave my skin an instant glassy glow. Will definitely come back regularly.',
      service: 'Clinical Hydrafacial Treatment',
      date: '2026-09-24',
      isVerified: true,
      isPublished: true,
    },
    {
      _id: 'rev_3',
      customerName: 'Deepika Rathore',
      rating: 5,
      review: 'Priya did a fantastic job with my hair highlights. Exactly the shade I wanted with zero damage. Great hospitality too!',
      service: 'Balayage & Global Highlights',
      date: '2026-10-01',
      isVerified: true,
      isPublished: true,
    },
  ],

  // Default Media Gallery Fallback
  defaultMedia: {
    photos: [
      {
        _id: 'med_p1',
        title: 'Modern Parlour Styling Station',
        category: 'Interior',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
        description: 'Clean, sanitized studio chairs and individual cosmetic consultation suites.',
        mediaType: 'photo',
      },
      {
        _id: 'med_p2',
        title: 'Royal Rajasthani Bridal Makeup',
        category: 'Bridal',
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
        description: 'Traditional jewelry styling and camera-ready HD contouring.',
        mediaType: 'photo',
      },
      {
        _id: 'med_p3',
        title: 'Dimensional Caramel Balayage',
        category: 'Hair',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        description: 'Multi-tonal highlights with high-gloss keratin seal.',
        mediaType: 'photo',
      },
      {
        _id: 'med_p4',
        title: 'Custom Gel Nail Extension & Ombre Art',
        category: 'Nails',
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
        description: 'Durable sculpted tips with crystal embellishments.',
        mediaType: 'photo',
      },
    ],
    videos: [
      {
        _id: 'med_v1',
        title: 'Salon Walkthrough & Clinic Tour',
        category: 'Interior',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        duration: 45,
        description: 'Take a virtual walk through our styling stations and facial treatment rooms.',
        mediaType: 'video',
      },
      {
        _id: 'med_v2',
        title: 'Hydrafacial Clinical Procedure Step-by-Step',
        category: 'Skin',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        duration: 60,
        description: 'Demonstrating painless deep extraction and skin rejuvenation serums.',
        mediaType: 'video',
      },
    ],
    transformations: [
      {
        _id: 'med_t1',
        title: 'Color Correction & Keratin Smooth',
        category: 'Hair',
        beforeImage: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80',
        afterImage: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'before_after',
      },
    ],
    all: [
      {
        _id: 'med_p1',
        title: 'Modern Parlour Styling Station',
        category: 'Interior',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
        description: 'Clean, sanitized studio chairs and individual cosmetic consultation suites.',
        mediaType: 'photo',
      },
      {
        _id: 'med_p2',
        title: 'Royal Rajasthani Bridal Makeup',
        category: 'Bridal',
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
        description: 'Traditional jewelry styling and camera-ready HD contouring.',
        mediaType: 'photo',
      },
      {
        _id: 'med_p3',
        title: 'Dimensional Caramel Balayage',
        category: 'Hair',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        description: 'Multi-tonal highlights with high-gloss keratin seal.',
        mediaType: 'photo',
      },
      {
        _id: 'med_v1',
        title: 'Salon Walkthrough & Clinic Tour',
        category: 'Interior',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        duration: 45,
        description: 'Take a virtual walk through our styling stations and facial treatment rooms.',
        mediaType: 'video',
      },
      {
        _id: 'med_p4',
        title: 'Custom Gel Nail Extension & Ombre Art',
        category: 'Nails',
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
        description: 'Durable sculpted tips with crystal embellishments.',
        mediaType: 'photo',
      },
      {
        _id: 'med_t1',
        title: 'Color Correction & Keratin Smooth',
        category: 'Hair',
        beforeImage: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80',
        afterImage: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'before_after',
      },
    ],
  },
};
