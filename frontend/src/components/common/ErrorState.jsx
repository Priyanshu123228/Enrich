import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load content',
  message = 'An unexpected error occurred while communicating with the salon server.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`bg-rose-50/50 rounded-xl border border-rose-200/80 p-6 sm:p-8 text-center max-w-md mx-auto my-6 ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3 border border-rose-200">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-serif font-bold text-stone-900 mb-1">{title}</h3>
      <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed mb-4">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
          Try Again
        </button>
      )}
    </div>
  );
}
