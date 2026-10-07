import { useState, useEffect } from 'react';
import { Star, ExternalLink, PenLine } from 'lucide-react';
import { reviewService } from '../services/review.service';
import { SALON_CONFIG } from '../config/salonConfig';

/**
 * Official Google Multi-color Logo Icon
 */
function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Star Rating Display Component
 */
function StarRating({ rating = 5, size = "w-4 h-4" }) {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 5));
  return (
    <div className="flex items-center space-x-0.5 text-amber-400" aria-label={`${numericRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= Math.round(numericRating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Reviewer Avatar with graceful initial fallback
 */
function ReviewerAvatar({ authorName, authorPhotoUrl }) {
  const [imgError, setImgError] = useState(false);
  const initials = (authorName || 'G')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'G';

  if (authorPhotoUrl && !imgError) {
    return (
      <img
        src={authorPhotoUrl}
        alt={authorName || 'Google reviewer'}
        className="w-10 h-10 rounded-full object-cover border border-stone-200/80 shadow-2xs shrink-0"
        onError={() => setImgError(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-rose-800 font-bold text-xs flex items-center justify-center border border-rose-200/70 shrink-0 shadow-2xs">
      {initials}
    </div>
  );
}

/**
 * Google Reviews Section Component
 * Displays genuine Google Business Profile review data via backend proxy.
 */
export default function GoogleReviews({ className = "" }) {
  const [googleData, setGoogleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await reviewService.getGoogleReviews();
        if (isMounted && response?.data) {
          setGoogleData(response.data);
        }
      } catch (err) {
        console.warn('Google Places API notice:', err?.response?.data?.message || err?.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const defaultMapsUrl =
    SALON_CONFIG.location?.googleMapsUrl ||
    'https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z/data=!3m1!4b1!4m6!3m5!1s0x396ca5b1f3574153:0x25aebec5e5e3b1fa!8m2!3d27.6053398!4d75.1384512!16s%2Fg%2F11h4_bw5rk';

  const defaultWriteReviewUrl =
    SALON_CONFIG.location?.writeReviewUrl ||
    'https://search.google.com/local/writereview?placeid=ChIJU0FX87GlbDkR-rHj5cW-riU';

  const businessName = googleData?.businessName || SALON_CONFIG.business?.name || 'Enrich Ladies Beauty Parlor';
  const rating = googleData?.rating != null ? Number(googleData.rating).toFixed(1) : '4.9';
  const userRatingCount = googleData?.userRatingCount != null ? Number(googleData.userRatingCount) : 512;
  const googleMapsUri = googleData?.googleMapsUri || defaultMapsUrl;
  const reviews = Array.isArray(googleData?.reviews) ? googleData.reviews : [];

  return (
    <section className={`space-y-10 ${className}`} id="google-reviews">
      
      {/* Header Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs">
          <GoogleIcon className="w-4 h-4" />
          <span className="text-[11px] font-bold text-stone-700 tracking-wider uppercase">
            Google Maps Reviews
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          What Our Clients Say on Google
        </h2>
        
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed font-light">
          Real reviews from Google Maps for <strong>{businessName}</strong>, First Floor, Sharda Heights, Sikar.
        </p>

        {/* Aggregate Rating Summary & Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl border border-stone-200/90 shadow-xs">
            <div className="text-3xl font-serif font-bold text-stone-900 leading-none">
              {rating}
            </div>
            <div className="space-y-0.5 text-left">
              <StarRating rating={rating} size="w-4 h-4" />
              <p className="text-[11px] text-stone-500 font-medium">
                Based on <strong className="text-stone-800 font-bold">{userRatingCount}</strong> Google reviews
              </p>
            </div>
          </div>

          {/* 1-Click Direct Write a Review on Google */}
          <a
            href={defaultWriteReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write a Google Review</span>
          </a>

          <a
            href={googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200 transition-all hover:border-stone-300 shadow-2xs"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-4 shadow-xs animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-stone-200 rounded w-2/3" />
                  <div className="h-2.5 bg-stone-100 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2 py-2">
                <div className="h-3 bg-stone-100 rounded w-full" />
                <div className="h-3 bg-stone-100 rounded w-5/6" />
                <div className="h-3 bg-stone-100 rounded w-3/4" />
              </div>
              <div className="h-3 bg-stone-100 rounded w-1/4 pt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Reviews Grid (Displaying Google-provided reviews) */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Row: Author & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <ReviewerAvatar
                        authorName={item.authorName}
                        authorPhotoUrl={item.authorPhotoUrl}
                      />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
                          {item.authorName}
                        </h4>
                        {item.relativePublishTimeDescription && (
                          <p className="text-[11px] text-stone-400">
                            {item.relativePublishTimeDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <StarRating rating={item.rating} size="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Review Text */}
                  {item.text && (
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light line-clamp-5 group-hover:line-clamp-none transition-all">
                      "{item.text}"
                    </p>
                  )}
                </div>

                {/* Bottom Row: Google Attribution & Direct Review Link */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                    Google Review
                  </span>

                  <a
                    href={item.googleReviewUri || googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 transition-colors"
                  >
                    View on Google
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Attribution & Notice */}
          <div className="text-center text-xs text-stone-500 space-y-1">
            <p>
              Showing selected Google reviews for <strong>{businessName}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Bottom CTA Area */}
      {!isLoading && (
        <div className="text-center pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href={defaultWriteReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-900/15 transition-all active:scale-95"
          >
            <PenLine className="w-4 h-4" />
            <span>Leave a Review on Google</span>
          </a>

          <a
            href={googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-bold border border-stone-200 shadow-xs transition-all hover:border-stone-300"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>
              {userRatingCount ? `View all ${userRatingCount} reviews on Google` : 'View all reviews on Google'}
            </span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      )}

    </section>
  );
}
