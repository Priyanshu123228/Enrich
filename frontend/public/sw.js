/**
 * Enrich Salon Progressive Web App Service Worker
 * Version: 2.0.0
 * Features: Offline Shell, Navigation Fallback, Web Push & 2-Hour Appointment Reminders
 */

const CACHE_NAME = 'enrich-pwa-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/offline.html'
];

// Install Event - Precache App Shell & Offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first for navigation with offline.html fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API requests
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // 2. Static assets (CSS, JS, Fonts, Images)
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Default fetch
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => caches.match('/offline.html'));
    })
  );
});

// ==========================================
// PUSH NOTIFICATIONS & 2-HOUR REMINDERS
// ==========================================

// Listen for incoming Push Events
self.addEventListener('push', (event) => {
  let data = {
    title: 'Enrich Salon Reminder 💆‍♀️',
    body: 'Your appointment is coming up in 2 hours! Tap to view details.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    url: '/dashboard?tab=upcoming'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    data: data.url || '/dashboard?tab=upcoming',
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'open', title: 'View Booking' },
      { action: 'call', title: 'Call Salon' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'call') {
    clients.openWindow('tel:+919667900313');
    return;
  }

  const targetUrl = event.notification.data || '/dashboard?tab=upcoming';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message listener from client window
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REMINDER') {
    const { title, body, url } = event.data;
    self.registration.showNotification(title || 'Appointment Reminder 💆‍♀️', {
      body: body || 'Your salon appointment is coming up in 2 hours!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: url || '/dashboard?tab=upcoming',
      vibrate: [200, 100, 200]
    });
  }
});
