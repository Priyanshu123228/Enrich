import mongoose from 'mongoose';

const mediaCategories = [
  // Photo categories
  'Salon Interior',
  'Salon Exterior',
  'Hair',
  'Makeup',
  'Nails',
  'Skin Care',
  'Bridal',
  'Before & After',
  'Events',
  'Offers',
  // Video categories
  'Salon Tour',
  'Hair Transformation',
  'Nail Art',
  'Customer Experience',
  'Behind the Scenes'
];

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Media title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['photo', 'video'],
        message: '{VALUE} is not a valid media type'
      },
      required: [true, 'Media type (photo/video) is required'],
      index: true
    },
    category: {
      type: String,
      enum: {
        values: mediaCategories,
        message: '{VALUE} is not a supported media category'
      },
      required: [true, 'Media category is required'],
      index: true
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    thumbnail: {
      type: String,
      trim: true
    },
    duration: {
      type: Number, // Video duration in seconds
      default: 0
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    // Optional Before & After photo pairing
    beforeAfter: {
      beforeUrl: { type: String, trim: true },
      afterUrl: { type: String, trim: true }
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

mediaSchema.index({ type: 1, category: 1, isActive: 1, displayOrder: 1 });
mediaSchema.index({ isFeatured: 1, isActive: 1, displayOrder: 1 });

export const Media = mongoose.model('Media', mediaSchema);
export { mediaCategories };
