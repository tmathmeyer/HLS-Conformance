
import { hlsConformanceTests } from './conformance.js';

async function runSingleHlsTest(test, testId, player) {
  return new Promise((resolve) => {
    const video = document.querySelector('video');
    video.muted = true; // Ensure autoplay works

    const logs = [];
    const networkRequests = [];
    const originalConsoleError = console.error;
    console.error = (...args) => {
      logs.push(args.join(' '));
      originalConsoleError.apply(console, args);
    };

    const messageListener = (event) => {
      if (event.data.type === 'network_request' && event.data.testId === testId) {
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
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            screenshot = canvas.toDataURL('image/png');
          }
        } catch (e) {
          logs.push(`Could not generate screenshot: ${e.message}`);
        }
      }

      const finalResult = { ...result, logs, screenshot, networkRequests };

      if (test.expected === 'fail') {
        if (result.status === 'FAIL') {
          finalResult.status = 'PASS';
          finalResult.reason = `Player failed as expected: ${result.reason}`;
        } else {
          finalResult.status = 'FAIL';
          finalResult.reason = 'Unexpected pass';
        }
      }
      
      resolve(finalResult);
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

    if (player === 'hls.js') {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(test.manifest);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            logs.push(`HLS.js Error: ${data.type} - ${data.details}`);
            finishTest({ status: 'FAIL', reason: 'HLS.js fatal error' });
          }
        });
      } else {
        logs.push('HLS.js is not supported');
        finishTest({ status: 'FAIL', reason: 'HLS.js not supported' });
      }
    } else if (player === 'shaka-player') {
      if (shaka.Player.isBrowserSupported()) {
        const shakaPlayer = new shaka.Player(video);
        shakaPlayer.addEventListener('error', (event) => {
          logs.push(`Shaka Player Error: ${event.detail.code}`);
          finishTest({ status: 'FAIL', reason: 'Shaka Player error' });
        });
        shakaPlayer.load(test.manifest).catch(() => {
          // error is handled by the event listener
        });
      } else {
        logs.push('Shaka Player is not supported');
        finishTest({ status: 'FAIL', reason: 'Shaka Player not supported' });
      }
    } else {
      video.src = test.manifest;
    }
  });
}


async function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const testIndex = parseInt(urlParams.get('testIndex'), 10);
  const testId = urlParams.get('testId');
  const player = urlParams.get('player');

  const { hlsConformanceTests } = await import('./conformance.js');
  const test = hlsConformanceTests[testIndex];

  const result = await runSingleHlsTest(test, testId, player);

  window.parent.postMessage({ type: 'test_result', testId, result, testIndex}, '*');
}

main();
