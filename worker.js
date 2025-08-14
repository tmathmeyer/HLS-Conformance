
console.log('Service worker starting!');

self.addEventListener('fetch', (event) => {
  // Get the client that sent the request.
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
      });
    });
  });

  event.respondWith(fetch(event.request));
});

