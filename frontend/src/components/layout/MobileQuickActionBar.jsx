import { useLocation, Link } from 'react-router-dom';
import { Phone, Calendar } from 'lucide-react';
import { SALON_CONFIG } from '../../config/salonConfig';
import { trackContactAction } from '../../utils/analytics';

/**
 * MobileQuickActionBar
 * 
 * Compact, useful sticky bottom bar for mobile/phone screens.
 * Provides direct access to [Call Salon] and [Book Appointment]
 * with zero clutter and respects safe areas.
 */
export default function MobileQuickActionBar() {
  const location = useLocation();

  // Hide on admin console, customer dashboard, booking wizard itself, and auth screens
  const hiddenPrefixes = ['/admin', '/dashboard', '/my-appointments', '/profile'];
  const hiddenExact = [
    '/book',
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

        {/* 2. Book Now Action - Consistent Primary Brand Style */}
        <Link
          to="/book"
          className="flex-[1.4] inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl font-bold text-xs text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-sm transition-all touch-manipulation select-none"
          title="Book Salon Appointment Online"
          aria-label="Book Salon Appointment"
        >
          <Calendar className="w-4 h-4 text-white shrink-0" />
          <span>Book Appointment</span>
        </Link>
      </div>
    </aside>
  );
}
