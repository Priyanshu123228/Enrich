import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required for payment'],
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay Order ID is required'],
      unique: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      index: true
    },
    razorpaySignature: {
      type: String
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending',
      index: true
    },
    receipt: {
      type: String
    },
    paymentMethod: {
      type: String,
      default: 'online'
    },
    failureReason: {
      type: String
    },
    refundId: {
      type: String
    },
    refundAmount: {
      type: Number
    },
    refundedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ appointment: 1, status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
