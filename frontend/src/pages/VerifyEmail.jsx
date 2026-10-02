import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';
import ResendOTPButton from '../components/auth/ResendOTPButton';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendEmailOTP } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [userId] = useState(location.state?.userId || '');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg('Please provide your registered email address.');
      setFieldErrors([]);
      return;
    }
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      setFieldErrors([]);
      return;
    }

    setErrorMsg('');
    setFieldErrors([]);
    setIsSubmitting(true);

    const result = await verifyEmail({
      userId: userId || undefined,
      email: email.trim(),
      otp: otp.trim()
    });

    if (result.success) {
      setIsVerified(true);
      setSuccessMsg('Email Verified Successfully! Redirecting...');
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 1500);
    } else {
      setErrorMsg(result.message);
      if (result.errors?.length) {
        setFieldErrors(result.errors);
      }
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg('');
    setFieldErrors([]);
    const res = await resendEmailOTP({
      userId: userId || undefined,
      email: email.trim()
    });
    if (res.success) {
      setSuccessMsg(res.message || 'A new verification code has been dispatched.');
      setOtp('');
    } else {
      setErrorMsg(res.message);
      if (res.errors?.length) {
        setFieldErrors(res.errors);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
            {isVerified ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
            ) : (
              <Mail className="w-7 h-7 text-rose-600" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {isVerified ? 'Email Verified!' : 'Verify Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {isVerified
              ? 'Your account is now activated and ready.'
              : email
              ? `We sent a 6-digit verification code to ${email}`
              : 'Enter the 6-digit verification code sent to your email.'}
          </p>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />
        <AlertMessage type="success" message={successMsg} />

        {!isVerified ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!location.state?.email && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
                />
              </div>
            )}

            {/* 6-Digit OTP Boxes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 text-center uppercase tracking-wide">
                Enter 6-Digit Code
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={isSubmitting}
              />
            </div>

            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Verifying Code..."
              disabled={otp.length !== 6}
            >
              Verify OTP
            </LoadingButton>

            {/* Resend OTP Button */}
            <div className="pt-2 border-t border-stone-100">
              <ResendOTPButton
                onResend={handleResend}
                cooldownSeconds={45}
                disabled={isSubmitting}
              />
            </div>
          </form>
        ) : (
          <div className="text-center pt-4">
            <Link
              to="/profile"
              className="inline-flex items-center text-sm font-semibold text-stone-900 hover:underline"
            >
              Continue to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        )}

        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-100">
          Already verified?{' '}
          <Link to="/login" className="text-stone-900 font-semibold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
