import mongoose from 'mongoose';

export const SUPPORTED_PLATFORMS = [
  'instagram',
  'facebook',
  'threads',
  'youtube',
  'whatsapp',
  'tiktok',
  'google'
];

export const PLATFORM_META = {
  instagram: {
    displayName: 'Instagram',
    defaultDescription: 'Daily hair transformations, bridal reels, and skincare tips.',
    placeholderUrl: 'https://instagram.com/enrich_beauty_parlour_sikar',
    color: '#E1306C'
  },
  facebook: {
    displayName: 'Facebook',
    defaultDescription: 'Community updates, beauty workshops, and customer reviews.',
    placeholderUrl: 'https://facebook.com/enrichbeautyparlour',
    color: '#1877F2'
  },
  threads: {
    displayName: 'Threads',
    defaultDescription: 'Behind-the-scenes conversations, announcements, and salon thoughts.',
    placeholderUrl: 'https://threads.net/@enrich_beauty_parlour_sikar',
    color: '#000000'
  },
  youtube: {
    displayName: 'YouTube',
    defaultDescription: 'Full treatment walk-throughs, makeover vlogs, and beauty tutorials.',
    placeholderUrl: 'https://youtube.com/@enrichbeautyparlour',
    color: '#FF0000'
  },
  whatsapp: {
    displayName: 'WhatsApp',
    defaultDescription: 'Instant customer assistance, appointment inquiries, and bridal bookings.',
    placeholderUrl: 'https://wa.me/919667900313',
    color: '#25D366'
  },
  tiktok: {
    displayName: 'TikTok',
    defaultDescription: 'Trending styling reels, quick beauty hacks, and client reactions.',
    placeholderUrl: 'https://tiktok.com/@enrichbeautyparlour',
    color: '#000000'
  },
  google: {
    displayName: 'Google Business Profile',
    defaultDescription: 'Verified salon reviews, clinic location directions, and opening hours.',
    placeholderUrl: 'https://maps.google.com/?q=Enrich+Beauty+Parlour+and+Cosmetic+Clinic+Sikar',
    color: '#4285F4'
  }
};

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform identifier is required'],
      enum: {
        values: SUPPORTED_PLATFORMS,
        message: '{VALUE} is not a supported social platform'
      },
      unique: true,
      trim: true,
      lowercase: true
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [60, 'Display name cannot exceed 60 characters']
    },
    url: {
      type: String,
      required: [true, 'Profile URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v || typeof v !== 'string') return false;
          const trimmed = v.trim();
          if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
          try {
            const parsed = new URL(trimmed);
            return ['http:', 'https:'].includes(parsed.protocol);
          } catch (e) {
            return false;
          }
        },
        message: 'Please provide a valid http or https URL'
      }
    },
    handle: {
      type: String,
      trim: true,
      maxlength: [100, 'Handle cannot exceed 100 characters'],
      default: ''
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0,
      index: true
    },
    // Extensible configuration object for future official API/embeds integration
    embedConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const SocialLink = mongoose.model('SocialLink', socialLinkSchema);
export default SocialLink;
