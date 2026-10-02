import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Alert({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  title,
  message,
  onClose,
  className = ''
}) {
  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700'
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-700'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-700'
    },
    info: {
      bg: 'bg-stone-50 border-stone-200 text-stone-900',
      icon: Info,
      iconColor: 'text-stone-700'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div className={`rounded-xl border p-4 flex items-start space-x-3 text-xs leading-relaxed ${config.bg} ${className}`}>
      <IconComponent className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {message && <p className="opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
