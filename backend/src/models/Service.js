import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [1500, 'Description cannot exceed 1500 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Hair', 'Skin', 'Makeup', 'Nails', 'Spa', 'Bridal'],
        message: '{VALUE} is not a supported category'
      },
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number']
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price must be a positive number']
    },
    duration: {
      type: Number, // In minutes
      required: [true, 'Duration in minutes is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration cannot exceed 8 hours']
    },
    bufferTimeMinutes: {
      type: Number,
      default: 10,
      min: 0
    },
    gender: {
      type: String,
      enum: ['all', 'female', 'male'],
      default: 'all'
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        public_id: {
          type: String,
          default: ''
        }
      }
    ],
    features: [
      {
        type: String,
        trim: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    ratingAverage: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 12
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Generate URL-friendly slug from service name
serviceSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const Service = mongoose.model('Service', serviceSchema);
