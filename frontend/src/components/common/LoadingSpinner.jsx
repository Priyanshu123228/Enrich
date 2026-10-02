import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  label = 'Loading...',
  size = 'md',
  fullPage = false,
  className = ''
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center p-6 text-stone-500 space-y-2.5 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-stone-900`} />
      {label && <p className="text-xs font-medium tracking-wide uppercase text-stone-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
