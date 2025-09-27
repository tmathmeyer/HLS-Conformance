self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  console.log('Service worker installing, skipping waiting...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as the service worker is activated.
  console.log('Service worker activating, claiming clients...');
  event.waitUntil(self.clients.claim());
});

console.log('Service worker starting!');

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // For local application assets, always go to the network to avoid stale cache.
  if (requestUrl.origin === self.location.origin) {
    const path = requestUrl.pathname;
    const appFiles = [
      '/', // for index.html
      '/index.html',
      '/test_runner.html',
      '/main.js',
      '/test_runner.js',
      '/conformance.js',
      '/style.css',
      '/components/GridRenderer.js'
    ];
    if (appFiles.includes(path)) {
      // This is a request for a core application file.
      // Fetch from the network, bypassing any cache.
      event.respondWith(fetch(event.request, { cache: 'no-store' }));
      return;
    }
  }

  // The code below is for logging network requests made by the tests.
  const getTestIdFromReferrer = (referrer) => {
    if (!referrer || referrer === '') {
      return null;
    }
    try {
      const url = new URL(referrer);
      return url.searchParams.get('testId');
    } catch (e) {
      return null;
    }
  };

  const testId = getTestIdFromReferrer(event.request.referrer);

  // Broadcast the request URL to all clients.
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'network_request',
        url: event.request.url,
        testId: testId,
        timestamp: Date.now(),
      });
    });
  });

  event.respondWith(fetch(event.request));
});