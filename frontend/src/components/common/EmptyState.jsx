import { Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are currently no records to display.',
  actionText,
  actionLink,
  onAction,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-xl border border-stone-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6 shadow-xs ${className}`}>
      <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-4 border border-stone-200">
        <Icon className="w-6 h-6 text-stone-700" />
      </div>
      <h3 className="text-base font-serif font-bold text-stone-900 mb-1">{title}</h3>
      <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed mb-6">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="btn-primary"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </button>
      )}
    </div>
  );
}
