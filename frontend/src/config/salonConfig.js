/**
 * Central Salon Configuration & Business Data
 * Enrich Beauty Parlour & Cosmetic Clinic
 * 
 * All static business details, hours, contact information,
 * about stats, standards, and default data fallbacks live here.
 */

export const SALON_CONFIG = {
  // Hero Section Visual
  hero: {
    // 💡 Paste your photo URL here (online link, Cloudinary URL, or local public path like '/hero.jpg')
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    altText: 'Enrich Beauty Parlour & Aesthetic Clinic Sikar',
  },

  // Business Identity
  business: {
    name: 'Enrich Ladies Beauty Parlor',
    shortName: 'Enrich Parlour',
    tagline: 'Hair, Makeup, Skin & Cosmetic Clinic Services in Sikar, Rajasthan',
    badge: 'First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar',
    description: "Discover personalized beauty and skincare services at Enrich Beauty Parlour & Cosmetic Clinic, Sikar. From expert hairstyling and professional makeup to bridal transformations, nail care, and skincare treatments, we're here to help you look and feel your best. Book your appointment and visit us in Sikar, Rajasthan.",
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
    threads: 'https://www.threads.com/@enrich_beauty25',
    facebook: 'https://www.facebook.com/enrichparloursikar',
    address: 'First Floor, Sharda Heights, Ramlila Maidan, Chandpol, Sikar, Rajasthan 332001, India',
    addressShort: 'First Floor, Sharda Heights, Chandpol, Sikar',
    directionsHint: 'Near Ramlila Maidan and Parshuram Park, Chandpol. Dedicated parking and easy premises access.',
    googleMapsUrl: 'https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z/data=!3m1!4b1!4m6!3m5!1s0x396ca5b1f3574153:0x25aebec5e5e3b1fa!8m2!3d27.6053398!4d75.1384512!16s%2Fg%2F11h4_bw5rk',
    writeReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJU0FX87GlbDkR-rHj5cW-riU',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Sharda+Heights,+near+Ramlila+Maidan,+Chandpol,+Sikar,+Rajasthan+332001&t=&z=16&ie=UTF8&iwloc=&output=embed',
  },

    // Operating Hours
  hours: {
    monSat: '9:30 AM – 7:30 PM',
    weekday: '9:30 AM – 7:30 PM',
    weekdays: '9:30 AM – 7:30 PM',
    saturday: '9:30 AM – 7:30 PM',
    sunday: '9:30 AM – 7:30 PM',
    summary: 'Open All 7 Days: 9:30 AM – 7:30 PM',
  },

  // Transit & Parking / Location Details
  location: {
    address: 'First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001',
    transitHint: 'Conveniently accessible near Ramlila Maidan / Parshuram Park, Chandpol, Sikar.',
    parkingHint: 'Dedicated customer parking spaces available in front of the premises.',
    googleMapsUrl: 'https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z/data=!3m1!4b1!4m6!3m5!1s0x396ca5b1f3574153:0x25aebec5e5e3b1fa!8m2!3d27.6053398!4d75.1384512!16s%2Fg%2F11h4_bw5rk',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Sharda+Heights,+near+Ramlila+Maidan,+Chandpol,+Sikar,+Rajasthan+332001&t=&z=16&ie=UTF8&iwloc=&output=embed',
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
      description: 'Easily accessible at Sharda Heights near Ramlila Maidan / Parshuram Park, Chandpol, Sikar.',
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
  serviceCategories: ['All', 'Bridal', 'Makeup', 'Hair', 'Skin', 'Waxing', 'Nails', 'Spa'],

  // Gallery Categories for Filtering
  galleryCategories: ['All', 'Photos', 'Videos', 'Before & After', 'Hair', 'Makeup', 'Skin', 'Bridal', 'Nails'],

  // Official Service Menu & Local Sikar Keywords
  serviceList: [
    'Body waxing',
    'Bridal services',
    'Eyebrow beautification',
    'Eyelashes',
    'Facials',
    'Haircut',
    'Hair extensions',
    'Hairstyling',
    'Make-up',
    'Manicure',
    'Massage',
    'Mobile salon service',
    'Online beauty salon booking',
    'Pedicure',
    'Permanent makeup',
    'Shampoo & conditioning',
    'Shaving',
    'Skin care',
    'Spa services',
    'Waxing',
    'Wedding and event preparation',
    'Bridal Makeup In Sikar',
    'Best Bridal Makeup Artist In Sikar',
    'Bridal Hairstyle In Sikar',
    'Wedding Makeup Near Me In Sikar',
    'Hair Color In Sikar',
    'Keratin Treatment In Sikar',
    'Anti Ageing Facial Sikar',
    'Bridal Makeup near me',
    'Party Makeup Near me',
    'Party makeup near me in Sikar',
    'Skin Brightening Treatment In Sikar',
    'Skin Brightening Treatment near me In Sikar'
  ],
  // Default Services Fallback & Master Services Catalog
  defaultServices: [
    // --- BRIDAL & WEDDING ---
    {
      _id: 'srv_bridal_signature',
      name: 'Bridal Makeup In Sikar',
      category: 'Bridal',
      duration: 150,
      price: 6999,
      discountPrice: 5999,
      description: 'Signature bridal makeover with luxury HD waterproof cosmetics, matching jewelry setting, dupatta draping, and customized lash extensions.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['HD Waterproof Makeup', 'Dupatta & Jewelry Draping', 'Premium Eyelashes', 'Hair Styling Included']
    },
    {
      _id: 'srv_bridal_artist',
      name: 'Best Bridal Makeup Artist In Sikar',
      category: 'Bridal',
      duration: 180,
      price: 9999,
      discountPrice: 8499,
      description: 'Airbrush & HD royal bridal package by our master cosmetologist. Longest-wearing flawless glow for wedding photography.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Airbrush Makeup Finish', 'Pre-Bridal Skin Prep', 'Complete Bridal Accessories Setting']
    },
    {
      _id: 'srv_bridal_hairstyle',
      name: 'Bridal Hairstyle In Sikar',
      category: 'Bridal',
      duration: 60,
      price: 1999,
      discountPrice: 1699,
      description: 'Traditional rose bun, contemporary textured braids, or Hollywood waves crafted with real hair florals and accessories.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Floral Setting', 'Hair Padding & Volume', 'Long-Lasting Hold']
    },
    {
      _id: 'srv_wedding_event_prep',
      name: 'Wedding and event preparation',
      category: 'Bridal',
      duration: 120,
      price: 3499,
      discountPrice: 2999,
      description: 'Full pre-wedding grooming package: custom D-tan, radiant facial clean-up, full waxing, and nail care for the bride and family.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Pre-Event Glow', 'Full Body Prep', 'Complete Family Grooming']
    },
    {
      _id: 'srv_mobile_salon',
      name: 'Mobile salon service',
      category: 'Bridal',
      duration: 120,
      price: 2999,
      discountPrice: 2499,
      description: 'Doorstep bridal makeup, family hair styling, and event dressing at your home or wedding venue in Sikar.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['At-Home Service', 'Full Professional Kit', 'Wedding Venue Visits']
    },

    // --- MAKEUP & OCCASION ---
    {
      _id: 'srv_party_makeup',
      name: 'Party Makeup Near me in Sikar',
      category: 'Makeup',
      duration: 60,
      price: 1499,
      discountPrice: 1299,
      description: 'HD glowing party makeup for weddings, sangeet, reception, or anniversary functions with smudge-proof eye makeup.',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['HD Foundation Finish', 'Smokey or Shimmer Eyes', 'Hairstyling Included']
    },
    {
      _id: 'srv_eyebrow_beautification',
      name: 'Eyebrow beautification',
      category: 'Makeup',
      duration: 20,
      price: 99,
      discountPrice: 79,
      description: 'Hygienic threading, brow shaping, mapping, and tinted brow definition for crisp, elegant arches.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Precise Shaping', 'Painless Threading', 'Brow Calming Gel']
    },
    {
      _id: 'srv_eyelashes',
      name: 'Eyelashes',
      category: 'Makeup',
      duration: 45,
      price: 999,
      discountPrice: 799,
      description: 'Individual cluster lashes or classic volume lash extensions for naturally dense, long, and dramatic eyes.',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Weightless Feel', 'Waterproof Adhesive', 'Up to 3 Weeks Hold']
    },
    {
      _id: 'srv_permanent_makeup',
      name: 'Permanent makeup',
      category: 'Makeup',
      duration: 90,
      price: 3999,
      discountPrice: 3499,
      description: 'Semi-permanent microblading, ombre powder brows, and natural lip blush pigments for effortless daily beauty.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Certified Pigments', 'Smudge-Proof', 'Lasts 1–2 Years']
    },

    // --- HAIR CARE & CHEMICAL TREATMENTS ---
    {
      _id: 'srv_keratin_treatment',
      name: 'Keratin Treatment In Sikar',
      category: 'Hair',
      duration: 150,
      price: 2999,
      discountPrice: 2499,
      description: 'Formaldehyde-free intensive keratin smoothing therapy. Eliminates 95% frizz and leaves hair mirror-shiny and manageable.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Frizz-Free Silk Finish', 'Lasts 3–5 Months', 'Deep Protein Infusion']
    },
    {
      _id: 'srv_hair_color',
      name: 'Hair Color In Sikar',
      category: 'Hair',
      duration: 120,
      price: 2499,
      discountPrice: 1999,
      description: 'Ammonia-free global hair color, fashion balayage, honey blonde streaks, or gray root coverage with gloss toner.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Ammonia-Free', 'Bond Protection Shield', 'Vibrant Shine']
    },
    {
      _id: 'srv_hair_extensions',
      name: 'Hair extensions',
      category: 'Hair',
      duration: 90,
      price: 4999,
      discountPrice: 3999,
      description: '100% human remy hair extensions: clip-on, micro-ring, or tape-in extensions for instant length, thickness, and volume.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['100% Remy Human Hair', 'Heat-Stylable', 'Seamless Color Blend']
    },
    {
      _id: 'srv_haircut_styling',
      name: 'Haircut',
      category: 'Hair',
      duration: 45,
      price: 399,
      discountPrice: 299,
      description: 'Precision layered cut, feather cut, blunt bob, or split-ends trim finished with a high-volume bouncy blowdry.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Personalized Consultation', 'Scalp Wash', 'Thermal Blowdry Finish']
    },
    {
      _id: 'srv_shampoo_conditioning',
      name: 'Shampoo & conditioning',
      category: 'Hair',
      duration: 30,
      price: 299,
      discountPrice: 199,
      description: 'Therapeutic scalp wash with sulfate-free salon shampoo, followed by deep conditioning hair mask and blast dry.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Relaxing Scalp Wash', 'Hydrating Hair Mask', 'Fresh Blowdry']
    },

    // --- SKIN CARE & CLINICAL FACIALS ---
    {
      _id: 'srv_skin_brightening',
      name: 'Skin Brightening Treatment In Sikar',
      category: 'Skin',
      duration: 60,
      price: 1499,
      discountPrice: 1199,
      description: 'D-tan exfoliation, vitamin C serum infusion, ultrasonic brightening peel, and whitening mask for a clean, fair radiant tone.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Instant Tan Removal', 'Vitamin C Infusion', 'Long-Lasting Radiance']
    },
    {
      _id: 'srv_anti_ageing_facial',
      name: 'Anti Ageing Facial Sikar',
      category: 'Skin',
      duration: 75,
      price: 1899,
      discountPrice: 1599,
      description: 'Collagen-boosting microcurrent lift, hyaluronic peptide infusion, and firming mask targeting fine lines and loose skin.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f5be6f9e0eb?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Collagen Lift Mask', 'Skin Tightening', 'Wrinkle Softening']
    },
    {
      _id: 'srv_facials_cleanse',
      name: 'Facials',
      category: 'Skin',
      duration: 60,
      price: 999,
      discountPrice: 799,
      description: 'Gold, Diamond, O3+, or Fruit facials with herbal steam, deep pore blackhead removal, face massage, and glow mask.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Customized Skin Choice', 'Herbal Face Massage', 'Blackhead Removal']
    },

    // --- WAXING & GROOMING ---
    {
      _id: 'srv_body_waxing',
      name: 'Body waxing',
      category: 'Waxing',
      duration: 60,
      price: 1199,
      discountPrice: 999,
      description: 'Full arms, full legs, underarms, and stomach waxing using premium painless Rica Italian wax or organic honey wax.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Gentle Rica Wax', 'Tan-Free Smooth Skin', 'Post-Wax Soothing Lotion']
    },
    {
      _id: 'srv_shaving_grooming',
      name: 'Shaving',
      category: 'Waxing',
      duration: 20,
      price: 199,
      discountPrice: 149,
      description: 'Hygienic single-use dermaplaning facial razor or grooming for smooth peach-fuzz free foundation base.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Sterilized Single-Use Blade', 'Soothing Aloe Vera', 'Flawless Base Prep']
    },

    // --- NAILS, HANDS & FEET ---
    {
      _id: 'srv_manicure',
      name: 'Manicure',
      category: 'Nails',
      duration: 40,
      price: 499,
      discountPrice: 399,
      description: 'Hand soak, nail trimming, cuticle treatment, exfoliating walnut scrub, relaxing hand massage, and long-lasting polish.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Deep Cuticle Care', 'Aromatherapy Hand Massage', 'Glossy Polish']
    },
    {
      _id: 'srv_pedicure',
      name: 'Pedicure',
      category: 'Nails',
      duration: 50,
      price: 699,
      discountPrice: 599,
      description: 'Warm foot spa with dead skin heel filing, callus softening scrub, cooling peppermint pack, and foot reflexology massage.',
      image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Heel Crack Softening', 'Dead Skin Filing', 'Foot Massage']
    },

    // --- SPA & MASSAGE ---
    {
      _id: 'srv_spa_massage',
      name: 'Massage & Spa services',
      category: 'Spa',
      duration: 60,
      price: 1499,
      discountPrice: 1299,
      description: 'Full body Swedish oil massage, head champi, and hot towel wipe down for total muscle relief and peaceful relaxation.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      features: ['Ayurvedic & Essential Oils', 'Head & Back Relief', 'Private Cozy Cabin']
    }
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


  // Default Reviews Fallback
  defaultReviews: [],

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
      {
        _id: 'med_v3',
        title: 'Couture Bridal Hair & Veil Placement',
        category: 'Bridal',
        url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226953/enrich/direct_uploads/qkdiswgerwtf7heyyamp.mp4',
        thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226953/enrich/direct_uploads/qkdiswgerwtf7heyyamp.mp4',
        duration: 45,
        description: 'Behind the scenes master styling for our royal bride featuring intricate crown braiding.',
        mediaType: 'video',
      },
      {
        _id: 'med_v4',
        title: 'Artisan Chrome Ombre Nail Process',
        category: 'Nails',
        url: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
        thumbnail: 'https://res.cloudinary.com/dzahy6r3o/video/upload/v1792226670/enrich/direct_uploads/y96ogvxcfdc6iqbqs35j.mp4',
        duration: 75,
        description: 'Watch master nail technician craft mirror-finish French ombre nails in 4K.',
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
