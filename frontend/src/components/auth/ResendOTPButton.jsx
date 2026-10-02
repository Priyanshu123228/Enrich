import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

/**
 * Reusable Resend OTP Button Component with integrated cooldown timer
 */
export default function ResendOTPButton({ onResend, cooldownSeconds = 45, disabled = false }) {
  const [canResend, setCanResend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [key, setKey] = useState(0); // To reset countdown timer

  const handleResendClick = async () => {
    if (!canResend || isSending || disabled) return;
    setIsSending(true);
    try {
      await onResend();
      setCanResend(false);
      setKey((prev) => prev + 1); // restart countdown
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
      <span className="text-stone-500">Didn't receive the verification code?</span>
      {!canResend ? (
        <CountdownTimer
          key={key}
          initialSeconds={cooldownSeconds}
          onExpire={() => setCanResend(true)}
          prefix="Resend OTP in"
        />
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          disabled={isSending || disabled}
          className="inline-flex items-center text-stone-900 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
        >
          {isSending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Resend OTP
            </>
          )}
        </button>
      )}
    </div>
  );
}
