import { mimeTypes, codecStrings, hlsConformanceTests } from './conformance.js';

function renderMseGrid() {
  const grid = document.getElementById('mse-grid');
  const data = mimeTypes.map(mimeType => {
    return codecStrings.map(codec => {
      const fullType = `${mimeType}; codecs="${codec}"`;
      return MediaSource.isTypeSupported(fullType) ? 'pass' : 'fail';
    });
  });

  grid.setAttribute('x-axis', JSON.stringify(codecStrings));
  grid.setAttribute('y-axis', JSON.stringify(mimeTypes));
  grid.setAttribute('data', JSON.stringify(data));
}

function renderVideoGrid() {
  const grid = document.getElementById('video-grid');
  const video = document.createElement('video');
  const data = mimeTypes.map(mimeType => {
    return codecStrings.map(codec => {
      const fullType = `${mimeType}; codecs="${codec}"`;
      const supportLevel = video.canPlayType(fullType);
      if (supportLevel === 'probably') return 'pass';
      if (supportLevel === 'maybe') return 'maybe';
      return 'fail';
    });
  });

  grid.setAttribute('x-axis', JSON.stringify(codecStrings));
  grid.setAttribute('y-axis', JSON.stringify(mimeTypes));
  grid.setAttribute('data', JSON.stringify(data));
}

function runSingleHlsTest(test) {
  return new Promise((resolve) => {
    const playerContainer = document.getElementById('player-container');
    const video = document.createElement('video');
    video.muted = true; // Ensure autoplay works
    playerContainer.appendChild(video);

    const logs = [];
    const networkRequests = [];
    const originalConsoleError = console.error;
    console.error = (...args) => {
      logs.push(args.join(' '));
      originalConsoleError.apply(console, args);
    };

    const messageListener = (event) => {
      if (event.data.type === 'network_request') {
        networkRequests.push(event.data.url);
      }
    };
    navigator.serviceWorker.addEventListener('message', messageListener);

    const timeout = setTimeout(() => {
      finishTest({ status: 'FAIL', reason: 'Timed out' });
    }, 15000); // 15 second timeout

    const finishTest = (result) => {
      clearTimeout(timeout);
      console.error = originalConsoleError;
      navigator.serviceWorker.removeEventListener('message', messageListener);

      let screenshot = null;
      if (result.status === 'PASS') {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          screenshot = canvas.toDataURL('image/png');
        } catch (e) {
          logs.push(`Could not generate screenshot: ${e.message}`);
        }
      }

      video.remove();
      resolve({ ...result, logs, screenshot, networkRequests });
    };

    video.addEventListener('error', () => {
      const error = video.error;
      logs.push(`Video Error: code ${error.code}, message: ${error.message}`);
      finishTest({ status: 'FAIL', reason: 'Player error' });
    });

    video.addEventListener('canplay', () => {
      video.play().then(() => {
        // Let it play for a moment to get a frame
        setTimeout(() => finishTest({ status: 'PASS' }), 500);
      }).catch(e => {
        logs.push(`Play promise rejected: ${e.message}`);
        finishTest({ status: 'FAIL', reason: 'Could not play' });
      });
    });

    video.src = test.manifest;
  });
}

async function runAllHlsTests() {
  const container = document.getElementById('hls-reports-container');
  const testElements = hlsConformanceTests.map(test => {
    const details = document.createElement('details');
    details.className = 'report-box';

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div class="hls-report-summary">
        <span><strong>${test.name}:</strong> ${test.description}</span>
        <span class="result running">QUEUED</span>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'report-body';
    body.textContent = 'Waiting to run...';

    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);

    return { test, details, summary, body };
  });

  for (const el of testElements) {
    const resultEl = el.summary.querySelector('.result');
    resultEl.textContent = 'RUNNING';
    resultEl.className = 'result running';

    const result = await runSingleHlsTest(el.test);

    resultEl.textContent = result.status;
    resultEl.className = `result ${result.status.toLowerCase()}`;

    el.body.innerHTML = `
      <h4>Logs:</h4>
      <pre>${result.logs.join('\n') || 'No errors logged.'}</pre>
      <h4>Network Requests:</h4>
      <pre>${result.networkRequests.join('\n') || 'No requests captured.'}</pre>
      ${result.screenshot ? `<h4>Screenshot:</h4><img src="${result.screenshot}" style="max-width: 100%; height: auto; border: 1px solid #ccc;">` : ''}
    `;
  }
}

async function main() {
  renderMseGrid();
  renderVideoGrid();

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/worker.js');
      await navigator.serviceWorker.ready;

      if (!navigator.serviceWorker.controller) {
        // This is the first load, or the worker is not yet in control.
        // Reload the page to ensure the service worker can intercept requests.
        console.log('Reloading page to activate service worker control.');
        window.location.reload();
        return; // Abort script execution to allow the page to reload
      }
      
      console.log('Service worker is active and controlling the page.');
      runAllHlsTests();

    } catch (error) {
      console.error('Service worker setup failed:', error);
      // Run tests anyway, but worker features won't work.
      runAllHlsTests();
    }
  } else {
    // Service workers not supported.
    runAllHlsTests();
  }
}

main();