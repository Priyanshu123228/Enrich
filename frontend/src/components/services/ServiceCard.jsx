import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';
import { Clock, Star, ArrowRight, Calendar, Heart, Plus, Check, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customer.service';

export default function ServiceCard({
  service,
  isComboSelected = false,
  onToggleCombo = () => {}
}) {
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

  const rawImage =
    service.images?.[0]?.url ||
    (typeof service.images?.[0] === 'string' ? service.images[0] : '') ||
    service.image ||
    service.imageUrl ||
    '';
  const imageUrl = resolveImageUrl(rawImage, DEFAULT_SALON_PLACEHOLDER);

  const effectivePrice = service.discountPrice > 0 ? service.discountPrice : (service.price > 0 ? service.price : null);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      
      {/* Card Header & Visual Media */}
      <div>
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-900">
          <img
            src={imageUrl}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/15 to-transparent pointer-events-none" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900/85 text-stone-100 backdrop-blur-md border border-white/10 shadow-sm">
              {service.category}
            </span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={isSaving}
            className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-stone-200 hover:text-rose-400 transition-colors cursor-pointer z-10 shadow-sm"
            title={isSaved ? 'Saved in favorites' : 'Save to favorites'}
            aria-label="Toggle favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-200'}`} />
          </button>

          {/* Duration & Rating Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-200 z-10 pointer-events-none">
            <div className="flex items-center bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Clock className="w-3 h-3 mr-1 text-rose-300" />
              <span>{service.duration} mins</span>
            </div>

            {service.ratingCount > 0 && (
              <div className="flex items-center bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-bold text-amber-300">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                <span>{service.ratingAverage?.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5 space-y-2">
          <Link
            to={`/services/${service._id || service.slug}`}
            className="block group-hover:text-rose-700 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 leading-snug line-clamp-1">
              {service.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
            {service.description}
          </p>

          {/* Features Highlights */}
          {service.features && service.features.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1.5">
              {service.features.slice(0, 2).map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[11px] text-stone-600 bg-stone-100/80 px-2.5 py-0.5 rounded-full border border-stone-200/60"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 sm:p-5 pt-3 border-t border-stone-100 mt-2 space-y-3">
        {/* Service Details & Combo Selection Row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Salon Treatment
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              Consultation Available
            </span>
          </div>

          {/* Multi-Service Combo Selector Button */}
          <button
            type="button"
            onClick={() => onToggleCombo(service)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isComboSelected
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs font-bold'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/90'
            }`}
            title={isComboSelected ? 'Remove from combo selection' : 'Add to multi-service combo'}
          >
            {isComboSelected ? (
              <>
                <Check className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                <span>In Combo</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-stone-500" />
                <span>+ Combo</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons: 1-Tap Book Online & WhatsApp */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to={`/book?serviceId=${service._id}`}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-xs cursor-pointer active:scale-95"
            title="Book appointment directly"
          >
            <Calendar className="w-3.5 h-3.5 text-rose-300" />
            <span>Book Now</span>
          </Link>

          <a
            href={`https://wa.me/919667900313?text=${encodeURIComponent(
              `Hi Enrich Salon, I would like to book an appointment for "${service.name}". Please share available time slots.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
            title="Inquire or book on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
