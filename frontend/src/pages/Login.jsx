import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [unverifiedState, setUnverifiedState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identifierInputRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setUnverifiedState(null);

    const cleanIdentifier = formData.email.trim();
    if (!cleanIdentifier) {
      setErrorMsg('Please enter your email address or phone number.');
      identifierInputRef.current?.focus();
      return;
    }

    if (!formData.password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    const result = await login({
      email: cleanIdentifier,
      password: formData.password
    });

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Invalid credentials. Please verify and try again.');
      if (result.errors?.length) {
        setFieldErrors(result.errors);
      }
      if (result.statusCode === 403 && (result.message?.includes('verify') || result.data?.isEmailVerified === false)) {
        setUnverifiedState({
          email: result.data?.email || cleanIdentifier,
          userId: result.data?.userId
        });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full bg-white p-6 sm:p-9 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-13 h-13 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mx-auto mb-2 border border-stone-200/60 shadow-2xs">
            <Lock className="w-6 h-6 text-stone-800" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Client Sign In
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-sans">
            Sign in to manage appointments, stylist selections, and account details.
          </p>
        </div>

        {/* Google Authentication Option */}
        <div className="space-y-4">
          <GoogleAuthButton
            mode="signin"
            onError={(msg) => setErrorMsg(msg)}
            onSwitchToEmail={() => identifierInputRef.current?.focus()}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-xs text-stone-400 uppercase tracking-wider shrink-0 font-medium">
              or continue with email
            </span>
            <div className="border-t border-stone-200 w-full" />
          </div>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />

        {unverifiedState && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Email verification required</span>
            </div>
            <p className="text-xs text-amber-800">
              A verification code has been dispatched to your email. Please verify to activate your account.
            </p>
            <button
              type="button"
              onClick={() => navigate('/verify-email', { state: { email: unverifiedState.email, userId: unverifiedState.userId } })}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Verify Email Code Now
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
              Email Address or Phone <span className="text-rose-800">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                ref={identifierInputRef}
                type="text"
                required
                disabled={isSubmitting}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com or 10-digit phone"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800/15 focus:border-rose-800 transition-colors disabled:bg-stone-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Password <span className="text-rose-800">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-stone-500 hover:text-rose-900 hover:underline font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800/15 focus:border-rose-800 transition-colors disabled:bg-stone-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Signing In..."
            className="h-11 mt-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs"
          >
            Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
          </LoadingButton>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-100">
          Don't have an account?{' '}
          <Link to="/signup" className="text-stone-900 hover:text-rose-900 font-semibold hover:underline transition-colors">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
