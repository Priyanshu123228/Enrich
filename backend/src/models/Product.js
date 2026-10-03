import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      trim: true,
      default: 'Enrich Luxury Clinic'
    },
    category: {
      type: String,
      required: [true, 'Please select a product category'],
      enum: {
        values: [
          'Skincare',
          'Haircare',
          'Makeup & Cosmetics',
          'Serums & Treatments',
          'Bridal Essentials',
          'Body & Spa',
          'Organic & Ayurvedic'
        ],
        message: '{VALUE} is not a valid cosmetic category'
      },
      default: 'Skincare',
      index: true
    },
    subcategory: {
      type: String,
      trim: true,
      default: 'General'
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Original price cannot be negative']
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 15,
      min: 0
    },
    stock: {
      type: Number,
      default: 20,
      min: 0
    },
    volume: {
      type: String,
      trim: true,
      default: '50 ml / 1.7 fl oz'
    },
    skinType: {
      type: [String],
      default: ['All Skin Types']
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: true,
      index: true
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    badge: {
      type: String,
      trim: true,
      default: ''
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    keyBenefits: {
      type: [String],
      default: []
    },
    ingredients: {
      type: [String],
      default: []
    },
    howToUse: {
      type: String,
      trim: true,
      default: 'Apply a small amount evenly on clean skin or hair. Gently massage until fully absorbed. Use daily for optimal results.'
    },
    dermatologicallyTested: {
      type: Boolean,
      default: true
    },
    crueltyFree: {
      type: Boolean,
      default: true
    },
    organicCertified: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Auto-calculate slug and discount before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  if (this.originalPrice > this.price) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discountPercent = 0;
  }

  if (this.images && this.images.length > 0 && !this.thumbnail) {
    this.thumbnail = this.images[0].url;
  }

  next();
});

// Compound Search Index
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1, price: 1 });

export const Product = mongoose.model('Product', productSchema);
export default Product;
