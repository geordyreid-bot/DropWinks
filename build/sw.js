// sw.js (Service Worker)

const CACHE_NAME = 'winkdrops-pwa-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/main.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// --- INSTALL: Precache the app shell ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
  );
});

// --- ACTIVATE: Clean up old caches ---
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// --- FETCH: Serve from cache, fallback to network ---
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }
  
  const url = new URL(event.request.url);

  // Don't cache API requests (e.g., Firebase, Google AI)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseio.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Use a Cache First, then Network strategy
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(networkResponse => {
          // If we get a valid response, cache it for future use
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});


// --- PUSH NOTIFICATIONS (Firebase Cloud Messaging) ---

// This part requires firebase-app and firebase-messaging to be imported.
// In a real build, you would use a tool like Webpack or Rollup to import these.
// For simplicity in this static build, we will use importScripts.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// 🚨 IMPORTANT: Replace with your project's Firebase configuration.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Only initialize if the config has been filled out
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle incoming messages when the app is in the background or closed
    messaging.onBackgroundMessage(payload => {
      console.log('[SW] Received background message:', payload);

      const notificationTitle = payload.notification.title || 'New Winkdrop';
      const notificationOptions = {
        body: payload.notification.body || 'You have a new message.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.error('[SW] Firebase initialization failed:', err);
  }
} else {
  console.warn("[SW] Firebase config placeholders detected. Push notifications will not work until configured.");
}