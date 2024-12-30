const CACHE_NAME = 'wewash-cache-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/badge-72x72.png',
  '/assets/index.css',
  '/assets/index.js'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Mise en cache des ressources statiques
      await cache.addAll(STATIC_RESOURCES);
      // Force l'activation immédiate
      await self.skipWaiting();
    })()
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Nettoyer les anciens caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      // Prendre le contrôle immédiatement
      await self.clients.claim();
    })()
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // Stratégie "Network First, Cache Fallback"
        const networkResponse = await fetch(event.request);
        
        // Mettre en cache la réponse réussie
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // En cas d'erreur réseau, essayer le cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si la requête est pour une page HTML, retourner la page hors ligne
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(OFFLINE_URL);
        }

        // Sinon, propager l'erreur
        throw error;
      }
    })()
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data,
    actions: data.actions || [],
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Gérer les actions personnalisées
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Comportement par défaut : ouvrir l'application
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Gestion des synchronisations en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

// Gestion des mises à jour périodiques
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

// Fonctions utilitaires
async function handleNotificationAction(action, data) {
  switch (action) {
    case 'view-intervention':
      await self.clients.openWindow(`/interventions/${data.interventionId}`);
      break;
    case 'accept-intervention':
      // Logique pour accepter une intervention
      break;
    case 'reject-intervention':
      // Logique pour rejeter une intervention
      break;
  }
}

async function syncPendingOperations() {
  // Logique de synchronisation des opérations en attente
  // Cette fonction sera appelée quand la connexion est rétablie
}

async function updateCache() {
  // Mise à jour périodique du cache
  // Cette fonction sera appelée selon un planning défini
}
