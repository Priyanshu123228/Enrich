import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import {
  Lock,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial step: if email is passed via router state, start on Step 2 (Verify OTP)
  const initialEmail = location.state?.email || '';
  const [step, setStep] = useState(initialEmail ? 2 : 1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState(
    initialEmail ? `A 6-digit password reset code has been sent to ${initialEmail}.` : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend Countdown Timer (45s cooldown)
  const [cooldown, setCooldown] = useState(initialEmail ? 45 : 0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const startCooldown = (seconds = 45) => {
    setCooldown(seconds);
  };

  // STEP 1: Send Reset Code to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setSuccessMsg('');

    if (!email || !/^[^s@]+@[^s@]+.[^s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg(res.message || 'A 6-digit password reset code has been sent to your email.');
      setStep(2);
      startCooldown(45);
    } catch (error) {
      setErrorMsg(error.message || 'Unable to send password reset code. Please try again.');
      if (error.errors?.length) {
        setFieldErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Email address is missing. Please restart the request.');
      setStep(1);
      return;
    }

    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.verifyResetOTP({
        email: email.trim(),
        otp: otp.trim()
      });

      setResetToken(res.data?.resetToken || '');
      setSuccessMsg('Code verified successfully! Please set your new password.');
      setStep(3);
    } catch (error) {
      setErrorMsg(error.message || 'Invalid or expired verification code. Please check and try again.');
      if (error.errors?.length) {
        setFieldErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Code Handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;

    setErrorMsg('');
    setFieldErrors([]);
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg(res.message || 'A fresh 6-digit verification code has been dispatched.');
      setOtp('');
      startCooldown(45);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to resend code. Please try again.');
      if (error.errors?.length) {
        setFieldErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Create & Submit New Password (Only shown after OTP is verified!)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        resetToken,
        newPassword,
        confirmPassword
      });

      setSuccessMsg(res.message || 'Your password has been updated successfully! Redirecting to sign in...');
      setStep(4);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to update password. Please try again.');
      if (error.errors?.length) {
        setFieldErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-7">
        
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => {
              const isActive = step === s;
              const isCompleted = step > s || step === 4;
              return (
                <div key={s} className="flex items-center space-x-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isActive
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isCompleted ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-6 sm:w-10 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
                </div>
              );
            })}
          </div>
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {step === 1 && 'Step 1 of 3: Email'}
            {step === 2 && 'Step 2 of 3: Verify Code'}
            {step === 3 && 'Step 3 of 3: New Password'}
            {step === 4 && 'Complete'}
          </span>
        </div>

        {/* Header Content */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
            {step === 1 && <KeyRound className="w-7 h-7 text-rose-700" />}
            {step === 2 && <ShieldCheck className="w-7 h-7 text-rose-700" />}
            {step === 3 && <Lock className="w-7 h-7 text-rose-700" />}
            {step === 4 && <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify Reset Code'}
            {step === 3 && 'Create New Password'}
            {step === 4 && 'Password Updated!'}
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            {step === 1 && 'Enter your registered email and we will send a 6-digit verification code.'}
            {step === 2 && 'Enter the 6-digit reset code sent to your email to verify your identity.'}
            {step === 3 && 'Identity verified! Create a secure new password for your salon account.'}
            {step === 4 && 'Your password has been changed. You will be redirected to the sign in page.'}
          </p>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />
        <AlertMessage type="success" message={successMsg} />

        {/* =========================================================================
            STEP 1: ENTER EMAIL
            ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wide">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm text-stone-900 bg-stone-50/50"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Sending Reset Code..."
              className="bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-900/15"
            >
              Send Reset Code <ArrowRight className="w-4 h-4 ml-1.5" />
            </LoadingButton>
          </form>
        )}

        {/* =========================================================================
            STEP 2: ENTER & VERIFY 6-DIGIT OTP (NO PASSWORD FIELDS VISIBLE)
            ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-xl flex items-center justify-between text-xs text-stone-600">
              <div className="truncate mr-2">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Code sent to:</span>
                <span className="font-semibold text-stone-800">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs font-bold text-rose-700 hover:underline shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 6-Digit OTP Box */}
            <div className="space-y-1 text-center">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                Enter 6-Digit Code
              </label>
              <OTPInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (val.length === 6 && errorMsg) {
                    setErrorMsg('');
                  }
                }}
                length={6}
                disabled={isSubmitting}
                autoFocus={true}
              />
            </div>

            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Verifying Code..."
              disabled={otp.length !== 6}
              className="bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-900/15"
            >
              Verify Code <ArrowRight className="w-4 h-4 ml-1.5" />
            </LoadingButton>

            {/* Resend OTP Timer & Button */}
            <div className="text-center pt-1 text-xs">
              {cooldown > 0 ? (
                <span className="text-stone-400">
                  Resend code in <strong className="text-stone-700 font-mono">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="inline-flex items-center text-xs font-bold text-rose-700 hover:text-rose-800 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Resend Verification Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* =========================================================================
            STEP 3: SET NEW PASSWORD (ONLY UNLOCKED AFTER OTP IS VERIFIED)
            ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identity verified. Please set your new password below.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm text-stone-900 bg-stone-50/50"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm text-stone-900 bg-stone-50/50"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Updating Password..."
              disabled={newPassword.length < 6 || !confirmPassword}
              className="bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-900/15"
            >
              Update Password
            </LoadingButton>
          </form>
        )}

        {/* =========================================================================
            STEP 4: COMPLETE & REDIRECT
            ========================================================================= */}
        {step === 4 && (
          <div className="text-center pt-2 space-y-4">
            <Link
              to="/login"
              className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center transition-colors shadow-xs"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
          <Link to="/login" className="text-stone-900 font-bold hover:underline">
            Back to Sign In
          </Link>
          <Link to="/signup" className="text-rose-700 font-bold hover:underline">
            Create New Account
          </Link>
        </div>

      </div>
    </div>
  );
}
