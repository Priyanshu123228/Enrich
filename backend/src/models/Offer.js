import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    offerType: {
      type: String,
      enum: ['discount', 'package', 'seasonal'],
      default: 'discount',
      index: true
    },
    code: {
      type: String,
      required: [true, 'Coupon/Promo code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be at least 1']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    validTill: {
      type: Date // Kept in sync with endDate for backwards compatibility
    },
    applicableServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      }
    ],
    isAllServices: {
      type: Boolean,
      default: true
    },
    packageServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      }
    ],
    minBookingAmount: {
      type: Number,
      default: 0
    },
    maxDiscountAmount: {
      type: Number,
      default: 1000
    },
    usageLimit: {
      type: Number,
      default: 100
    },
    usedCount: {
      type: Number,
      default: 0
    },
    bannerImage: {
      type: String,
      default: ''
    },
    badgeText: {
      type: String,
      default: 'Special Offer'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure validTill and endDate stay synced
offerSchema.pre('save', function (next) {
  if (this.endDate && !this.validTill) {
    this.validTill = this.endDate;
  } else if (this.validTill && !this.endDate) {
    this.endDate = this.validTill;
  }
  next();
});

export const Offer = mongoose.model('Offer', offerSchema);

