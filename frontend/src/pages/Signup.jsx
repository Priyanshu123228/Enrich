import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Check, X as XIcon, ShieldCheck } from 'lucide-react';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password rules validation
  const hasMinLength = formData.password.length >= 6;
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.replace(/\D/g, '');

    // Client-side validations
    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      nameInputRef.current?.focus();
      return;
    }

    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      emailInputRef.current?.focus();
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!hasMinLength) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);

    const result = await signup({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate('/verify-email', {
        state: {
          email: cleanEmail,
          userId: result.data?.userId,
          message: 'Account created! Please enter the 6-digit verification code sent to your email.'
        }
      });
    } else {
      setErrorMsg(result.message || 'Signup failed. Please verify your details.');
      if (result.errors?.length) {
        setFieldErrors(result.errors);
      }
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full bg-white p-6 sm:p-9 rounded-2xl border border-stone-200/90 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-13 h-13 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mx-auto mb-2 border border-stone-200/60 shadow-2xs">
            <User className="w-6 h-6 text-stone-800" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-sans">
            Join Enrich to reserve treatments, track visits, and earn client rewards.
          </p>
        </div>

        {/* Google Authentication Option */}
        <div className="space-y-4">
          <GoogleAuthButton
            mode="signup"
            onError={(msg) => setErrorMsg(msg)}
            onSwitchToEmail={() => nameInputRef.current?.focus()}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-xs text-stone-400 uppercase tracking-wider shrink-0 font-medium">
              or register with email
            </span>
            <div className="border-t border-stone-200 w-full" />
          </div>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
              Full Name <span className="text-rose-800">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                ref={nameInputRef}
                type="text"
                required
                disabled={isSubmitting}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Priyanshi Sharma"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800/15 focus:border-rose-800 transition-colors disabled:bg-stone-50"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
              Email Address <span className="text-rose-800">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                ref={emailInputRef}
                type="email"
                required
                disabled={isSubmitting}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priyanshi@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800/15 focus:border-rose-800 transition-colors disabled:bg-stone-50"
              />
            </div>
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
              Mobile Phone <span className="text-rose-800">*</span>
            </label>
            <div className="relative flex">
              <div className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-700 text-xs font-semibold">
                +91
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  disabled={isSubmitting}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9876543210"
                  className="w-full h-11 pl-9 pr-4 rounded-r-xl border border-stone-300 font-mono text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800/15 focus:border-rose-800 transition-colors disabled:bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Password <span className="text-rose-800">*</span>
              </label>
              <span className={`text-[11px] flex items-center gap-1 font-medium ${hasMinLength ? 'text-emerald-700' : 'text-stone-400'}`}>
                {hasMinLength && <Check className="w-3 h-3" />}
                Min 6 characters
              </span>
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

          {/* Confirm Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Confirm Password <span className="text-rose-800">*</span>
              </label>
              {formData.confirmPassword && (
                <span className={`text-[11px] flex items-center gap-1 font-medium ${passwordsMatch ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3 h-3" /> Passwords match
                    </>
                  ) : (
                    <>
                      <XIcon className="w-3 h-3" /> Passwords do not match
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className={`w-full h-11 pl-10 pr-11 rounded-xl border text-stone-900 text-sm focus:outline-none focus:ring-2 transition-colors disabled:bg-stone-50 ${
                  passwordMismatch
                    ? 'border-rose-400 focus:ring-rose-800/15 focus:border-rose-800'
                    : 'border-stone-300 focus:ring-rose-800/15 focus:border-rose-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Creating Account..."
            className="h-11 mt-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs"
          >
            Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
          </LoadingButton>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-100">
          Already have an account?{' '}
          <Link to="/login" className="text-stone-900 hover:text-rose-900 font-semibold hover:underline transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
