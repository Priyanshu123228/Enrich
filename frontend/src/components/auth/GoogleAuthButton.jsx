import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, ExternalLink, ShieldCheck, AlertCircle, Info, ArrowRight } from 'lucide-react';

/**
 * Authentic multi-colored Google 'G' brand vector
 */
export function GoogleGLogo({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * GoogleAuthButton Component
 * Supports genuine Google Identity Services (GIS) OAuth.
 * If OAuth client ID is not configured, provides a transparent setup modal
 * rather than accepting arbitrary emails or simulating fake logins.
 */
export default function GoogleAuthButton({
  mode = 'signin', // 'signin' or 'signup'
  onSuccess,
  onError,
  className = '',
  redirectTo,
  onSwitchToEmail
}) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const buttonRef = useRef(null);
  const modalCloseBtnRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId &&
    googleClientId.trim().length > 0 &&
    !googleClientId.includes('placeholder') &&
    !googleClientId.includes('your-google-client-id')
  );

  const from = redirectTo || location.state?.from?.pathname || '/profile';
  const actionLabel = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  // Load Google Identity Services SDK when Client ID is configured
  useEffect(() => {
    if (!isGoogleConfigured) return;

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId);

    const initializeGIS = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (err) {
          console.warn('Google Identity Services initialization warning:', err.message);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGIS;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initializeGIS();
    }
  }, [googleClientId, isGoogleConfigured]);

  // Handle authentic credential response from Google
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      onError?.('Google authentication was cancelled or returned no credential.');
      return;
    }

    setIsLoading(true);
    const result = await googleLogin({ credential: response.credential });
    setIsLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess(result.user);
      navigate(from, { replace: true });
    } else {
      onError?.(result.message || 'Google authentication failed. Please try again.');
    }
  };

  // Trigger Google Sign-In prompt or setup notice
  const handleClick = () => {
    if (isGoogleConfigured && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.info('Google One Tap not displayed, initiating standard prompt:', notification.getNotDisplayedReason?.());
          }
        });
        return;
      } catch (err) {
        console.warn('GIS prompt error:', err);
      }
    }

    // If client ID is not configured, open the configuration guidance modal
    setShowConfigModal(true);
  };

  // Keyboard and focus management for the configuration modal
  useEffect(() => {
    if (showConfigModal) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setShowConfigModal(false);
          buttonRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalCloseBtnRef.current?.focus(), 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [showConfigModal]);

  const closeModal = () => {
    setShowConfigModal(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id="google-auth-button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={actionLabel}
        className={`w-full h-11 flex items-center justify-center gap-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 text-stone-700 font-semibold text-sm transition-all duration-150 shadow-xs active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/20 focus-visible:border-stone-400 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <GoogleGLogo className="w-5 h-5 shrink-0" />
        <span>{isLoading ? 'Connecting to Google...' : actionLabel}</span>
      </button>

      {/* Accessible Google Configuration Notice Modal */}
      {showConfigModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-config-title"
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={closeModal}
          />

          {/* Centered Modal Container */}
          <div className="min-h-full flex items-center justify-center p-4 text-center">
            <div
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl border border-stone-200 transition-all animate-in zoom-in-95 duration-150 relative my-8 p-6 sm:p-7 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                    <GoogleGLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 id="google-config-title" className="font-serif font-bold text-lg text-stone-900 leading-snug">
                      Google OAuth Setup Required
                    </h3>
                    <p className="text-xs text-stone-500">
                      Enrich Beauty Parlour & Cosmetic Clinic
                    </p>
                  </div>
                </div>

                <button
                  ref={modalCloseBtnRef}
                  type="button"
                  onClick={closeModal}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informative Explanation */}
              <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1.5">
                  <div className="flex items-center space-x-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Provider Configuration Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    To maintain strict security and protect account integrity, Google authentication requires verified credentials from Google Cloud Console. Simulated or arbitrary logins are disabled.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                    Configuration Steps for Administrators:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600 pl-1">
                    <li>Create an OAuth 2.0 Web Client ID in the <strong className="text-stone-800">Google Cloud Console</strong>.</li>
                    <li>Add <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">http://localhost:5173</code> to <strong className="text-stone-800">Authorized JavaScript Origins</strong>.</li>
                    <li>Add <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">VITE_GOOGLE_CLIENT_ID</code> into <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">frontend/.env</code>.</li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    if (onSwitchToEmail) onSwitchToEmail();
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/20"
                >
                  <span>{mode === 'signup' ? 'Continue with Email Registration' : 'Continue with Email / Phone Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-2 text-center text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
