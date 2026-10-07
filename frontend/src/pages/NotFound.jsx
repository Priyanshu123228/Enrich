import { Link } from 'react-router-dom';
import { Home, Scissors, Sparkles, Phone, ArrowLeft, Search, Calendar } from 'lucide-react';
import { SALON_CONFIG } from '../config/salonConfig';
import SEO from '../components/common/SEO';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <SEO
        title="404 - Page Not Found | Enrich Ladies Beauty Parlor"
        description="The page you are looking for does not exist. Explore our salon services, bridal packages, or book an appointment at Enrich Ladies Beauty Parlor, Sikar."
        url="/404"
      />

      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Animated 404 Graphic Badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-900/20 mx-auto">
            <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">404</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-800 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
            Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Looks like this page stepped out for a makeover
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-light">
            The link you followed might be broken, or the page may have been moved. Let us help you find what you're looking for.
          </p>
        </div>

        {/* Quick Navigation Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <Link
            to="/services"
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Scissors className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-rose-700 transition-colors">
              Our Services
            </h3>
            <p className="text-[11px] text-stone-500 font-light mt-0.5">
              Hair, Skin, Makeup & Hydrafacials
            </p>
          </Link>

          <Link
            to="/book"
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors">
              Book Visit
            </h3>
            <p className="text-[11px] text-stone-500 font-light mt-0.5">
              Reserve styling session online
            </p>
          </Link>

          <Link
            to="/contact"
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors">
              Contact Desk
            </h3>
            <p className="text-[11px] text-stone-500 font-light mt-0.5">
              Sharda Heights, Sikar concierge
            </p>
          </Link>
        </div>

        {/* Primary Home Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/15 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <a
            href={SALON_CONFIG.contact.phoneTel}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm border border-stone-200 shadow-xs transition-colors"
          >
            <Phone className="w-4 h-4 text-rose-700" />
            <span>Call Salon: {SALON_CONFIG.contact.phone}</span>
          </a>
        </div>

      </div>
    </div>
  );
}
