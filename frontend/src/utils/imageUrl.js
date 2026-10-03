export const DEFAULT_COSMETIC_PLACEHOLDER = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';

export const resolveImageUrl = (url, fallback = DEFAULT_COSMETIC_PLACEHOLDER) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:')) return cleanUrl;
  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api/v1';
  const serverHost = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    if (cleanUrl.includes('localhost:5000') && serverHost && !serverHost.includes('localhost:5000')) {
      return cleanUrl.replace('http://localhost:5000', serverHost);
    }
    return cleanUrl;
  }
  if (cleanUrl.startsWith('/uploads') || cleanUrl.startsWith('uploads/')) {
    const cleanPath = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    return serverHost + cleanPath;
  }
  return cleanUrl;
};

export const handleImageError = (event, fallback = DEFAULT_COSMETIC_PLACEHOLDER) => {
  if (event?.target) {
    event.target.onerror = null;
    event.target.src = fallback;
  }
};
