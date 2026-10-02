import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [unverifiedState, setUnverifiedState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setUnverifiedState(null);
    setIsSubmitting(true);

    const result = await login(formData);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message);
      if (result.errors?.length) {
        setFieldErrors(result.errors);
      }
      if (result.statusCode === 403 && (result.message?.includes('verify') || result.data?.isEmailVerified === false)) {
        setUnverifiedState({
          email: result.data?.email || formData.email,
          userId: result.data?.userId
        });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-7 h-7 text-stone-800" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Client Sign In
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Sign in to manage appointments, stylist selections, and account details.
          </p>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />

        {unverifiedState && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Email verification required</span>
            </div>
            <p className="text-xs text-amber-800">
              A verification code has been dispatched to your email. Please verify to activate your account.
            </p>
            <button
              type="button"
              onClick={() => navigate('/verify-email', { state: { email: unverifiedState.email, userId: unverifiedState.userId } })}
              className="w-full mt-1 py-1.5 px-3 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Verify Email Code Now
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
              Email Address or Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com or phone"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-stone-500 hover:text-stone-900 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
              />
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Signing In..."
          >
            Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
          </LoadingButton>
        </form>

        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-100">
          Don't have an account?{' '}
          <Link to="/signup" className="text-stone-900 font-semibold hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
