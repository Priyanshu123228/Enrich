export const DEFAULT_COSMETIC_PLACEHOLDER = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_SALON_PLACEHOLDER = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
export const DEFAULT_AVATAR_PLACEHOLDER = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

/**
 * Universal Image & Video URL resolver
 * Handles Cloudinary, local disk uploads (/uploads/), local public assets (/images/),
 * blob/data URLs, and ensures fallback on invalid/missing paths.
 */
export const resolveImageUrl = (url, fallback = DEFAULT_SALON_PLACEHOLDER) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const cleanUrl = url.trim();

  // 1. Data URLs and Blob Object URLs (used for instant preview during upload)
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
    // If backend is running on a different domain or port, dynamically replace localhost:5000
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

  // 6. Return as is or prefix if relative
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
