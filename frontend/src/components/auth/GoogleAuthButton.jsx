import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

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
 * Direct On-Page Official Google Authentication.
 * Renders Google's official Sign In with Google button directly into the card.
 * Clicking it immediately opens Google's standard secure popup dialog.
 * ZERO intermediate modal dialogs!
 */
export default function GoogleAuthButton({
  mode = 'signin', // 'signin' or 'signup'
  onSuccess,
  onError,
  className = '',
  redirectTo
}) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isGisReady, setIsGisReady] = useState(false);
  const [inlineError, setInlineError] = useState('');

  const googleBtnContainerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId &&
    googleClientId.trim().length > 0 &&
    !googleClientId.includes('placeholder') &&
    !googleClientId.includes('your-google-client-id')
  );

  const from = redirectTo || location.state?.from?.pathname || '/';
  const actionText = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  // 1. Handle authentic Google credential returned from the popup
  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setInlineError('Google authentication was cancelled or returned no credential.');
      onError?.('Google authentication returned no credential.');
      return;
    }

    setIsVerifying(true);
    setInlineError('');

    try {
      const result = await googleLogin({ credential: response.credential });

      if (result.success) {
        if (onSuccess) onSuccess(result.user);
        navigate(from, { replace: true });
      } else {
        setIsVerifying(false);
        const errMsg = result.message || 'Google authentication failed. Please try again.';
        setInlineError(errMsg);
        onError?.(errMsg);
      }
    } catch (err) {
      setIsVerifying(false);
      const errMsg = err.message || 'Failed to authenticate with Google.';
      setInlineError(errMsg);
      onError?.(errMsg);
    }
  };

  // 2. Initialize Google Identity Services and render official button directly on card
  useEffect(() => {
    if (!isGoogleConfigured) return;

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId);

    const initAndRender = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          // Cancel any lingering browser One Tap prompt
          if (typeof window.google.accounts.id.cancel === 'function') {
            window.google.accounts.id.cancel();
          }

          // Initialize GIS
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render Google's official compliant button DIRECTLY into the card
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 380
          });

          setIsGisReady(true);
        } catch (err) {
          console.warn('GIS button render warning:', err);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initAndRender;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initAndRender();
    }
  }, [googleClientId, isGoogleConfigured, mode]);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Real-time verifying loader */}
      {isVerifying && (
        <div className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold animate-pulse border border-stone-200">
          <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
          <span>Signing in with Google...</span>
        </div>
      )}

      {/* Official Google Button Mounting Container (Direct 1-Click Action) */}
      <div
        style={{ display: isVerifying ? 'none' : 'block' }}
        className="w-full"
      >
        <div
          ref={googleBtnContainerRef}
          className="w-full flex items-center justify-center min-h-[44px]"
        />

        {/* Fallback button shown only if Google Identity Services is still loading or unconfigured */}
        {!isGisReady && !isVerifying && (
          <button
            type="button"
            disabled={!isGoogleConfigured}
            onClick={() => {
              if (!isGoogleConfigured) {
                setInlineError('Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend/.env.');
              }
            }}
            className="w-full h-11 flex items-center justify-center gap-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <GoogleGLogo className="w-5 h-5 shrink-0" />
            <span>{actionText}</span>
          </button>
        )}
      </div>

      {/* Inline feedback if Google fails or is unconfigured */}
      {inlineError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{inlineError}</span>
        </div>
      )}
    </div>
  );
}
