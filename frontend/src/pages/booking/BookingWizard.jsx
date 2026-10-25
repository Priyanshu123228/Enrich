import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { serviceService } from '../../services/service.service';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';
import { getHinglishSubtitle, CATEGORY_HINGLISH_GUIDE } from '../../utils/hinglishSubtitles';
import { MessageCircle, Search, Phone, MapPin, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { SALON_CONFIG } from '../../config/salonConfig';

/**
 * Simplified 1-Step Booking on WhatsApp
 * 
 * Local customer-first design for Sikar:
 * 1. 1-Tap WhatsApp & Call at top
 * 2. Hinglish subtitles explaining every treatment in simple words
 * 3. Transparent pricing
 * 4. Tap any service -> redirects immediately to WhatsApp with pre-filled message!
 */
export default function BookingWizard() {
  const [searchParams] = useSearchParams();
  const preSelectedServiceId = searchParams.get('serviceId') || searchParams.get('service');
  const promoCode = searchParams.get('promo');

  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    preSelectedServiceId?.toLowerCase() === 'bridal' ? 'Bridal' : 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['All', 'Hair', 'Skin', 'Makeup', 'Nails', 'Bridal'];

  // Load services list
  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await serviceService.getServices({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined
        });
        if (isMounted && res?.data?.services) {
          setServices(res.data.services);
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Unable to load services. Please book directly on WhatsApp.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  // If a pre-selected service was passed in query, find it
  const preSelectedService = services.find(
    (s) => s._id === preSelectedServiceId || s.slug === preSelectedServiceId
  );

  const getWhatsAppUrl = (serviceName) => {
    let target = serviceName;
    if (!target && preSelectedServiceId?.toLowerCase() === 'bridal') {
      target = 'Bridal Makeup';
    }
    let msg = `Namaste Enrich Salon! I would like to book an appointment`;
    if (target) {
      msg += ` for "${target}"`;
    }
    if (promoCode) {
      msg += ` using offer code: ${promoCode}`;
    }
    msg += `. Please let me know available time slots.`;
    return `https://wa.me/919667900313?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <SEO
        title="Book on WhatsApp | Enrich Beauty Parlour Sikar"
        description="Quick 1-tap WhatsApp appointment booking for hair, skin, bridal, and makeup at Enrich Salon in Sikar."
        url="/book"
      />

      {/* Simplified Header with 1-Tap WhatsApp & Call */}
      <div className="text-center space-y-2 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>1-Tap Direct WhatsApp Booking</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Book Your Appointment
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-light max-w-xl mx-auto">
          Kisi lambe form ki zaroorat nahi! Niche diye kisi bhi service par tap karke sidhe WhatsApp par book karein ya direct call milayein.
        </p>

        {/* 1-Tap Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <a
            href="https://wa.me/919667900313?text=Namaste%20Enrich%20Salon!%20Mujhe%20appointment%20book%20karna%20hai."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href="tel:+919667900313"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 text-rose-300" />
            <span>Call: 96679 00313</span>
          </a>
        </div>
      </div>

      {/* Pre-Selected Service Fast-Track Banner */}
      {preSelectedService && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Selected Treatment
            </span>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
              {preSelectedService.name}
            </h2>
            <p className="text-xs text-rose-800 font-medium">
              ✨ {getHinglishSubtitle(preSelectedService)}
            </p>
          </div>

          <a
            href={getWhatsAppUrl(preSelectedService.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Book "{preSelectedService.name}" on WhatsApp</span>
          </a>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hair, facial, bridal, nails..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-rose-700 text-xs sm:text-sm shadow-2xs"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-700 text-white shadow-xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hinglish Category Subtitle Banner */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80">
            ✨ {CATEGORY_HINGLISH_GUIDE[selectedCategory] || 'Sabhi Salon Services'}
          </span>
        </div>
      </div>

      {/* Services Grid: 2-column mobile, tap to book on WhatsApp */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 p-3 h-48 animate-pulse flex flex-col justify-between"
            >
              <div className="h-28 bg-stone-200 rounded-xl w-full" />
              <div className="h-6 bg-stone-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {services.map((service) => {
            const rawImage =
              service.images?.[0]?.url ||
              (typeof service.images?.[0] === 'string' ? service.images[0] : '') ||
              service.image ||
              '';
            const imageUrl = resolveImageUrl(rawImage, DEFAULT_SALON_PLACEHOLDER);
            const waLink = getWhatsAppUrl(service.name);
            const hinglishSub = getHinglishSubtitle(service);

            return (
              <div
                key={service._id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <a
                  href={waLink}
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
                  {service.category && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-white backdrop-blur-xs">
                      {service.category}
                    </span>
                  )}
                  {service.price > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-stone-900 shadow-xs backdrop-blur-xs">
                      ₹{service.discountPrice && service.discountPrice < service.price ? service.discountPrice : service.price}
                    </span>
                  )}
                </a>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-rose-700 transition-colors"
                    >
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 leading-snug">
                        {service.name}
                      </h3>
                    </a>

                    {/* Hinglish Explainer */}
                    {hinglishSub && (
                      <p className="text-[10px] text-rose-800 font-medium leading-snug line-clamp-2 bg-rose-50/80 rounded-md p-1 border border-rose-100">
                        ✨ {hinglishSub}
                      </p>
                    )}

                    {service.duration && (
                      <p className="text-[10px] text-stone-400 font-normal">
                        ⏱️ {service.duration} mins • Salon Visit
                      </p>
                    )}
                  </div>

                  {/* 1-Tap Action: Book on WhatsApp */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span className="truncate">Book on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3 max-w-md mx-auto">
          <p className="text-xs text-stone-600">
            Koi service nahi mili? Direct WhatsApp par baat karke koi bhi parlour service book karein.
          </p>
          <a
            href={getWhatsAppUrl('')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Open WhatsApp Desk</span>
          </a>
        </div>
      )}

      {/* Salon Location & Phone Assistance */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-100 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
          <span>Sharda Heights, Chandpol, Sikar • Open Daily 9:00 AM – 8:00 PM</span>
        </div>

        <a
          href="tel:+919667900313"
          className="inline-flex items-center gap-1.5 font-bold text-stone-900 hover:text-rose-700 transition-colors shrink-0"
        >
          <Phone className="w-3.5 h-3.5 text-stone-700" />
          <span>Call: +91 96679 00313</span>
        </a>
      </div>

    </div>
  );
}
