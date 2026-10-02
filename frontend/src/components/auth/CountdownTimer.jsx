import { useState, useEffect } from 'react';

/**
 * Reusable Countdown Timer Component
 */
export default function CountdownTimer({ initialSeconds = 45, onExpire, prefix = 'Resend code in' }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  if (secondsLeft <= 0) {
    return null;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = minutes > 0 ? `${minutes}:${seconds < 10 ? '0' : ''}${seconds}` : `${seconds}s`;

  return (
    <span className="text-xs text-stone-500 font-medium">
      {prefix} <span className="font-semibold text-stone-800">{formattedTime}</span>
    </span>
  );
}
