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



let passed = 0;
let failed = 0;
let running = 0;
let passedEl, failedEl, runningEl;
const results = {};

async function runTest(el, player) {
  running++;
  runningEl.textContent = running;

  const resultEl = el.summary.querySelector(`.result.${player.replace('.', '')}`);
  resultEl.textContent = `RUNNING`;
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
  if (el.test.expected === 'fail' && result.status === 'FAIL') {
      statusText = 'FAIL (Unexpected Pass)';
  }

  resultEl.textContent = statusText;
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
      <div>
        <button class="rerun-btn" data-player="${player}" data-test-index="${el.index}">Rerun</button>
        <button class="open-in-new-tab-btn" data-player="${player}" data-test-index="${el.index}">Open in New Tab</button>
      </div>
    </div>
    <div class="tab-bar">
      <button class="tab-btn active" data-tab="network">Network</button>
      <button class="tab-btn" data-tab="manifests">Manifests</button>
      <button class="tab-btn" data-tab="timeline">Timeline</button>
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
      <div class="tab-pane" data-pane="timeline">
        <pre>${result.timelineEvents.filter(e => e && e.timestamp).sort((a,b) => a.timestamp - b.timestamp).map(e => `${new Date(e.timestamp).toISOString()} [${e.type}] ${typeof e.data === 'string' ? e.data : JSON.stringify(e.data)}`).join('\n')}</pre>
      </div>
      ${result.screenshot ? `
      <div class="tab-pane" data-pane="screenshot">
        <img src="${result.screenshot}" style="max-width: 100%; height: auto; border: 1px solid #ccc;">
      </div>` : ''}
    </div>
  `
};

async function runAllHlsTests() {
  const reports = document.querySelectorAll('#hls-reports-container .report-box');
  const testElements = Array.from(reports).map(details => {
    const index = parseInt(details.dataset.testIndex, 10);
    if (isNaN(index) || index < 0) return null; // Skip custom tests or invalid ones

    const test = hlsConformanceTests[index];
    const summary = details.querySelector('summary');
    const body = details.querySelector('.report-body');
    return { test, details, summary, body, index };
  }).filter(Boolean); // Filter out any nulls

  const totalEl = document.getElementById('total-count');

  let total = testElements.length * 3;
  passed = 0;
  failed = 0;
  running = 0;

  totalEl.textContent = total;
  passedEl.textContent = passed;
  failedEl.textContent = failed;
  runningEl.textContent = running;

  // Run up to 10 tests in parallel
  const limit = 10;
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

function filterTests() {
  const filterText = document.getElementById('test-filter').value.toLowerCase();
  const reports = document.querySelectorAll('#hls-reports-container .report-box');
  reports.forEach(report => {
    const name = report.querySelector('strong').textContent.toLowerCase();
    const description = report.querySelector('span:first-child').textContent.toLowerCase();
    if (name.includes(filterText) || description.includes(filterText)) {
      report.style.display = '';
    } else {
      report.style.display = 'none';
    }
  });
}

function renderHlsTests() {
  const container = document.getElementById('hls-reports-container');
  container.innerHTML = '';
  hlsConformanceTests.forEach((test, index) => {
    const details = document.createElement('details');
    details.className = 'report-box';
    details.dataset.testIndex = index;

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div class="hls-report-summary">
        <span><strong>${test.name}:</strong> ${test.description}</span>
        <div class="run-column">
          <button class="btn run-single-test-btn" data-test-index="${index}">Run</button>
        </div>
        <div class="result-group">
          <span class="result native not-run">NOT RUN</span>
          <span class="result hlsjs not-run">NOT RUN</span>
          <span class="result shaka-player not-run">NOT RUN</span>
        </div>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'report-body';
    body.innerHTML = `
      <div class="player-results" data-player="native"><h4>Native</h4><p>Not yet run.</p></div>
      <div class="player-results" data-player="hls.js"><h4>HLS.js</h4><p>Not yet run.</p></div>
      <div class="player-results" data-player="shaka-player"><h4>Shaka Player</h4><p>Not yet run.</p></div>
    `;

    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);
  });
}

async function main() {
  renderMseGrid();
  renderVideoGrid();
  renderHlsTests();

  passedEl = document.getElementById('passed-count');
  failedEl = document.getElementById('failed-count');
  runningEl = document.getElementById('running-count');

  document.getElementById('test-filter').addEventListener('input', filterTests);

  window.addEventListener('message', (event) => {
    if (event.data.type === 'test_result') {
      const { testId, result, testIndex } = event.data;
      results[testId] = { result, testIndex };
    }
  });
  
  document.getElementById('hls-reports-container').addEventListener('click', (e) => {
    if (e.target.matches('.tab-btn')) {
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
    } else if (e.target.matches('.open-in-new-tab-btn')) {
      const player = e.target.dataset.player;
      const testIndex = e.target.dataset.testIndex;
      window.open(`test_runner.html?testIndex=${testIndex}&player=${player}`, '_blank');
    } else if (e.target.matches('.run-single-test-btn')) {
      const reportBox = e.target.closest('.report-box');
      const testIndex = parseInt(reportBox.dataset.testIndex, 10);
      if (isNaN(testIndex)) return;

      const test = hlsConformanceTests[testIndex];
      if (!test) return;

      const el = {
        summary: reportBox.querySelector('summary'),
        body: reportBox.querySelector('.report-body'),
        test: test,
        index: testIndex,
      };
      runTest(el, 'native');
      runTest(el, 'hls.js');
      runTest(el, 'shaka-player');
    } else if (e.target.matches('.rerun-btn')) {
      const player = e.target.dataset.player;
      const reportBox = e.target.closest('.report-box');
      const testIndex = reportBox.dataset.testIndex;
      
      let test;
      if (testIndex === '-1') {
        test = {
          name: reportBox.dataset.testName,
          manifest: reportBox.dataset.testManifest,
          description: reportBox.dataset.testDescription,
        };
      } else {
        test = hlsConformanceTests[testIndex];
      }

      const resultEl = reportBox.querySelector(`.result.${player.replace('.', '')}`);
      if (resultEl.classList.contains('pass')) {
        passed--;
        passedEl.textContent = passed;
      } else if (resultEl.classList.contains('fail')) {
        failed--;
        failedEl.textContent = failed;
      }

      const el = {
        summary: reportBox.querySelector('summary'),
        body: reportBox.querySelector('.report-body'),
        test: test,
        index: testIndex,
      };
      runTest(el, player);
    }
  });

  document.getElementById('run-custom-test-btn').addEventListener('click', () => {
    const urlInput = document.getElementById('manifest-url');
    const fileInput = document.getElementById('manifest-file');
    const url = urlInput.value;
    const file = fileInput.files[0];

    if (!url && !file) {
      alert('Please provide a manifest URL or upload a file.');
      return;
    }

    let manifestUrl;
    if (url) {
      manifestUrl = url;
    } else {
      manifestUrl = URL.createObjectURL(file);
    }

    const customTest = {
      name: 'Custom Test',
      manifest: manifestUrl,
      description: url ? `URL: ${url}` : `File: ${file.name}`,
    };

    const container = document.getElementById('hls-reports-container');
    const details = document.createElement('details');
    details.className = 'report-box';
    details.open = true;
    details.dataset.testIndex = -1;
    details.dataset.testName = customTest.name;
    details.dataset.testManifest = customTest.manifest;
    details.dataset.testDescription = customTest.description;

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div class="hls-report-summary">
        <span><strong>${customTest.name}:</strong> ${customTest.description}</span>
        <div class="result-group">
          <span class="result native running">QUEUED</span>
          <span class="result hlsjs running">QUEUED</span>
          <span class="result shaka-player running">QUEUED</span>
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
    container.prepend(details);

    const el = {
      summary: summary,
      body: body,
      test: customTest,
      index: -1, // Custom test
    };

    runTest(el, 'native');
    runTest(el, 'hls.js');
    runTest(el, 'shaka-player');
  });

document.getElementById('run-all-tests-btn').addEventListener('click', () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('Service worker is active and controlling the page.');
      runAllHlsTests();
    } else if ('serviceWorker' in navigator) {
      console.error('Service worker is not yet in control. Cannot run tests.');
      alert('Service worker is not ready. Please reload the page and try again.');
    } else {
      console.error('Service workers not supported. Cannot run tests.');
      runAllHlsTests(); // Fallback for browsers without service workers
    }
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
    } catch (error) {
      console.error('Service worker setup failed:', error);
    }
  }
}

main();