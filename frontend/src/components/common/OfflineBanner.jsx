import { useState, useEffect } from 'react';
import { WifiOff, PhoneCall, RefreshCw, X } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || isDismissed) return null;

  return (
    <div className="bg-stone-900 text-stone-100 px-4 py-2 text-xs border-b border-stone-800 shadow-sm relative z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
            <WifiOff className="w-3.5 h-3.5" />
          </span>
          <span className="font-medium">
            You are currently offline. Showing cached salon schedule.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="tel:+919667900313"
            className="inline-flex items-center text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
          >
            <PhoneCall className="w-3 h-3 mr-1" />
            Desk: 96679 00313
          </a>
          <button
            onClick={() => window.location.reload()}
            className="p-1 text-stone-400 hover:text-white transition-colors"
            title="Retry Connection"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-stone-400 hover:text-white transition-colors"
            title="Dismiss Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
