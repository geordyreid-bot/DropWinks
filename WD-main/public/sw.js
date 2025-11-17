// sw.js

// Firebase Messaging imports
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const CACHE_NAME = 'winkdrops-pwa-v2';
const URLS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];
const ICON_DATA_URL = "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10C50 10 15 45.82 15 62.5C15 79.92 30.67 90 50 90C69.33 90 85 79.92 85 62.5C85 45.82 50 10 50 10ZM58 60C58 66 68 66 68 60Z' fill='%23000000'/%3E%3C/svg%3E";

// --- PWA Lifecycle Events ---

self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching App Shell');
      return cache.addAll(URLS_TO_PRECACHE);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- Caching Strategy: Cache First, then Network ---

self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }
  
  const url = new URL(event.request.url);

  // Exclude API calls from caching for services like Firebase and Gemini
  if (url.hostname.includes('googleapis.com')) {
    return; // Let the request go to the network
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Create a promise to fetch from the network
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we get a valid response, cache it.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Return the cached response if it exists, otherwise, wait for the network response.
        return cachedResponse || fetchPromise;
      });
    })
  );
});


// --- Firebase Cloud Messaging Setup ---

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Only initialize if config is not a placeholder
if (firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage(payload => {
      console.log('[SW] Received background message ', payload);
      const notificationTitle = payload.notification.title || 'New WinkDrop';
      const notificationOptions = {
        body: payload.notification.body || 'You have a new message.',
        icon: ICON_DATA_URL,
        badge: ICON_DATA_URL,
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.error('[SW] Firebase initialization failed.', err);
  }
} else {
  console.warn("[SW] Firebase config contains placeholders. Push notifications are disabled.");
}