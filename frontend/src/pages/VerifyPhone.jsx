import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';
import ResendOTPButton from '../components/auth/ResendOTPButton';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';

export default function VerifyPhone() {
  const { user, sendPhoneOTP, verifyPhoneOTP, resendPhoneOTP, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.isPhoneVerified || false);

  const redirectTo = location.state?.from || '/book';

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone number.');
      setFieldErrors([]);
      return;
    }

    setErrorMsg('');
    setFieldErrors([]);
    setIsSending(true);

    const res = await sendPhoneOTP({ phone: phone.trim() });
    setIsSending(false);

    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(`A 6-digit verification code was sent to ${phone}`);
    } else {
      setErrorMsg(res.message);
      if (res.errors?.length) {
        setFieldErrors(res.errors);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      setFieldErrors([]);
      return;
    }

    setErrorMsg('');
    setFieldErrors([]);
    setIsVerifying(true);

    const res = await verifyPhoneOTP({ otp: otp.trim() });
    setIsVerifying(false);

    if (res.success) {
      setIsVerified(true);
      setSuccessMsg('Phone Number Verified Successfully!');
      await refreshUser();
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1500);
    } else {
      setErrorMsg(res.message);
      if (res.errors?.length) {
        setFieldErrors(res.errors);
      }
    }
  };

  const handleResend = async () => {
    setErrorMsg('');
    setFieldErrors([]);
    const res = await resendPhoneOTP({ phone: phone.trim() });
    if (res.success) {
      setSuccessMsg('A new verification code has been sent.');
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
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
            {isVerified ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
            ) : (
              <Phone className="w-7 h-7 text-amber-700" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {isVerified ? 'Phone Number Verified!' : 'Verify Phone Number'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {isVerified
              ? 'Your phone number is verified. You can now book appointments.'
              : 'Phone verification is required to confirm appointments and receive reminders.'}
          </p>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />
        <AlertMessage type="success" message={successMsg} />

        {isVerified ? (
          <div className="text-center pt-2 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Your account is fully verified for salon reservations.</span>
            </div>
            <Link
              to={redirectTo}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800"
            >
              Continue to Booking <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        ) : !otpSent ? (
          /* Step 1: Confirm / Enter Phone */
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
                Mobile Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
                />
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={isSending}
              loadingText="Sending SMS Code..."
            >
              Send Verification Code
            </LoadingButton>
          </form>
        ) : (
          /* Step 2: Enter 6-Digit SMS OTP */
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 text-center uppercase tracking-wide">
                Enter 6-Digit SMS Code
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={isVerifying}
              />
            </div>

            <LoadingButton
              type="submit"
              loading={isVerifying}
              loadingText="Verifying Code..."
              disabled={otp.length !== 6}
            >
              Verify Phone Number
            </LoadingButton>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                className="text-stone-500 hover:text-stone-800 underline"
              >
                Change Phone Number
              </button>
              <ResendOTPButton
                onResend={handleResend}
                cooldownSeconds={45}
                disabled={isVerifying}
              />
            </div>
          </form>
        )}

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          <Link to="/profile" className="text-stone-900 font-semibold hover:underline">
            Back to Client Profile
          </Link>
        </div>

      </div>
    </div>
  );
}
