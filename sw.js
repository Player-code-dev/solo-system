const CACHE_NAME = 'solo-leveling-system-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/status.html',
  '/quests.html',
  '/ui.html',
  '/css/style.css',
  '/css/glitch.css',
  '/css/xp.css',
  '/css/status.css',
  '/js/xp.js',
  '/js/xp-effect.js',
  '/js/level.js',
  '/js/system-intro.js',
  '/js/status-engine.js',
  '/js/status-logic.js',
  '/js/penalty-system.js',
  '/js/quest-generator.js',
  '/js/storage.js',
  '/script.js',
  '/audio.js',
  '/system-data.json',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('[ServiceWorker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  console.log('[ServiceWorker] Fetch', event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          console.log('[ServiceWorker] Found in cache', event.request.url);
          return response;
        }
        
        console.log('[ServiceWorker] Fetching from network', event.request.url);
        return fetch(event.request).then(function(response) {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response as it can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              // Only cache same-origin requests
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, responseToCache);
              }
            });
          
          return response;
        }).catch(function(error) {
          console.log('[ServiceWorker] Fetch failed', error);
          
          // Return offline fallback for HTML requests
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          throw error;
        });
      })
  );
});

// Background sync for quest data
self.addEventListener('sync', function(event) {
  console.log('[ServiceWorker] Background sync', event.tag);
  
  if (event.tag === 'quest-sync') {
    event.waitUntil(syncQuestData());
  } else if (event.tag === 'daily-reset') {
    event.waitUntil(performDailyReset());
  }
});

// Push notification handler
self.addEventListener('push', function(event) {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: 'New quest available!',
    icon: '/assets/icons/icon-192.svg',
    badge: '/assets/icons/icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      url: '/quests.html'
    },
    actions: [
      {
        action: 'view',
        title: 'View Quest',
        icon: '/assets/icons/icon-192.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data.url = data.url || options.data.url;
  }
  
  event.waitUntil(
    self.registration.showNotification('Solo Leveling System', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('[ServiceWorker] Notification click', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', function(event) {
  console.log('[ServiceWorker] Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }
});

// Helper functions
function syncQuestData() {
  return new Promise((resolve) => {
    // Simulate quest data synchronization
    console.log('[ServiceWorker] Syncing quest data');
    
    // In a real app, this would sync with a server
    // For this offline app, we just resolve immediately
    setTimeout(() => {
      console.log('[ServiceWorker] Quest data synced');
      resolve();
    }, 1000);
  });
}

function performDailyReset() {
  return new Promise((resolve) => {
    console.log('[ServiceWorker] Performing daily reset');
    
    // Send message to all clients to perform daily reset
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DAILY_RESET',
          timestamp: Date.now()
        });
      });
    });
    
    resolve();
  });
}

function scheduleNotification(payload) {
  console.log('[ServiceWorker] Scheduling notification', payload);
  
  // Schedule notification for later
  setTimeout(() => {
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/assets/icons/icon-192.svg',
      badge: '/assets/icons/icon-192.svg',
      vibrate: [200, 100, 200],
      data: payload.data || {}
    });
  }, payload.delay || 0);
}

// Periodic background tasks
function setupPeriodicTasks() {
  // Schedule daily quest reset at midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow - now;
  
  setTimeout(() => {
    performDailyReset();
    // Schedule recurring daily resets
    setInterval(performDailyReset, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
}

// Initialize periodic tasks when service worker starts
setupPeriodicTasks();
