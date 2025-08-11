class GridRenderer extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'x-axis', 'y-axis', 'data'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._updateAndRender();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._updateAndRender();
    }
  }

  _updateAndRender() {
    this.title = this.getAttribute('title') || 'Grid';
    try {
      this.xAxis = JSON.parse(this.getAttribute('x-axis') || '[]');
      this.yAxis = JSON.parse(this.getAttribute('y-axis') || '[]');
      this.data = JSON.parse(this.getAttribute('data') || '[]');
    } catch (e) {
      console.error("Invalid JSON for an attribute.", e);
      this.xAxis = [];
      this.yAxis = [];
      this.data = [];
    }
    this.render();
  }

  render() {
    const cellWidth = 100;
    const cellHeight = 40;
    const headerHeight = 200;
    const yAxisWidth = 200;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 2rem;
        }
        .grid-container {
          position: relative;
          padding-top: ${headerHeight}px;
          padding-left: ${yAxisWidth}px;
        }
        .title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(${this.xAxis.length}, ${cellWidth}px);
          grid-template-rows: repeat(${this.yAxis.length}, ${cellHeight}px);
          border-left: 1px solid #ccc;
          border-top: 1px solid #ccc;
        }
        .cell {
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        }
        .x-axis-label {
          position: absolute;
          top: 0;
          left: 0;
          width: ${cellWidth}px;
          height: ${headerHeight}px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          font-family: monospace;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          text-align: left;
          padding-bottom: 5px;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
        .y-axis-label {
          position: absolute;
          top: 0;
          left: 0;
          width: ${yAxisWidth}px;
          height: ${cellHeight}px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          font-family: monospace;
          padding-right: 10px;
          border-top: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        }
      </style>
      <div class="title">${this.title}</div>
      <div class="grid-container">
        <div class="grid">
          ${this.yAxis.map((_, y) =>
            this.xAxis.map((_, x) => {
              const cellClass = (this.data[y] && this.data[y][x]) ? this.data[y][x] : '';
              return `<div class="cell ${cellClass}" data-x="${x}" data-y="${y}"></div>`
            }).join('')
          ).join('')}
        </div>
        <div class="x-axis">
          ${this.xAxis.map((label, i) => `
            <div class="x-axis-label" style="left: ${yAxisWidth + i * cellWidth}px;">
              ${label}
            </div>
          `).join('')}
        </div>
        <div class="y-axis">
          ${this.yAxis.map((label, i) => `
            <div class="y-axis-label" style="top: ${headerHeight + i * cellHeight}px;">
              ${label}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

customElements.define('grid-renderer', GridRenderer);
