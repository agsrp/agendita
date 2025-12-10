importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// ⚠️ IMPORTANT: Access env vars is not possible here without a bundler. 
// We must use HARDCODED values or a specific build script.
// Using hardcoded values for reliability as this file is served statically.

const firebaseConfig = {
    apiKey: "AIzaSyARdu8UXyZB5ZyzRBNyd_1B3o-alzzGc08",
    authDomain: "agendita-f86bf.firebaseapp.com",
    projectId: "agendita-f86bf",
    storageBucket: "agendita-f86bf.firebasestorage.app",
    messagingSenderId: "951856875949",
    appId: "1:951856875949:web:c293fc0c3cd61d5c53f924"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Force SW to activate immediately (Crucial for iOS/PWA updates)
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing and skipping waiting...');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating and claiming clients...');
    event.waitUntil(self.clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Normalize payload data
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Nueva Notificación';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Tienes un nuevo mensaje.',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: payload.data,
        requireInteraction: true,
        tag: 'renotify',
        renotify: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
