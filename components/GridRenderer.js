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
    const cellWidth = 40;
    const cellHeight = 40;
    const yAxisWidth = 200;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 2rem;
        }
        .title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .grid {
          display: grid;
          grid-template-columns: ${yAxisWidth}px repeat(${this.xAxis.length}, ${cellWidth}px);
          grid-template-rows: auto repeat(${this.yAxis.length}, ${cellHeight}px);
          border-left: 1px solid #ccc;
          border-top: 1px solid #ccc;
        }
        .grid-cell {
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
        }
        .x-axis-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          padding: 5px;
        }
        .y-axis-label {
          justify-content: flex-end;
          padding-right: 10px;
        }
        .corner {
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
        }
      </style>
      <div class="title">${this.title}</div>
      <div class="grid">
        <!-- Corner -->
        <div class="corner"></div>
        <!-- X-Axis Labels -->
        ${this.xAxis.map(label => `<div class="grid-cell x-axis-label">${label}</div>`).join('')}
        <!-- Y-Axis Labels and Data Cells -->
        ${this.yAxis.map((label, y) => `
          <div class="grid-cell y-axis-label">${label}</div>
          ${this.xAxis.map((_, x) => {
            const cellClass = (this.data[y] && this.data[y][x]) ? this.data[y][x] : '';
            return `<div class="grid-cell ${cellClass}"></div>`;
          }).join('')}
        `).join('')}
      </div>
    `;
  }
}

customElements.define('grid-renderer', GridRenderer);
