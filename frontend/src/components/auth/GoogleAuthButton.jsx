import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, AlertCircle, ArrowRight, Loader2, Lock, CheckCircle2 } from 'lucide-react';

/**
 * Authentic multi-colored Google 'G' brand vector logo
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
 * 
 * Interactivity:
 * Clicking the button opens a centered Enrich modal within the website viewport.
 * It intentionally NEVER calls `google.accounts.id.prompt()` to prevent the detached
 * browser-managed One Tap prompt from appearing in the top-right corner.
 * 
 * Inside the centered modal, Google's official Sign in with Google button is rendered,
 * triggering Google's standard secure popup dialog when clicked.
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGisLoaded, setIsGisLoaded] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  const triggerButtonRef = useRef(null);
  const modalCloseBtnRef = useRef(null);
  const googleBtnContainerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId &&
    googleClientId.trim().length > 0 &&
    !googleClientId.includes('placeholder') &&
    !googleClientId.includes('your-google-client-id')
  );

  const from = redirectTo || location.state?.from?.pathname || '/profile';
  const actionLabel = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';
  const modalTitle = mode === 'signup' ? 'Sign Up with Google' : 'Sign In with Google';

  // 1. Load Google Identity Services SDK once on mount
  useEffect(() => {
    if (!isGoogleConfigured) return;

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId);

    const handleGisLoaded = () => {
      setIsGisLoaded(true);
      if (window.google?.accounts?.id) {
        try {
          // Initialize GIS with Client ID and callback.
          // IMPORTANT: Do NOT call google.accounts.id.prompt() anywhere!
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (err) {
          console.warn('GIS initialization notice:', err.message);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = handleGisLoaded;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      handleGisLoaded();
    }
  }, [googleClientId, isGoogleConfigured]);

  // 2. Handle authentic credential response returned from Google's popup
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setAuthError('Google sign-in was cancelled or returned no credential. Please try again.');
      onError?.('Google authentication returned no credential.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const result = await googleLogin({ credential: response.credential });

      if (result.success) {
        setAuthSuccess(true);
        if (onSuccess) onSuccess(result.user);
        setTimeout(() => {
          setIsModalOpen(false);
          navigate(from, { replace: true });
        }, 700);
      } else {
        setIsVerifying(false);
        const errMsg = result.message || 'Google authentication failed. Please try again.';
        setAuthError(errMsg);
        onError?.(errMsg);
      }
    } catch (err) {
      setIsVerifying(false);
      const errMsg = err.message || 'Unable to complete Google authentication.';
      setAuthError(errMsg);
      onError?.(errMsg);
    }
  };

  // 3. Render Google's official Sign In button inside the modal whenever modal opens
  useEffect(() => {
    if (!isModalOpen) return;

    setAuthError('');
    setAuthSuccess(false);
    setIsVerifying(false);

    if (isGoogleConfigured && window.google?.accounts?.id && googleBtnContainerRef.current) {
      try {
        // Cancel any lingering browser One Tap prompt
        if (typeof window.google.accounts.id.cancel === 'function') {
          window.google.accounts.id.cancel();
        }

        // Clear container and render official Google button
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 320
        });
      } catch (err) {
        console.warn('Error rendering Google button in modal:', err);
      }
    }
  }, [isModalOpen, isGoogleConfigured, mode, isGisLoaded]);

  // 4. Modal keyboard and background scroll management
  useEffect(() => {
    if (isModalOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isVerifying) {
          closeModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalCloseBtnRef.current?.focus(), 60);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isModalOpen, isVerifying]);

  const openModal = () => {
    // Explicitly cancel any background One Tap prompt before opening the modal
    if (window.google?.accounts?.id && typeof window.google.accounts.id.cancel === 'function') {
      window.google.accounts.id.cancel();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isVerifying) return; // Prevent closing mid-verification
    setIsModalOpen(false);
    triggerButtonRef.current?.focus();
  };

  return (
    <>
      {/* Primary Trigger Button on Signup / Login Card */}
      <button
        ref={triggerButtonRef}
        type="button"
        id="google-auth-button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        aria-label={actionLabel}
        className={`w-full h-11 flex items-center justify-center gap-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 text-stone-700 font-semibold text-sm transition-all duration-150 shadow-xs active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/20 focus-visible:border-stone-400 ${className}`}
      >
        <GoogleGLogo className="w-5 h-5 shrink-0" />
        <span>{actionLabel}</span>
      </button>

      {/* Centered Enrich Google Authentication Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-auth-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={closeModal}
          />

          {/* Centered Container */}
          <div className="min-h-full flex items-center justify-center p-4 text-center">
            <div
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl border border-stone-200 transition-all animate-in zoom-in-95 duration-150 relative my-8 p-6 sm:p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <GoogleGLogo className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 id="google-auth-modal-title" className="font-serif font-bold text-xl text-stone-900 tracking-tight">
                      {modalTitle}
                    </h3>
                    <p className="text-xs text-stone-500 font-sans">
                      Enrich Beauty Parlour & Cosmetic Clinic
                    </p>
                  </div>
                </div>

                <button
                  ref={modalCloseBtnRef}
                  type="button"
                  onClick={closeModal}
                  disabled={isVerifying}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-800/20 disabled:opacity-40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Alerts */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium leading-normal">{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold leading-normal">
                    Authenticated successfully! Redirecting to your account...
                  </span>
                </div>
              )}

              {/* Scenario A: Google OAuth IS Configured */}
              {isGoogleConfigured ? (
                <div className="space-y-5">
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Connect your verified Google account to safely {mode === 'signup' ? 'create' : 'access'} your Enrich profile without managing a separate password.
                  </p>

                  {/* Interactive Button / Loading Section */}
                  <div className="py-2 flex flex-col items-center justify-center min-h-[56px] space-y-3">
                    {isVerifying ? (
                      <div className="flex flex-col items-center space-y-2 py-3">
                        <Loader2 className="w-7 h-7 animate-spin text-stone-800" />
                        <span className="text-xs font-semibold text-stone-700">
                          Verifying credentials with Enrich Salon...
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Container where Google's official Sign In button is mounted */}
                        <div
                          ref={googleBtnContainerRef}
                          className="flex justify-center w-full min-h-[44px]"
                        />

                        {!isGisLoaded && (
                          <div className="flex items-center gap-2 text-xs text-stone-500 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                            <span>Connecting to Google Identity Services...</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Trust & Security Badge */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center gap-2 text-[11px] text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-stone-700 shrink-0" />
                    <span>Official Google OAuth 2.0 • 256-Bit SSL Protected</span>
                  </div>

                  <p className="text-[11px] text-stone-400 text-center leading-normal">
                    Clicking the button opens Google's secure popup window. Only your name, email, and avatar are shared in accordance with our Privacy Policy.
                  </p>
                </div>
              ) : (
                /* Scenario B: Google OAuth is NOT configured */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-left">
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Google OAuth Setup Required</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Google Sign-In requires an active <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">frontend/.env</code>.
                    </p>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1.5 text-left bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                    <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wider">
                      Setup Steps for Administrator:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600 pl-0.5">
                      <li>Open Google Cloud Console $\rightarrow$ Credentials.</li>
                      <li>Add your domain / localhost to Authorized Origins.</li>
                      <li>Add <strong className="text-stone-800 font-mono">VITE_GOOGLE_CLIENT_ID</strong> to <strong className="text-stone-800">frontend/.env</strong>.</li>
                    </ol>
                  </div>

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
                </div>
              )}

              {/* Footer Dismiss Button */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    if (onSwitchToEmail) onSwitchToEmail();
                  }}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline transition-colors cursor-pointer"
                >
                  Use Email Instead
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
