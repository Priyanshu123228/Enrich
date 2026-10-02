import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
      index: true
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff ID is required'],
      index: true
    },
    date: {
      type: String, // "YYYY-MM-DD" format
      required: [true, 'Appointment date is required'],
      index: true
    },
    startTime: {
      type: String, // "HH:mm" 24h format e.g. "10:30"
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String, // "HH:mm" 24h format e.g. "11:15"
      required: [true, 'End time is required']
    },
    duration: {
      type: Number, // In minutes
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    finalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid appointment status'
      },
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending',
      index: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', 'staff']
    }
  },
  {
    timestamps: true
  }
);

// Compound Index to accelerate collision detection and staff schedule lookups
appointmentSchema.index({ staff: 1, date: 1, startTime: 1, status: 1 });
appointmentSchema.index({ customer: 1, date: 1, status: 1 });

// Database-level race-condition prevention: No two active bookings for the same stylist, date, and start time
appointmentSchema.index(
  { staff: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } }
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
