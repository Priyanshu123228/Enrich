import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Lock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit reset code.');
      return;
    }
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
        newPassword,
        confirmPassword
      });

      setIsResetComplete(true);
      setSuccessMsg(res.message || 'Password reset successfully! You can now sign in.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to reset password. Please verify the OTP.');
      if (error.errors?.length) {
        setFieldErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-sm space-y-7">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
            {isResetComplete ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
            ) : (
              <Lock className="w-7 h-7 text-rose-600" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {isResetComplete ? 'Password Updated!' : 'Set New Password'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {isResetComplete
              ? 'Your password has been changed successfully.'
              : 'Enter the 6-digit code received via email and your new password.'}
          </p>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />
        <AlertMessage type="success" message={successMsg} />

        {!isResetComplete ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
                Email Address
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
                />
              </div>
            </div>

            {/* 6-Digit OTP Box */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 text-center uppercase tracking-wide">
                6-Digit Reset Code
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 characters)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
                />
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText="Updating Password..."
              disabled={otp.length !== 6 || !newPassword || !confirmPassword}
            >
              Reset Password
            </LoadingButton>
          </form>
        ) : (
          <div className="text-center pt-3">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-semibold text-stone-900 hover:underline"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        )}

        <div className="text-center text-xs text-stone-500 pt-3 border-t border-stone-100">
          <Link to="/login" className="text-stone-900 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
