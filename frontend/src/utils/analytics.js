/**
 * Privacy-friendly, lightweight Event & Analytics Tracker
 * Supports Google Analytics 4 (gtag), Google Tag Manager (dataLayer),
 * and standard CustomEvent dispatching without blocking or crashing if unconfigured.
 */

export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return;

  const payload = {
    ...params,
    timestamp: new Date().toISOString(),
    path: window.location.pathname
  };

  // Google Analytics 4 (gtag.js)
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload);
    } catch {
      // Ignore tracker error in production
    }
  }

  // Google Tag Manager / dataLayer
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({ event: eventName, ...payload });
    } catch {
      // Ignore
    }
  }

  // Local CustomEvent for any in-app listeners / monitoring
  try {
    const customEvent = new CustomEvent('enrich:analytics', {
      detail: { event: eventName, ...payload }
    });
    window.dispatchEvent(customEvent);
  } catch {
    // Ignore
  }

  // Safe developer logging in development
  if (import.meta.env.DEV) {
    console.debug(`[Analytics] 📊 ${eventName}`, payload);
  }
};

export const trackPageView = (path = window.location.pathname, title = document.title) => {
  trackEvent('page_view', { page_location: path, page_title: title });
};

// Common salon user conversion actions
export const trackBookingClick = (serviceTitle, category, price) => {
  trackEvent('booking_intent', {
    service_name: serviceTitle,
    category,
    value: price,
    currency: 'INR'
  });
};

export const trackContactAction = (channel) => {
  trackEvent('contact_channel_click', { channel });
};

export default {
  trackEvent,
  trackPageView,
  trackBookingClick,
  trackContactAction
};
