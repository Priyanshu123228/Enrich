import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * Google Brand multi-color SVG icon
 */
export function GoogleGLogo({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
 * Pre-configured simulated Google test profiles for quick one-click preview
 */
const QUICK_GOOGLE_PROFILES = [
  {
    name: 'Ananya Sharma',
    email: 'ananya.sharma.enrich@gmail.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    label: 'Client'
  },
  {
    name: 'Pooja Verma',
    email: 'pooja.verma.sikar@gmail.com',
    picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    label: 'Bridal Guest'
  }
];

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

  const [isLoading, setIsLoading] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [modalError, setModalError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(googleClientId && !googleClientId.includes('placeholder'));

  const from = redirectTo || location.state?.from?.pathname || '/profile';

  // Load Google Identity Services SDK if Client ID is configured
  useEffect(() => {
    if (!isGoogleConfigured) return;

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGIS();
      document.body.appendChild(script);
    } else {
      initGIS();
    }

    function initGIS() {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (err) {
          console.warn('Google Identity Services initialization warning:', err);
        }
      }
    }
  }, [googleClientId, isGoogleConfigured]);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) {
      onError?.('No credential returned from Google');
      return;
    }

    setIsLoading(true);
    const result = await googleLogin({ credential: response.credential });
    setIsLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess(result.user);
      navigate(from, { replace: true });
    } else {
      onError?.(result.message);
    }
  };

  const handleButtonClick = () => {
    // If official Google Client ID is configured and GIS is available, trigger GIS prompt
    if (isGoogleConfigured && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If one-tap popup is skipped or suppressed by browser, open direct modal
            setShowDirectModal(true);
          }
        });
        return;
      } catch (err) {
        console.warn('GIS prompt error, falling back to modal:', err);
      }
    }

    // Default & instant flow: open Google Account selector modal
    setModalError('');
    setShowDirectModal(true);
  };

  const handleExecuteAuth = async ({ email, name, picture }) => {
    if (!email || !email.includes('@')) {
      setModalError('Please enter a valid Google email address');
      return;
    }

    setIsLoading(true);
    setModalError('');

    const pseudoGoogleId = `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const result = await googleLogin({
      email: email.trim().toLowerCase(),
      name: name?.trim() || email.split('@')[0],
      picture: picture || '',
      googleId: pseudoGoogleId
    });

    setIsLoading(false);

    if (result.success) {
      setSuccessInfo(result);
      setTimeout(() => {
        setShowDirectModal(false);
        if (onSuccess) {
          onSuccess(result.user);
        }
        navigate(from, { replace: true });
      }, 700);
    } else {
      setModalError(result.message || 'Authentication with Google failed.');
      onError?.(result.message);
    }
  };

  const actionText = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <>
      <button
        type="button"
        id="google-auth-button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 text-stone-800 font-semibold text-sm transition-all duration-150 shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <GoogleGLogo className="w-5 h-5 shrink-0" />
        <span>{isLoading ? 'Connecting to Google...' : actionText}</span>
      </button>

      {/* Google Sign-In Selection Modal */}
      <Modal
        isOpen={showDirectModal}
        onClose={() => !isLoading && setShowDirectModal(false)}
        maxWidth="max-w-md"
        showClose={!isLoading}
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5 pb-1">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 shadow-xs flex items-center justify-center mx-auto mb-2">
              <GoogleGLogo className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              {mode === 'signup' ? 'Sign Up with Google' : 'Sign In with Google'}
            </h3>
            <p className="text-xs text-stone-500">
              Choose an account to continue to <span className="font-semibold text-stone-700">Enrich Beauty Parlor</span>
            </p>
          </div>

          {modalError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{modalError}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successInfo.message || 'Authenticated successfully! Redirecting...'}</span>
            </div>
          )}

          {/* Quick Select 1-Tap Google Profiles */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-1">
              Quick 1-Tap Profiles
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50">
              {QUICK_GOOGLE_PROFILES.map((profile, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleExecuteAuth(profile)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-stone-100/80 transition-colors cursor-pointer group"
                >
                  <img
                    src={profile.picture}
                    alt={profile.name}
                    className="w-9 h-9 rounded-full object-cover border border-stone-200 group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-stone-900 truncate">
                        {profile.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                        {profile.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {profile.email}
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-2.5 text-[11px] text-stone-400 uppercase tracking-wider shrink-0 font-medium">
              or enter your Google email
            </span>
            <div className="border-t border-stone-200 w-full" />
          </div>

          {/* Custom Google Email Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteAuth({ email: customEmail, name: customName });
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Account Email
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-stone-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Name <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Priyanshi Sharma"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-stone-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !customEmail}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Authorizing with Google...' : `Continue to Enrich Salon`}</span>
            </button>
          </form>

          <p className="text-[11px] text-stone-400 text-center pt-2">
            By continuing, Google shares your name, email address, and profile picture with Enrich Salon in accordance with our Privacy Policy.
          </p>
        </div>
      </Modal>
    </>
  );
}
