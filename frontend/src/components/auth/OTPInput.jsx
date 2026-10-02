import { useRef, useEffect } from 'react';

/**
 * Reusable 6-digit OTP Input Component
 * Supports:
 * - Individual digit boxes
 * - Automatic focus forward movement
 * - Backspace navigation
 * - Arrow key navigation
 * - Clipboard Paste support
 * - Mobile numeric keypad support
 */
export default function OTPInput({ value = '', onChange, length = 6, disabled = false, autoFocus = true }) {
  const inputRefs = useRef([]);

  // Ensure internal array matches length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    // Take only the last character entered if user typed in a box
    const char = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');

    onChange(combined);

    // If character entered, move focus to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and delete previous
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);

    // Focus the next empty box or the last box
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-4">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border transition-all duration-200 outline-hidden ${
            digit
              ? 'border-stone-900 bg-stone-50 text-stone-900 shadow-xs'
              : 'border-stone-300 bg-white text-stone-800 focus:border-stone-800 focus:ring-2 focus:ring-stone-800/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : 'cursor-text'}`}
        />
      ))}
    </div>
  );
}
