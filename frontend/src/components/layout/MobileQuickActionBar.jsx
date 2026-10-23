import { useLocation } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import { SALON_CONFIG } from '../../config/salonConfig';
import { trackContactAction } from '../../utils/analytics';

/**
 * MobileQuickActionBar
 * 
 * Compact, useful sticky bottom bar for mobile screens.
 * Provides direct access to:
 * 1. [Call Salon]
 * 2. [Book on WhatsApp]
 * 
 * No online calendar, no complicated date/slot selection.
 */
export default function MobileQuickActionBar() {
  const location = useLocation();

  // Hide on admin console, customer dashboard, and auth screens
  const hiddenPrefixes = ['/admin', '/dashboard', '/profile'];
  const hiddenExact = [
    '/login',
    '/signup',
    '/register',
    '/verify-email',
    '/verify-phone',
    '/forgot-password',
    '/reset-password'
  ];

  const isHidden =
    hiddenPrefixes.some((prefix) => location.pathname.startsWith(prefix)) ||
    hiddenExact.some((path) => location.pathname === path);

  if (isHidden) return null;

  const handleCallClick = () => {
    trackContactAction('phone');
  };

  const phoneTel = SALON_CONFIG?.contact?.phoneTel || 'tel:+919667900313';
  const whatsappUrl = 'https://wa.me/919667900313?text=Hi%20Enrich%20Salon,%20I%20would%20like%20to%20book%20an%20appointment.';

  return (
    <aside
      aria-label="Mobile Quick Actions"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-md px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-transform duration-200"
    >
      <div className="max-w-md mx-auto flex items-center gap-2">
        {/* 1. Call Action */}
        <a
          href={phoneTel}
          onClick={handleCallClick}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-3 rounded-xl font-bold text-xs text-stone-800 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 transition-all touch-manipulation select-none"
          title="Call Enrich Salon Desk"
          aria-label="Call Enrich Salon"
        >
          <Phone className="w-4 h-4 text-stone-700 shrink-0" />
          <span>Call Salon</span>
        </a>

        {/* 2. ONLY ONE BOOKING OPTION: Book on WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.5] inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all touch-manipulation select-none"
          title="Book Salon Appointment on WhatsApp"
          aria-label="Book on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
          <span>Book on WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}
