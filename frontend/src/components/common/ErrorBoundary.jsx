import React from 'react';
import { AlertTriangle, RotateCcw, Home, Phone } from 'lucide-react';
import { SALON_CONFIG } from '../../config/salonConfig';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for telemetry/monitoring
    console.error('[Enrich Error Boundary] Caught runtime error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full text-center bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-lg space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200/60">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-700">
                Application Notice
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Something didn't load properly
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                We encountered an unexpected glitch while loading this section. Please reload or return to the main page.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-bold text-xs shadow-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-200 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-400">
              Need immediate assistance? Call our desk at <a href={SALON_CONFIG.contact.phoneTel} className="text-rose-700 font-semibold">{SALON_CONFIG.contact.phone}</a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
