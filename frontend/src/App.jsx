import OfflineBanner from './components/common/OfflineBanner';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import CookieConsent from './components/common/CookieConsent';
import ErrorBoundary from './components/common/ErrorBoundary';
import WhatsAppWidget from './components/common/WhatsAppWidget';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <OfflineBanner />
        <ScrollToTop />
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
            <CookieConsent />
            <WhatsAppWidget />
            <PWAInstallPrompt />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
