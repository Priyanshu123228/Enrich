import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, X, Smartphone, Sparkles, Share } from 'lucide-react';

/**
 * PWAInstallPrompt
 * 
 * Elegant floating prompt allowing visitors to install the Enrich Salon app
 * onto their phone or desktop home screen for 1-tap bookings.
 * Supports native Android/Chrome prompt + iOS Safari "Add to Home Screen" guidance.
 */
export default function PWAInstallPrompt() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed recently (1-day cooldown)
    const dismissedAt = localStorage.getItem('enrich_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 1) {
        return;
      }
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // 4. Capture native beforeinstallprompt on Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a gentle 3.5-second delay so user can view initial page first
      setTimeout(() => {
        setIsVisible(true);
      }, 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not dismissed, show prompt after 6 seconds
    if (isAppleDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 6000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide((prev) => !prev);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    // Trigger native browser install dialog
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('enrich_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible || location.pathname.startsWith('/book')) return null;

  return (
    <aside
      aria-label="Install Enrich Salon App"
      className="fixed bottom-24 left-3.5 right-3.5 sm:left-auto sm:right-6 sm:bottom-24 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-amber-500/40 shadow-2xl shadow-stone-950/40 space-y-3">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss app install banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md border border-amber-400/50 bg-gradient-to-br from-rose-700 to-rose-900 flex items-center justify-center">
            <img
              src="/icons/icon-192x192.png"
              alt="Enrich Salon App Icon"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Salon Mobile App
              </span>
            </div>
            <h4 className="text-sm font-serif font-bold text-white leading-tight">
              Install Enrich App
            </h4>
            <p className="text-[11px] text-stone-300 font-light leading-snug">
              Fast 1-tap bookings, service catalog & offline appointment details on your phone.
            </p>
          </div>
        </div>

        {/* iOS Step-by-Step Instructions */}
        {showIOSGuide && (
          <div className="p-2.5 rounded-xl bg-white/10 text-xs text-stone-200 space-y-1.5 border border-white/10">
            <p className="font-semibold text-amber-200 flex items-center gap-1.5">
              <Share className="w-3.5 h-3.5" />
              How to install on iPhone/iPad:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-stone-300">
              <li>Tap the <strong>Share</strong> icon at bottom of Safari</li>
              <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
              <li>Tap <strong>Add</strong> in the top-right corner</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? (showIOSGuide ? 'Hide Instructions' : 'How to Install on iPhone') : 'Install App'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </aside>
  );
}
