export const DEFAULT_COSMETIC_PLACEHOLDER = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_SALON_PLACEHOLDER = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
export const DEFAULT_AVATAR_PLACEHOLDER = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

/**
 * Universal Image & Video URL resolver
 * Handles Objects ({ url }), Strings, Cloudinary, local disk uploads (/uploads/),
 * local public assets (/images/), blob/data URLs, and ensures robust fallback.
 */
export const resolveImageUrl = (input, fallback = DEFAULT_SALON_PLACEHOLDER) => {
  if (!input) return fallback;

  let url = input;
  // If an object with .url or .secure_url was passed
  if (typeof input === 'object') {
    if (input.url) url = input.url;
    else if (input.secure_url) url = input.secure_url;
    else if (input.thumbnail) url = input.thumbnail;
    else if (Array.isArray(input) && input.length > 0) {
      return resolveImageUrl(input[0], fallback);
    } else {
      return fallback;
    }
  }

  if (typeof url !== 'string' || !url.trim()) return fallback;
  const cleanUrl = url.trim();

  // 1. Data URLs and Blob Object URLs (instant upload previews)
  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:')) return cleanUrl;

  // 2. Local public static assets (/images/..., /favicon..., /hero...)
  if (cleanUrl.startsWith('/images') || cleanUrl.startsWith('/favicon') || cleanUrl.startsWith('/hero')) {
    return cleanUrl;
  }

  // 3. Extract configured server host or fallback to localhost:5000
  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api/v1';
  const serverHost = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') || 'http://localhost:5000';

  // 4. Full HTTP / HTTPS URLs
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    if (cleanUrl.includes('localhost:5000') && serverHost && !serverHost.includes('localhost:5000')) {
      return cleanUrl.replace('http://localhost:5000', serverHost);
    }
    return cleanUrl;
  }

  // 5. Local backend uploads (/uploads/file_... or uploads/file_...)
  if (cleanUrl.startsWith('/uploads') || cleanUrl.startsWith('uploads/')) {
    const cleanPath = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    return serverHost + cleanPath;
  }

  // 6. If it's a relative path starting with /
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }

  return cleanUrl;
};

export const handleImageError = (event, fallback = DEFAULT_SALON_PLACEHOLDER) => {
  if (event?.target) {
    event.target.onerror = null;
    event.target.src = fallback;
  }
};
