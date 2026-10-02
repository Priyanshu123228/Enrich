export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="h-4 bg-stone-200 rounded-md w-1/3" />
          <div className="h-6 bg-stone-200 rounded-md w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-100 rounded-md w-full" />
            <div className="h-3 bg-stone-100 rounded-md w-4/5" />
          </div>
          <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
            <div className="h-6 bg-stone-200 rounded-md w-16" />
            <div className="h-8 bg-stone-200 rounded-lg w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
      <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between">
        <div className="h-4 bg-stone-200 rounded-md w-40" />
        <div className="h-4 bg-stone-200 rounded-md w-24" />
      </div>
      <div className="divide-y divide-stone-100 p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between py-2">
            <div className="h-4 bg-stone-200 rounded-md w-1/4" />
            <div className="h-4 bg-stone-100 rounded-md w-1/5" />
            <div className="h-4 bg-stone-100 rounded-md w-1/6" />
            <div className="h-6 bg-stone-200 rounded-md w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
