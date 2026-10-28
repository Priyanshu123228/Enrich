import mongoose from 'mongoose';

const defaultWeeklySchedule = [
  { dayOfWeek: 0, dayName: 'Sunday', isWorking: false, startTime: '10:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00' },
  { dayOfWeek: 1, dayName: 'Monday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
  { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
  { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
  { dayOfWeek: 4, dayName: 'Thursday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
  { dayOfWeek: 5, dayName: 'Friday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
  { dayOfWeek: 6, dayName: 'Saturday', isWorking: true, startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00' }
];

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Staff member name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Staff email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    avatar: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
      },
      public_id: {
        type: String,
        default: ''
      }
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    experience: {
      type: Number, // In years
      required: [true, 'Experience in years is required'],
      min: [0, 'Experience cannot be negative']
    },
    specialization: [
      {
        type: String,
        trim: true
      }
    ],
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        index: true
      }
    ],
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'on_leave'],
        message: '{VALUE} is not a valid staff status'
      },
      default: 'active',
      index: true
    },

    schedule: {
      type: [
        {
          dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6
          },
          dayName: {
            type: String,
            required: true
          },
          isWorking: {
            type: Boolean,
            default: true
          },
          startTime: {
            type: String,
            default: '09:00'
          },
          endTime: {
            type: String,
            default: '19:00'
          },
          breakStartTime: {
            type: String,
            default: '13:00'
          },
          breakEndTime: {
            type: String,
            default: '14:00'
          }
        }
      ],
      default: defaultWeeklySchedule
    },

    exceptions: [
      {
        date: {
          type: String
        },
        isOff: {
          type: Boolean,
          default: true
        },
        reason: String
      }
    ],
    ratingAverage: {
      type: Number,
      default: 4.9,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 18
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export const Staff = mongoose.model('Staff', staffSchema);
