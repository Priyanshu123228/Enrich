import axios from 'axios';

/**
 * Global Axios API Client instance configured with base URL and timeouts
 */
const api = axios.create({
  baseURL: (() => {
    const env = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api/v1';
    const clean = env.replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : (clean + '/api/v1');
  })(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000,
  withCredentials: true
});

/**
 * Extract clean, human-friendly, and non-panicking error details from any API error
 */
export const extractErrorMessage = (error) => {
  // Case 1: No response received (Network disconnected, offline, timeout, server warming up, CORS)
  if (!error.response) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        message: 'You appear to be offline. Please check your internet connection and try again.',
        errors: [],
        status: 0,
        isNetworkError: true
      };
    }

    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      return {
        message: 'Connection is taking longer than usual. Please check your internet connection and try again.',
        errors: [],
        status: 408,
        isNetworkError: true
      };
    }

    if (error.code === 'ERR_CANCELED') {
      return {
        message: 'The request was cancelled.',
        errors: [],
        status: 499,
        isNetworkError: false
      };
    }

    // Friendly, reassuring message that never exposes backend URLs or server startup details
    return {
      message: 'Unable to connect to the salon service right now. Please check your internet connection or try again in a few moments.',
      errors: [],
      status: 0,
      isNetworkError: true
    };
  }

  // Case 2: Server responded with HTTP 4xx or 5xx status code
  const status = error.response.status;
  const data = error.response.data;

  let message = '';
  let errorsList = [];

  // Extract errors list if present (array or object)
  if (data && typeof data === 'object') {
    if (Array.isArray(data.errors)) {
      errorsList = data.errors
        .map((err) => {
          if (typeof err === 'string') return err;
          if (err && typeof err === 'object') return err.msg || err.message || JSON.stringify(err);
          return String(err);
        })
        .filter(Boolean);
    } else if (data.errors && typeof data.errors === 'object') {
      errorsList = Object.values(data.errors)
        .map((err) => {
          if (typeof err === 'string') return err;
          if (err && typeof err === 'object') return err.msg || err.message || JSON.stringify(err);
          return String(err);
        })
        .filter(Boolean);
    }

    // Extract primary message from data
    if (data.message && typeof data.message === 'string' && data.message.trim().length > 0) {
      message = data.message.trim();
    } else if (data.error) {
      if (typeof data.error === 'string') {
        message = data.error.trim();
      } else if (typeof data.error === 'object' && data.error.message) {
        message = data.error.message.trim();
      }
    } else if (data.error_description) {
      message = String(data.error_description).trim();
    } else if (data.details) {
      message = typeof data.details === 'string' ? data.details.trim() : JSON.stringify(data.details);
    }
  } else if (typeof data === 'string' && data.trim().length > 0) {
    if (data.includes('<html') || data.includes('<!DOCTYPE')) {
      message = 'Our services are briefly updating. Please try again shortly.';
    } else if (data.length < 300) {
      message = data.trim();
    }
  }

  // Filter out any technical backend URLs from message if present
  if (message && message.includes('http')) {
    message = message.replace(/https?:\/\/[^\s\)]+/g, '').replace(/\(\s*\)/g, '').trim();
    if (!message) {
      message = 'Unable to connect to the salon service right now. Please try again in a few moments.';
    }
  }

  // If primary message is generic validation header, enrich with specific error items
  const isGeneric =
    !message ||
    /^(validation error|validationerror|bad request|internal server error|error|failed|request failed)$/i.test(
      message.trim()
    );

  if (isGeneric && errorsList.length > 0) {
    message = errorsList.join('; ');
  } else if (!message) {
    // Status-code specific descriptive messages
    switch (status) {
      case 400:
        message = 'Invalid request. Please verify the submitted information.';
        break;
      case 401:
        message = 'Authentication required. Please sign in to continue.';
        break;
      case 403:
        message = 'Access forbidden. You do not have permission or verification is required.';
        break;
      case 404:
        message = 'The requested item or page was not found.';
        break;
      case 409:
        message = 'An account or record with this information already exists.';
        break;
      case 422:
        message = 'Unable to process the submitted data. Please check field requirements.';
        break;
      case 429:
        message = 'Too many requests. Please wait a moment before trying again.';
        break;
      case 500:
        message = 'Something went wrong on our end. Please try again in a moment.';
        break;
      case 502:
        message = 'Our salon system is currently warming up. Please try again in a few seconds.';
        break;
      case 503:
        message = 'Our salon services are briefly undergoing maintenance. Please check back in a few moments.';
        break;
      case 504:
        message = 'Connection is taking longer than expected. Please try again.';
        break;
      default:
        message = 'Something went wrong. Please try again in a moment.';
    }
  }

  return {
    message,
    errors: errorsList.length > 0 ? errorsList : [],
    status,
    isNetworkError: false,
    data: data?.data || data || null
  };
};

// Request Interceptor: Attach JWT token if available in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors cleanly & clear stale credentials on 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const extracted = extractErrorMessage(error);

    // Clear stale session on 401 Unauthorized
    if (extracted.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    const customError = new Error(extracted.message);
    customError.name = 'ApiError';
    customError.message = extracted.message;
    customError.status = extracted.status;
    customError.statusCode = extracted.status;
    customError.errors = extracted.errors;
    customError.data = extracted.data;
    customError.isNetworkError = extracted.isNetworkError;
    customError.code = error.code || null;
    customError.response = error.response;
    customError.config = error.config;

    return Promise.reject(customError);
  }
);

export default api;
