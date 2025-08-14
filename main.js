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



async function runAllHlsTests() {
  const container = document.getElementById('hls-reports-container');
  container.innerHTML = '';
  const testElements = hlsConformanceTests.map((test, index) => {
    const details = document.createElement('details');
    details.className = 'report-box';

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div class="hls-report-summary">
        <span><strong>${test.name}:</strong> ${test.description}</span>
        <div class="result-group">
          <span class="result native running">NATIVE: QUEUED</span>
          <span class="result hlsjs running">HLS.JS: QUEUED</span>
          <span class="result shaka-player running">SHAKA: QUEUED</span>
        </div>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'report-body';
    body.innerHTML = `
      <div class="player-results" data-player="native"><h4>Native</h4><p>Waiting to run...</p></div>
      <div class="player-results" data-player="hls.js"><h4>HLS.js</h4><p>Waiting to run...</p></div>
      <div class="player-results" data-player="shaka-player"><h4>Shaka Player</h4><p>Waiting to run...</p></div>
    `;

    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);

    return { test, details, summary, body, index };
  });

  const totalEl = document.getElementById('total-count');
  const passedEl = document.getElementById('passed-count');
  const failedEl = document.getElementById('failed-count');
  const runningEl = document.getElementById('running-count');

  let total = testElements.length * 3;
  let passed = 0;
  let failed = 0;
  let running = 0;

  totalEl.textContent = total;

  const results = {};
  window.addEventListener('message', (event) => {
    if (event.data.type === 'test_result') {
      const { testId, result, testIndex } = event.data;
      results[testId] = { result, testIndex };
    }
  });

  const runTest = async (el, player) => {
    running++;
    runningEl.textContent = running;

    const resultEl = el.summary.querySelector(`.result.${player.replace('.', '')}`);
    resultEl.textContent = `${player.toUpperCase()}: RUNNING`;
    resultEl.className = `result ${player.replace('.', '')} running`;

    const testId = `test-${el.index}-${player}-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `test_runner.html?testIndex=${el.index}&testId=${testId}&player=${player}`;
    document.body.appendChild(iframe);

    const wait = () => new Promise(resolve => {
      const interval = setInterval(() => {
        if (results[testId]) {
          clearInterval(interval);
          resolve(results[testId].result);
          iframe.remove();
        }
      }, 100);
    });

    const result = await wait();
    
    running--;
    if (result.status === 'PASS') {
      passed++;
    } else {
      failed++;
    }

    passedEl.textContent = passed;
    failedEl.textContent = failed;
    runningEl.textContent = running;

    let statusText = result.status;
    if (el.test.expected === 'fail' && result.status === 'PASS') {
      statusText = 'PASS (Expected Fail)';
    } else if (el.test.expected === 'fail' && result.status === 'FAIL') {
        statusText = 'FAIL (Unexpected Pass)';
    }

    resultEl.textContent = `${player.toUpperCase()}: ${statusText}`;
    resultEl.className = `result ${player.replace('.', '')} ${result.status.toLowerCase()}`;

    const playerResultContainer = el.body.querySelector(`.player-results[data-player="${player}"]`);

    const manifestUrls = [...new Set(result.networkRequests.filter(url => url.endsWith('.m3u8')))];
    const manifestContents = await Promise.all(manifestUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        return { url, text };
      } catch (e) {
        return { url, text: `Failed to fetch: ${e.message}` };
      }
    }));

    playerResultContainer.innerHTML = `
      <div class="player-result-header">
        <h4>${player.toUpperCase()}</h4>
        <button class="open-in-new-tab-btn" data-player="${player}" data-test-index="${el.index}">Open in New Tab</button>
      </div>
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="network">Network</button>
        <button class="tab-btn" data-tab="manifests">Manifests</button>
        ${result.screenshot ? '<button class="tab-btn" data-tab="screenshot">Screenshot</button>' : ''}
        <button class="tab-btn" data-tab="logs">Logs</button>
      </div>
      <div class="tab-content">
        <div class="tab-pane" data-pane="logs">
          <pre>${result.logs.join('\n') || 'No errors logged.'}</pre>
        </div>
        <div class="tab-pane active" data-pane="network">
          <pre>${result.networkRequests.join('\n') || 'No requests captured.'}</pre>
        </div>
        <div class="tab-pane" data-pane="manifests">
          ${manifestContents.map(m => `
            <h4>${m.url}</h4>
            <pre>${m.text}</pre>
          `).join('') || '<pre>No manifests captured.</pre>'}
        </div>
        ${result.screenshot ? `
        <div class="tab-pane" data-pane="screenshot">
          <img src="${result.screenshot}" style="max-width: 100%; height: auto; border: 1px solid #ccc;">
        </div>` : ''}
      </div>
    `
  };

  // Run up to 20 tests in parallel
  const limit = 20;
  const queue = [];
  for (const el of testElements) {
    queue.push({el, player: 'native'});
    queue.push({el, player: 'hls.js'});
    queue.push({el, player: 'shaka-player'});
  }

  const active = [];

  const next = () => {
    while (active.length < limit && queue.length > 0) {
      const {el, player} = queue.shift();
      const promise = runTest(el, player).then(() => {
        active.splice(active.indexOf(promise), 1);
        next();
      });
      active.push(promise);
    }
  };

  next();
}

async function main() {
  renderMseGrid();
  renderVideoGrid();

  document.getElementById('hls-reports-container').addEventListener('click', (e) => {
    if (!e.target.matches('.tab-btn')) return;

    const playerResultContainer = e.target.closest('.player-results');
    if (!playerResultContainer) return;

    const tab = e.target.dataset.tab;

    const activeTab = playerResultContainer.querySelector('.tab-btn.active');
    if (activeTab) activeTab.classList.remove('active');
    
    const activePane = playerResultContainer.querySelector('.tab-pane.active');
    if (activePane) activePane.classList.remove('active');

    e.target.classList.add('active');
    const newPane = playerResultContainer.querySelector(`[data-pane="${tab}"]`);
    if (newPane) newPane.classList.add('active');
  });

  document.getElementById('hls-reports-container').addEventListener('click', (e) => {
    if (!e.target.matches('.open-in-new-tab-btn')) return;

    const player = e.target.dataset.player;
    const testIndex = e.target.dataset.testIndex;
    window.open(`test_runner.html?testIndex=${testIndex}&player=${player}`, '_blank');
  });

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