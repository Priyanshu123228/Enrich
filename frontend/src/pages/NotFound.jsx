import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 mb-2">404</h1>
      <p className="text-xl font-medium text-stone-700 mb-2">Page Not Found</p>
      <p className="text-sm text-stone-500 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-colors"
      >
        <Home className="w-4 h-4 mr-2" />
        Return to Home
      </Link>
    </div>
  );
}
