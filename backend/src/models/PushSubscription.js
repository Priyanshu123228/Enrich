import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    phone: {
      type: String,
      trim: true,
      index: true
    },
    endpoint: {
      type: String,
      required: true,
      unique: true
    },
    keys: {
      p256dh: String,
      auth: String
    },
    userAgent: String,
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
