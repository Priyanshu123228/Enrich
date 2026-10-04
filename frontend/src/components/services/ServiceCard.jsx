import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, ArrowRight, Calendar, Heart, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customer.service';

export default function ServiceCard({ service, onBook }) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to save your favorite salon treatments!');
      return;
    }
    setIsSaving(true);
    try {
      const res = await customerService.toggleFavorite(service._id);
      setIsSaved(res?.data?.isSaved ?? !isSaved);
    } catch {
      setIsSaved(!isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  const imageUrl =
    service.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
      
      {/* Card Header & Image */}
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-stone-100">
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-stone-900/40" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-stone-900/80 text-stone-200 backdrop-blur-xs">
              {service.category}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={isSaving}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-stone-900/70 hover:bg-stone-900 text-stone-200 hover:text-rose-400 transition-colors cursor-pointer"
            title={isSaved ? 'Saved in favorites' : 'Save to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-200'}`} />
          </button>

          {/* Duration Badge */}
          <div className="absolute bottom-3 left-3 flex items-center bg-stone-900/80 backdrop-blur-xs text-stone-200 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
            <Clock className="w-3 h-3 mr-1 text-rose-300" />
            <span>{service.duration} mins</span>
          </div>

          {/* Rating (Only shown if real ratings exist) */}
          {service.ratingCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center bg-stone-900/80 backdrop-blur-xs text-stone-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
              <span>{service.ratingAverage?.toFixed(1)} ({service.ratingCount})</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-2.5">
          <Link
            to={`/services/${service._id || service.slug}`}
            className="block group-hover:text-rose-700 transition-colors"
          >
            <h3 className="text-base font-bold font-serif text-stone-900 leading-snug line-clamp-1">
              {service.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Features Highlights */}
          {service.features && service.features.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {service.features.slice(0, 2).map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
        <div>
          {isAuthenticated ? (
            <>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-bold font-serif text-stone-900">
                  ₹{service.discountPrice > 0 ? service.discountPrice : service.price}
                </span>
                {service.discountPrice > 0 && (
                  <span className="text-xs text-stone-400 line-through">
                    ₹{service.price}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                Standard Pricing
              </span>
            </>
          ) : (
            <Link
              to="/login?redirect=/services"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200/80 transition-colors"
            >
              <Lock className="w-3 h-3 text-rose-600" />
              <span>Sign in for price</span>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/services/${service._id || service.slug}`}
            className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="View Details"
            aria-label="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={`/services/${service._id || service.slug}`}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-rose-300" />
            Book
          </Link>
        </div>
      </div>

    </div>
  );
}
