import { Link } from 'react-router-dom';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';
import { Calendar, MessageCircle } from 'lucide-react';

/**
 * ServiceCard
 * 
 * Mobile-first, image-centric service card.
 * 1. Service Image (clean, large, real salon photo)
 * 2. Short Service Name
 * 3. Direct "Book Now" button redirecting to WhatsApp
 */
export default function ServiceCard({ service }) {
  const rawImage =
    service.images?.[0]?.url ||
    (typeof service.images?.[0] === 'string' ? service.images[0] : '') ||
    service.image ||
    service.imageUrl ||
    '';
  const imageUrl = resolveImageUrl(rawImage, DEFAULT_SALON_PLACEHOLDER);

  const whatsappUrl = `https://wa.me/919667900313?text=${encodeURIComponent(
    `Hi Enrich Salon, I would like to book an appointment for "${service.name}". Please let me know available slots.`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      
      {/* 1. Service Image */}
      <Link
        to={`/services/${service._id || service.slug}`}
        className="block relative aspect-[4/3] w-full overflow-hidden bg-stone-100"
        title={service.name}
      >
        <img
          src={imageUrl}
          alt={service.name}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
        />
        
        {/* Subtle category badge on top-left */}
        {service.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-white backdrop-blur-xs">
            {service.category}
          </span>
        )}
      </Link>

      {/* 2. Short Service Name & Quick Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <Link
            to={`/services/${service._id || service.slug}`}
            className="block hover:text-rose-700 transition-colors"
          >
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 leading-snug">
              {service.name}
            </h3>
          </Link>

          {service.duration && (
            <p className="text-[11px] text-stone-500 font-medium pt-0.5">
              {service.duration} mins • Salon Visit
            </p>
          )}
        </div>

        {/* 3. Direct "Book Now" Button (Redirects to WhatsApp) + Online Booking Option */}
        <div className="flex items-center gap-1.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-2xs transition-all active:scale-95 cursor-pointer select-none"
            title="Book this service on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="truncate">Book Now</span>
          </a>

          <Link
            to={`/book?serviceId=${service._id}`}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/80 transition-colors"
            title="Book Online via Appointment System"
            aria-label="Book Online"
          >
            <Calendar className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
