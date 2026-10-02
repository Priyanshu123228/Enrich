import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading Button Component
 */
export default function LoadingButton({
  children,
  loading = false,
  loadingText = 'Please wait...',
  disabled = false,
  type = 'submit',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
