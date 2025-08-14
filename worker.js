
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

  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.m3u8')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            return response;
          }

          return response.text().then((text) => {
            //const modifiedManifest = `#EXT-X-COMMENT: This manifest was modified by the service worker!\n${text}`;
            const newHeaders = new Headers(response.headers);
            newHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');

            return new Response(text, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders,
            });
          });
        })
        .catch((error) => {
          console.error('Worker failed to fetch and modify manifest:', error);
          throw error;
        })
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .catch((error) => {
          console.error('Worker failed to fetch:', error);
          throw error;
        })
    );
  }
});

