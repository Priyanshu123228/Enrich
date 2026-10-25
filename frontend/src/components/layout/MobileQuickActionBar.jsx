import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Scissors,
  CalendarCheck,
  Film,
  Sparkles
} from 'lucide-react';

/**
 * MobileQuickActionBar / PWA Bottom Navigation Bar
 * 
 * High-reachability native app navigation for mobile devices & PWAs.
 * Features 5 core user journeys in the thumb reach zone:
 * 1. Home (Main hub)
 * 2. Services (Price list & salon menu)
 * 3. Book (Center highlighted CTA pill button)
 * 4. Gallery (Watch 4K Video Reels & Transformations)
 * 5. Bridal (Flagship bridal studio & looks)
 */
export default function MobileQuickActionBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide only on admin panel routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const pathname = location.pathname;
  const hash = location.hash;

  const handleHomeClick = (e) => {
    if (pathname === '/' && !hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGalleryClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('gallery');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#gallery');
      } else {
        navigate('/gallery');
      }
    }
  };

  const handleBridalClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('bridal');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#bridal');
      } else {
        navigate('/bridal');
      }
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      to: '/',
      onClick: handleHomeClick,
      isActive: pathname === '/' && !hash
    },
    {
      id: 'services',
      label: 'Services',
      icon: Scissors,
      to: '/services',
      isActive: pathname.startsWith('/services')
    },
    {
      id: 'book',
      label: 'Book',
      icon: CalendarCheck,
      to: '/book',
      isCenterCTA: true,
      isActive: pathname.startsWith('/book')
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: Film,
      to: pathname === '/' ? '#gallery' : '/gallery',
      onClick: handleGalleryClick,
      isActive: pathname.startsWith('/gallery') || (pathname === '/' && hash === '#gallery')
    },
    {
      id: 'bridal',
      label: 'Bridal',
      icon: Sparkles,
      to: pathname === '/' ? '#bridal' : '/bridal',
      onClick: handleBridalClick,
      isActive: pathname.startsWith('/bridal') || (pathname === '/' && hash === '#bridal')
    }
  ];

  return (
    <nav
      aria-label="PWA Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.35)] px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] select-none transition-transform duration-200"
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          // Special Center Highlighted Pill Button for "Book"
          if (item.isCenterCTA) {
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`relative -top-2 flex flex-col items-center justify-center px-4 py-2 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer active:scale-90 shadow-lg ${
                  active
                    ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white ring-2 ring-white/60 shadow-rose-950/60'
                    : 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white ring-2 ring-stone-950 shadow-rose-950/40 hover:scale-105'
                }`}
                aria-label="Book Appointment"
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 stroke-[2.4] shrink-0" />
                  <span className="tracking-wide text-xs">{item.label}</span>
                </div>
              </Link>
            );
          }

          // Standard Tab with Floating Pill Highlight on Active
          return (
            <Link
              key={item.id}
              to={item.to}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 ${
                active
                  ? 'bg-stone-800/95 text-rose-400 font-semibold shadow-inner ring-1 ring-stone-700/60'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 transition-transform ${
                  active ? 'stroke-[2.4] scale-110 text-rose-400' : 'stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  active ? 'font-bold text-white' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* iOS / Modern Android Home Gesture Indicator Bar */}
      <div className="w-24 h-1 bg-stone-700/50 rounded-full mx-auto mt-1 pointer-events-none" />
    </nav>
  );
}
