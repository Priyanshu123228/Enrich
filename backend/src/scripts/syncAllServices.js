import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const categoriesToSync = [
  {
    name: 'Bridal',
    slug: 'bridal',
    description: 'Signature bridal makeovers, airbrush HD glow, wedding hairstyles, and full trousseau styling.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    order: 1,
    isActive: true
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Party glam, engagement makeup, permanent makeup, lash extensions, and brow mapping.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    order: 2,
    isActive: true
  },
  {
    name: 'Hair',
    slug: 'hair',
    description: 'Precision cuts, keratin smoothing, fashion hair colors, balayage, and 100% human hair extensions.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    order: 3,
    isActive: true
  },
  {
    name: 'Skin',
    slug: 'skin',
    description: 'Clinical facials, skin brightening, anti-ageing collagen therapies, and deep pore cleansing.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    order: 4,
    isActive: true
  },
  {
    name: 'Waxing',
    slug: 'waxing',
    description: 'Painless Rica Italian waxing, organic honey waxing, eyebrow threading, and smooth body grooming.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    order: 5,
    isActive: true
  },
  {
    name: 'Nails',
    slug: 'nails',
    description: 'Luxury manicures, spa pedicures, chrome extensions, gel nail art, and cuticle hydration.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    order: 6,
    isActive: true
  },
  {
    name: 'Spa',
    slug: 'spa',
    description: 'Swedish stress relief massages, herbal steam baths, full body polishing, and aromatherapy.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    order: 7,
    isActive: true
  }
];

const existingUpdates = [
  { name: 'Bridal Trial Hair & Makeup Session', price: 2499, discountPrice: 1999 },
  { name: 'Royal Bridal Glow & Makeup Package', price: 11999, discountPrice: 9999 },
  { name: 'Hydrating Oxygen Infusion Facial', price: 1499, discountPrice: 1199 },
  { name: 'Signature Deep Cleansing Facial', price: 1199, discountPrice: 899 },
  { name: '24K Gold Luxury Radiance Facial', price: 1799, discountPrice: 1499 },
  { name: 'Hydra-Oxygen Facial Therapy', price: 1299, discountPrice: 999 },
  { name: 'Evening Occasion Makeup Artistry', price: 1499, discountPrice: 1199 },
  { name: 'Red Carpet Evening Glam Makeup', price: 1999, discountPrice: 1599 },
  { name: 'Custom Cut & Blowout', price: 499, discountPrice: 399 },
  { name: 'Precision Hair Cut & Styling', price: 399, discountPrice: 299 },
  { name: 'Keratin Smoothing Therapy', price: 3499, discountPrice: 2999 },
  { name: 'Balayage & Hair Gloss Treatment', price: 2799, discountPrice: 2299 },
  { name: 'Dimensional Balayage & Gloss Finish', price: 2999, discountPrice: 2499 },
  { name: 'Structured Gel Manicure', price: 699, discountPrice: 549 },
  { name: 'Full Set Gel Extensions with Fine Art', price: 1499, discountPrice: 1199 },
  { name: 'Gel Nail Extensions & Chrome Art', price: 1299, discountPrice: 999 },
  { name: 'Aromatherapy Stress Relief Massage', price: 1499, discountPrice: 1299 }
];

