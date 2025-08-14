
import { hlsConformanceTests } from './conformance.js';

async function runSingleHlsTest(test, testId, player) {
  return new Promise((resolve) => {
    const video = document.querySelector('video');
    video.muted = true; // Ensure autoplay works

    const logs = [];
    const networkRequests = [];
    const timelineEvents = [];
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      logs.push(message);
      timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
      originalConsoleError.apply(console, args);
    };

    const messageListener = (event) => {
      if (event.data.type === 'network_request' && event.data.testId === testId) {
        networkRequests.push(event.data.url);
        timelineEvents.push({timestamp: event.data.timestamp, type: 'network', data: event.data.url});
      }
    };
    navigator.serviceWorker.addEventListener('message', messageListener);

    const videoEvents = [
      'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 
      'stalled', 'play', 'pause', 'loadedmetadata', 'loadeddata', 'waiting', 
      'playing', 'canplay', 'canplaythrough', 'seeking', 'seeked', 
      'timeupdate', 'ended', 'ratechange', 'durationchange', 'volumechange'
    ];

    videoEvents.forEach(eventName => {
      video.addEventListener(eventName, (event) => {
        timelineEvents.push({timestamp: Date.now(), type: 'video-event', data: event.type});
      });
    });

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

      const finalResult = { ...result, logs, screenshot, networkRequests, timelineEvents };

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
      const message = `Video Error: code ${error.code}, message: ${error.message}`;
      logs.push(message);
      timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
      finishTest({ status: 'FAIL', reason: 'Player error' });
    });

    video.addEventListener('canplay', () => {
      video.play().then(() => {
        // Let it play for a moment to get a frame
        setTimeout(() => finishTest({ status: 'PASS' }), 500);
      }).catch(e => {
        const message = `Play promise rejected: ${e.message}`;
        logs.push(message);
        timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
        finishTest({ status: 'FAIL', reason: 'Could not play' });
      });
    });

    if (player === 'hls.js') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: true,
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          const message = `HLS.js log: ${data.type} - ${data.details}`;
          logs.push(message);
          timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
          if (data.fatal) {
            finishTest({ status: 'FAIL', reason: 'HLS.js fatal error' });
          }
        });
        Object.values(Hls.Events).forEach(eventName => {
          hls.on(eventName, (event, data) => {
            try {
              timelineEvents.push({timestamp: Date.now(), type: 'hls-event', data: { eventName, data: JSON.parse(JSON.stringify(data)) }});
            } catch(e) {
              // data has circular references, so we can't serialize it.
              // This is fine, we'll just skip it.
            }
          });
        });
        hls.loadSource(test.manifest);
        hls.attachMedia(video);
      } else {
        const message = 'HLS.js is not supported';
        logs.push(message);
        timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
        finishTest({ status: 'FAIL', reason: 'HLS.js not supported' });
      }
    } else if (player === 'shaka-player') {
      if (shaka.Player.isBrowserSupported()) {
        shaka.log.setLevel(shaka.log.Level.V2);
        shaka.log.v2 = (...args) => {
          const message = `Shaka Player log: ${args.join(' ')}`;
          logs.push(message);
          timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
        };
        const shakaPlayer = new shaka.Player(video);
        shakaPlayer.addEventListener('error', (event) => {
          const message = `Shaka Player Error: ${event.detail.code}`;
          logs.push(message);
          timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
          finishTest({ status: 'FAIL', reason: 'Shaka Player error' });
        });
        shakaPlayer.load(test.manifest).catch(() => {
          // error is handled by the event listener
        });
      } else {
        const message = 'Shaka Player is not supported';
        logs.push(message);
        timelineEvents.push({timestamp: Date.now(), type: 'log', data: message});
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
