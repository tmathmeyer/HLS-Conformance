import { mimeTypes, codecStrings } from './conformance.js';

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


function main() {
  renderMseGrid();
  renderVideoGrid();
}

main();