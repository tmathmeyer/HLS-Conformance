import { mimeTypes, codecStrings } from './conformance.js';

function renderMseGrid() {
  const grid = document.getElementById('mse-grid');
  grid.setAttribute('x-axis', JSON.stringify(codecStrings));
  grid.setAttribute('y-axis', JSON.stringify(mimeTypes));
  grid.render(); // Re-render with new attributes

  mimeTypes.forEach((mimeType, y) => {
    codecStrings.forEach((codec, x) => {
      const fullType = `${mimeType}; codecs="${codec}"`;
      const supported = MediaSource.isTypeSupported(fullType);
      grid.setCell(x, y, supported ? 'pass' : 'fail');
    });
  });
}

function renderVideoGrid() {
  const grid = document.getElementById('video-grid');
  grid.setAttribute('x-axis', JSON.stringify(codecStrings));
  grid.setAttribute('y-axis', JSON.stringify(mimeTypes));
  grid.render(); // Re-render with new attributes

  const video = document.createElement('video');
  mimeTypes.forEach((mimeType, y) => {
    codecStrings.forEach((codec, x) => {
      const fullType = `${mimeType}; codecs="${codec}"`;
      const supportLevel = video.canPlayType(fullType);
      let supportClass = 'fail';
      if (supportLevel === 'probably') {
        supportClass = 'pass';
      } else if (supportLevel === 'maybe') {
        supportClass = 'maybe';
      }
      grid.setCell(x, y, supportClass);
    });
  });
}


function main() {
  renderMseGrid();
  renderVideoGrid();
}

main();
