import mongoose from 'mongoose';

const verificationOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['email_verification', 'phone_verification', 'password_reset'],
        message: '{VALUE} is not a valid OTP verification type'
      },
      required: [true, 'OTP verification type is required']
    },
    otpHash: {
      type: String,
      required: [true, 'Hashed OTP is required']
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
      index: { expires: 0 } // MongoDB TTL index to auto-remove expired documents
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly look up active OTP by user and verification type
verificationOTPSchema.index({ userId: 1, type: 1 });

export const VerificationOTP = mongoose.model('VerificationOTP', verificationOTPSchema);
