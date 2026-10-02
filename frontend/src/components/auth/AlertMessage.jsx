import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Reusable Alert Message Component
 */
export default function AlertMessage({ type = 'error', message, errors = [], className = '' }) {
  const normalizedErrors = (Array.isArray(errors) ? errors : [errors])
    .map((err) => {
      if (!err) return null;
      if (typeof err === 'string') return err.trim();
      if (typeof err === 'object') return err.msg || err.message || JSON.stringify(err);
      return String(err);
    })
    .filter(Boolean);

  const displayMessage = message ? String(message).trim() : normalizedErrors[0] || '';
  const displayErrors = normalizedErrors.filter(
    (err) => err && err.toLowerCase() !== (displayMessage || '').toLowerCase()
  );

  if (!displayMessage && displayErrors.length === 0) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const styles = isError
    ? 'bg-red-50 border-red-200 text-red-800'
    : isSuccess
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-stone-50 border-stone-200 text-stone-800';

  const Icon = isError ? AlertCircle : isSuccess ? CheckCircle : Info;
  const iconColor = isError ? 'text-red-600' : isSuccess ? 'text-emerald-600' : 'text-stone-600';

  return (
    <div className={`p-4 rounded-lg border text-xs sm:text-sm flex items-start space-x-2.5 transition-all ${styles} ${className}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="space-y-1 flex-1">
        {displayMessage && <p className="font-semibold leading-snug">{displayMessage}</p>}
        {displayErrors && displayErrors.length > 0 && (
          <ul className="list-disc list-inside text-xs space-y-0.5 opacity-90 mt-1">
            {displayErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
