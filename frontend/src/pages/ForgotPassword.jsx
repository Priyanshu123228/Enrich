import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';
import LoadingButton from '../components/auth/LoadingButton';
import AlertMessage from '../components/auth/AlertMessage';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg(res.message || 'If an account exists, a 6-digit password reset code has been sent.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email.trim() } });
      }, 1500);
    } catch (error) {
      setErrorMsg(error.message || 'Unable to process password reset request.');
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
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-7 h-7 text-stone-800" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Forgot Password?
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Enter your registered email and we will send a 6-digit password reset code.
          </p>
        </div>

        {/* Alerts */}
        <AlertMessage type="error" message={errorMsg} errors={fieldErrors} />
        <AlertMessage type="success" message={successMsg} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wide">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-stone-500 text-sm"
              />
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Sending Reset Code..."
          >
            Send Reset Code <ArrowRight className="w-4 h-4 ml-1.5" />
          </LoadingButton>
        </form>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
          <Link to="/login" className="text-stone-900 font-semibold hover:underline">
            Back to Sign In
          </Link>
          <Link to="/reset-password" className="text-rose-600 font-semibold hover:underline">
            Already have a code?
          </Link>
        </div>

      </div>
    </div>
  );
}
