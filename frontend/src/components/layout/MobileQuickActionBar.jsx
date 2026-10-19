import { useLocation, Link } from 'react-router-dom';
import { Phone, Calendar, Sparkles } from 'lucide-react';
import { SALON_CONFIG } from '../../config/salonConfig';
import { trackContactAction } from '../../utils/analytics';

/**
 * MobileQuickActionBar
 * 
 * Sticky floating bottom bar for mobile/phone screens.
 * Provides instant access to [Call Salon] and [Book Appointment]
 * so visitors never have to scroll back up.
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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-3.5 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] transition-transform duration-200"
    >
      <div className="max-w-md mx-auto flex items-center gap-2.5">
        {/* 1. Call Salon Button */}
        <a
          href={phoneTel}
          onClick={handleCallClick}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-3.5 rounded-xl font-semibold text-xs text-stone-800 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-300/80 shadow-2xs active:scale-98 transition-all touch-manipulation select-none"
          title="Call Enrich Salon Desk"
          aria-label="Call Enrich Salon"
        >
          <div className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center shrink-0 shadow-2xs border border-stone-200/60">
            <Phone className="w-3.5 h-3.5 text-stone-800" />
          </div>
          <span className="font-bold tracking-tight">Call Salon</span>
        </a>

        {/* 2. Book Appointment Button */}
        <Link
          to="/book"
          className="flex-[1.25] inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 hover:from-rose-800 hover:to-amber-700 active:from-rose-900 active:to-amber-800 shadow-md shadow-rose-900/20 active:scale-98 transition-all touch-manipulation select-none"
          title="Book Salon Appointment Online"
          aria-label="Book Salon Appointment"
        >
          <Calendar className="w-4 h-4 text-rose-200 shrink-0" />
          <span className="tracking-tight">Book Appointment</span>
        </Link>
      </div>
    </aside>
  );
}