const servicesToSync = [
  // --- BRIDAL & WEDDING ---
  {
    name: 'Bridal Makeup In Sikar',
    category: 'Bridal',
    duration: 150,
    price: 6999,
    discountPrice: 5999,
    description: 'Signature bridal makeover with luxury HD waterproof cosmetics, matching jewelry setting, dupatta draping, and customized lash extensions.',
    images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' }],
    features: ['HD Waterproof Makeup', 'Dupatta & Jewelry Draping', 'Premium Eyelashes', 'Hair Styling Included'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Best Bridal Makeup Artist In Sikar',
    category: 'Bridal',
    duration: 180,
    price: 9999,
    discountPrice: 8499,
    description: 'Airbrush & HD royal bridal package by our master cosmetologist. Longest-wearing flawless glow for wedding photography.',
    images: [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' }],
    features: ['Airbrush Makeup Finish', 'Pre-Bridal Skin Prep', 'Complete Bridal Accessories Setting', 'Touch-Up Kit Provided'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Bridal Hairstyle In Sikar',
    category: 'Bridal',
    duration: 60,
    price: 1999,
    discountPrice: 1699,
    description: 'Traditional rose bun, contemporary textured braids, or Hollywood waves crafted with real hair florals and accessories.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Floral Setting', 'Hair Padding & Volume', 'Long-Lasting Hold Spray'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Wedding and event preparation',
    category: 'Bridal',
    duration: 120,
    price: 3499,
    discountPrice: 2999,
    description: 'Full pre-wedding grooming package: custom D-tan, radiant facial clean-up, full waxing, and nail care for the bride and family.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['Pre-Event Glow', 'Full Body Prep', 'Complete Family Grooming'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Wedding Makeup Near Me In Sikar',
    category: 'Bridal',
    duration: 120,
    price: 5999,
    discountPrice: 4999,
    description: 'Bespoke destination & local wedding glam with custom contouring, skin hydration primer, and traditional bridal draping.',
    images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' }],
    features: ['Custom Contouring', 'Hydration Primer Base', 'Dupatta Draping'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Bridal services',
    category: 'Bridal',
    duration: 150,
    price: 7499,
    discountPrice: 6499,
    description: 'Complete luxury bridal care package: engagement makeup, mehndi & sangeet look, and final wedding day royal makeover.',
    images: [{ url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' }],
    features: ['Multi-Day Event Package', 'Personalized Consultation', 'Bridal Suite Access'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Bridal Makeup near me',
    category: 'Bridal',
    duration: 150,
    price: 6499,
    discountPrice: 5499,
    description: 'Local neighborhood bridal glam at Piprali Road, Sikar. Flawless coverage, waterproof eye makeup, and matching floral bun.',
    images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' }],
    features: ['Piprali Road Studio', 'Waterproof Formula', 'Flower Styling'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Mobile salon service',
    category: 'Bridal',
    duration: 120,
    price: 2999,
    discountPrice: 2499,
    description: 'Doorstep bridal makeup, family hair styling, and event dressing at your home or wedding venue in Sikar.',
    images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' }],
    features: ['At-Home Service', 'Full Professional Kit', 'Wedding Venue Visits'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Online beauty salon booking',
    category: 'Bridal',
    duration: 15,
    price: 99,
    discountPrice: 0,
    description: 'Instant VIP priority reservation with zero advance deposit, WhatsApp confirmation, and zero waiting time at the salon.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['Zero Advance Deposit', 'Instant WhatsApp Confirmation', 'Priority VIP Slot'],
    gender: 'all',
    isActive: true
  },

  // --- MAKEUP & OCCASION ---
  {
    name: 'Party Makeup Near me in Sikar',
    category: 'Makeup',
    duration: 60,
    price: 1499,
    discountPrice: 1299,
    description: 'HD glowing party makeup for weddings, sangeet, reception, or anniversary functions with smudge-proof eye makeup.',
    images: [{ url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' }],
    features: ['HD Foundation Finish', 'Smokey or Shimmer Eyes', 'Hairstyling Included'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Party Makeup Near me',
    category: 'Makeup',
    duration: 60,
    price: 1399,
    discountPrice: 1199,
    description: 'Express glam look for evening parties, birthdays, and festive gatherings with premium lightweight cosmetics.',
    images: [{ url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' }],
    features: ['Lightweight Finish', 'Lash Application', 'Setting Spray'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Make-up',
    category: 'Makeup',
    duration: 60,
    price: 1299,
    discountPrice: 999,
    description: 'Everyday elegance or soft glam look crafted using dermatologically tested, non-comedogenic luxury cosmetics.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Non-Comedogenic Products', 'Soft Natural Radiance', 'Custom Lip Shade'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Eyebrow beautification',
    category: 'Makeup',
    duration: 20,
    price: 99,
    discountPrice: 79,
    description: 'Hygienic threading, brow shaping, mapping, and tinted brow definition for crisp, elegant arches.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Precise Shaping', 'Painless Threading', 'Brow Calming Gel'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Eyelashes',
    category: 'Makeup',
    duration: 45,
    price: 999,
    discountPrice: 799,
    description: 'Individual cluster lashes or classic volume lash extensions for naturally dense, long, and dramatic eyes.',
    images: [{ url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' }],
    features: ['Weightless Feel', 'Waterproof Adhesive', 'Up to 3 Weeks Hold'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Permanent makeup',
    category: 'Makeup',
    duration: 90,
    price: 3999,
    discountPrice: 3499,
    description: 'Semi-permanent microblading, ombre powder brows, and natural lip blush pigments for effortless daily beauty.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Certified Pigments', 'Smudge-Proof', 'Lasts 1–2 Years'],
    gender: 'female',
    isActive: true
  },

  // --- HAIR CARE & CHEMICAL TREATMENTS ---
  {
    name: 'Keratin Treatment In Sikar',
    category: 'Hair',
    duration: 150,
    price: 2999,
    discountPrice: 2499,
    description: 'Formaldehyde-free intensive keratin smoothing therapy. Eliminates 95% frizz and leaves hair mirror-shiny and manageable.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Frizz-Free Silk Finish', 'Lasts 3–5 Months', 'Deep Protein Infusion'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Hair Color In Sikar',
    category: 'Hair',
    duration: 120,
    price: 2499,
    discountPrice: 1999,
    description: 'Ammonia-free global hair color, fashion balayage, honey blonde streaks, or gray root coverage with gloss toner.',
    images: [{ url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' }],
    features: ['Ammonia-Free', 'Bond Protection Shield', 'Vibrant Shine'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Haircut',
    category: 'Hair',
    duration: 45,
    price: 399,
    discountPrice: 299,
    description: 'Precision layered cut, feather cut, blunt bob, or split-ends trim finished with a high-volume bouncy blowdry.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['Personalized Consultation', 'Scalp Wash', 'Thermal Blowdry Finish'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Hairstyling',
    category: 'Hair',
    duration: 45,
    price: 799,
    discountPrice: 599,
    description: 'Tong curls, beach waves, straight iron finish, high ponytail, or festive half-up hairstyles with heat protection serum.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Heat Shield Protection', 'Bouncy Curls or Waves', 'Volume Root Boost'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Hair extensions',
    category: 'Hair',
    duration: 90,
    price: 4999,
    discountPrice: 3999,
    description: '100% human remy hair extensions: clip-on, micro-ring, or tape-in extensions for instant length, thickness, and volume.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['100% Remy Human Hair', 'Heat-Stylable', 'Seamless Color Blend'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Shampoo & conditioning',
    category: 'Hair',
    duration: 30,
    price: 299,
    discountPrice: 199,
    description: 'Therapeutic scalp wash with sulfate-free salon shampoo, followed by deep conditioning hair mask and blast dry.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['Relaxing Scalp Wash', 'Hydrating Hair Mask', 'Fresh Blowdry'],
    gender: 'all',
    isActive: true
  },

  // --- SKIN CARE & CLINICAL FACIALS ---
  {
    name: 'Skin Brightening Treatment In Sikar',
    category: 'Skin',
    duration: 60,
    price: 1499,
    discountPrice: 1199,
    description: 'D-tan exfoliation, vitamin C serum infusion, ultrasonic brightening peel, and whitening mask for a clean, fair radiant tone.',
    images: [{ url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80' }],
    features: ['Instant Tan Removal', 'Vitamin C Infusion', 'Long-Lasting Radiance'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Skin Brightening Treatment near me In Sikar',
    category: 'Skin',
    duration: 60,
    price: 1499,
    discountPrice: 1199,
    description: 'Express anti-pigmentation and skin de-tan therapy formulated for Rajasthan sun exposure and dry desert climate.',
    images: [{ url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80' }],
    features: ['Sun Damage Repair', 'Anti-Pigmentation Formula', 'Hydrating Peel-off Mask'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Anti Ageing Facial Sikar',
    category: 'Skin',
    duration: 75,
    price: 1899,
    discountPrice: 1599,
    description: 'Collagen-boosting microcurrent lift, hyaluronic peptide infusion, and firming mask targeting fine lines and loose skin.',
    images: [{ url: 'https://images.unsplash.com/photo-1512290900672-1f5be6f9e0eb?auto=format&fit=crop&w=800&q=80' }],
    features: ['Collagen Lift Mask', 'Skin Tightening', 'Wrinkle Softening'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Facials',
    category: 'Skin',
    duration: 60,
    price: 999,
    discountPrice: 799,
    description: 'Gold, Diamond, O3+, or Fruit facials with herbal steam, deep pore blackhead removal, face massage, and glow mask.',
    images: [{ url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80' }],
    features: ['Customized Skin Choice', 'Herbal Face Massage', 'Blackhead Removal'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Skin care',
    category: 'Skin',
    duration: 60,
    price: 1299,
    discountPrice: 999,
    description: 'Comprehensive dermatological skin checkup, dead cell exfoliation, acne reduction treatment, and deep hydration.',
    images: [{ url: 'https://images.unsplash.com/photo-1512290900672-1f5be6f9e0eb?auto=format&fit=crop&w=800&q=80' }],
    features: ['Acne & Pimple Control', 'Hydrating Hyaluronic Mist', 'Soothing Gel Finish'],
    gender: 'all',
    isActive: true
  },

  // --- WAXING & GROOMING ---
  {
    name: 'Body waxing',
    category: 'Waxing',
    duration: 60,
    price: 1199,
    discountPrice: 999,
    description: 'Full arms, full legs, underarms, and stomach waxing using premium painless Rica Italian wax or organic honey wax.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['Gentle Rica Wax', 'Tan-Free Smooth Skin', 'Post-Wax Soothing Lotion'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Waxing',
    category: 'Waxing',
    duration: 30,
    price: 499,
    discountPrice: 399,
    description: 'Arms or half legs waxing with hygienic single-use strips and temperature-controlled skin soothing wax.',
    images: [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }],
    features: ['Painless Technique', 'Single-Use Strips', 'Aloe Vera Aftercare'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Shaving',
    category: 'Waxing',
    duration: 20,
    price: 199,
    discountPrice: 149,
    description: 'Hygienic single-use dermaplaning facial razor or grooming for smooth peach-fuzz free foundation base.',
    images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' }],
    features: ['Sterilized Single-Use Blade', 'Soothing Aloe Vera', 'Flawless Base Prep'],
    gender: 'all',
    isActive: true
  },

  // --- NAILS, HANDS & FEET ---
  {
    name: 'Manicure',
    category: 'Nails',
    duration: 40,
    price: 499,
    discountPrice: 399,
    description: 'Hand soak, nail trimming, cuticle treatment, exfoliating walnut scrub, relaxing hand massage, and long-lasting polish.',
    images: [{ url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80' }],
    features: ['Deep Cuticle Care', 'Aromatherapy Hand Massage', 'Glossy Polish'],
    gender: 'all',
    isActive: true
  },
  {
    name: 'Pedicure',
    category: 'Nails',
    duration: 50,
    price: 699,
    discountPrice: 599,
    description: 'Warm foot spa with dead skin heel filing, callus softening scrub, cooling peppermint pack, and foot reflexology massage.',
    images: [{ url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80' }],
    features: ['Heel Crack Softening', 'Dead Skin Filing', 'Foot Massage'],
    gender: 'all',
    isActive: true
  },

  // --- SPA & MASSAGE ---
  {
    name: 'Massage',
    category: 'Spa',
    duration: 60,
    price: 1499,
    discountPrice: 1299,
    description: 'Full body Swedish oil massage, head champi, and hot towel wipe down for total muscle relief and peaceful relaxation.',
    images: [{ url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' }],
    features: ['Ayurvedic & Essential Oils', 'Head & Back Relief', 'Private Cozy Cabin'],
    gender: 'female',
    isActive: true
  },
  {
    name: 'Spa services',
    category: 'Spa',
    duration: 90,
    price: 1999,
    discountPrice: 1699,
    description: 'Holistic luxury body polish, warm herbal steam bath, deep tissue relaxation, and detoxifying essential oil wrap.',
    images: [{ url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' }],
    features: ['Full Body Polish', 'Herbal Steam Bath', 'Stress Relief Aromatherapy'],
    gender: 'female',
    isActive: true
  }
];

function slugify(name) {
  return name.toLowerCase().trim().replace(/[\s_-]+/g, '-').replace(/[^\w-]+/g, '');
}

async function runSync() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { dbName: 'Enrich' });
    const db = mongoose.connection.db;
    console.log('Connected to Enrich database.\n');

    // 1. Sync Categories
    console.log('=== 1. SYNCING CATEGORIES ===');
    for (const cat of categoriesToSync) {
      await db.collection('categories').updateOne(
        { name: cat.name },
        {
          $set: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            order: cat.order,
            isActive: cat.isActive,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log(` Category: ${cat.name} synced.`);
    }

    // 2. Update Existing 17 services with Indian Rupee Prices
    console.log('\n=== 2. UPDATING EXISTING CATALOG TO RUPEES ===');
    for (const upd of existingUpdates) {
      const res = await db.collection('services').updateOne(
        { name: upd.name },
        {
          $set: {
            price: upd.price,
            discountPrice: upd.discountPrice,
            updatedAt: new Date()
          }
        }
      );
      if (res.matchedCount > 0) {
        console.log(` Updated ${upd.name} -> Rs ${upd.price} (discount: Rs ${upd.discountPrice})`);
      }
    }

    // 3. Upsert All User Services
    console.log('\n=== 3. UPSERTING USER SERVICES (33 ITEMS) ===');
    let insertedCount = 0;
    let updatedCount = 0;

    for (const s of servicesToSync) {
      const slug = slugify(s.name);
      const res = await db.collection('services').updateOne(
        { name: s.name },
        {
          $set: {
            name: s.name,
            slug: slug,
            category: s.category,
            price: s.price,
            discountPrice: s.discountPrice,
            duration: s.duration,
            bufferTimeMinutes: 10,
            gender: s.gender || 'all',
            description: s.description,
            features: s.features,
            images: s.images,
            isActive: true,
            ratingAverage: 4.9,
            ratingCount: 28,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        insertedCount++;
        console.log(` [INSERTED] ${s.name} (${s.category}) - Rs ${s.price}`);
      } else {
        updatedCount++;
        console.log(` [SYNCED] ${s.name} (${s.category}) - Rs ${s.price}`);
      }
    }

    const totalCount = await db.collection('services').countDocuments();
    const categoriesCount = await db.collection('categories').countDocuments();

    console.log('\n===========================================');
    console.log(`SYNC COMPLETE:`);
    console.log(`- Total Services in Database: ${totalCount}`);
    console.log(`- Newly Inserted: ${insertedCount}`);
    console.log(`- Updated / Synced: ${updatedCount}`);
    console.log(`- Categories in Database: ${categoriesCount}`);
    console.log('===========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

runSync();

