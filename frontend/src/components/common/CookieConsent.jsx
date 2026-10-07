import { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('enrich_cookie_consent');
    if (!consent) {
      // Small delay for smooth entrance after page load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('enrich_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('enrich_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 p-5 shadow-xl shadow-stone-900/10 space-y-3">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60 shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900 leading-tight">
                Cookie & Privacy Choices
              </h4>
              <span className="text-[10px] text-stone-400 font-medium">
                Enrich Beauty & Aesthetic Clinic
              </span>
            </div>
          </div>

          <button
            onClick={handleDecline}
            aria-label="Close cookie banner"
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-light">
          We use cookies and Google services to personalize your booking experience, maintain session security, and show genuine Google reviews.
          Read our{' '}
          <Link to="/privacy-policy" className="text-rose-700 font-semibold underline underline-offset-2 hover:text-rose-800">
            Privacy Policy
          </Link>.
        </p>

        <div className="pt-1 flex items-center justify-end gap-2 text-xs font-semibold">
          <button
            onClick={handleDecline}
            className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Essential Only
          </button>
          
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-bold shadow-xs transition-all active:scale-95"
          >
            Accept All
          </button>
        </div>

      </div>
    </div>
  );
}
