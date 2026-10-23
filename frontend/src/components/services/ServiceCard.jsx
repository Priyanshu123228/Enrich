import { Link } from 'react-router-dom';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';
import { MessageCircle } from 'lucide-react';

/**
 * ServiceCard
 * 
 * Simplified, mobile-first service card.
 * 1. Service Image
 * 2. Short Service Name
 * 3. ONLY ONE ACTION: Direct "Book on WhatsApp"
 * 
 * No online calendar, no date/slot selection.
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
    `Hi Enrich Salon, I would like to book an appointment for "${service.name}".`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      
      {/* 1. Service Image */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
        title={`Book ${service.name} on WhatsApp`}
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
      </a>

      {/* 2. Short Service Name & Quick Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-rose-700 transition-colors"
          >
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 leading-snug">
              {service.name}
            </h3>
          </a>

          {service.duration && (
            <p className="text-[11px] text-stone-500 font-medium pt-0.5">
              {service.duration} mins • Salon Service
            </p>
          )}
        </div>

        {/* 3. ONLY ONE OPTION: Book on WhatsApp */}
        <div className="pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-2xs transition-all active:scale-95 cursor-pointer select-none"
            title="Book this service on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="truncate">Book on WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
