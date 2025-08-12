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
    const xAxisWidth = 250;

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
          grid-template-rows: ${xAxisWidth}px repeat(${this.yAxis.length}, ${cellHeight}px);
          box-sizing: border-box;
        }
        .grid-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          border-bottom: 1px solid #ccc;
          border-right: 1px solid #ccc;
          box-sizing: border-box;
        }
        .x-axis-label {
          writing-mode: vertical-rl;
          padding: 5px;
          border-top: 1px solid #ccc;
        }
        .x-axis-label > .label-rotate {
          transform: rotate(180deg);
        }
        .y-axis-label {
          justify-content: flex-end;
          padding-right: 10px;
          border-left: 1px solid #ccc;
        }
        .corner {
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          box-sizing: border-box;
          line-height: ${xAxisWidth}px;
          text-align: center;
        }
        .corner > .label-rotate {
          transform: rotate(-45deg);
          margin-left: -100%;
          margin-right: -100%;
          text-align: center;
        }
        .pass { background-color: #28a745; }
        .fail { background-color: #dc3545; }
        .maybe { background-color: #ffc107; }
      </style>
      <div class="grid">
        <div class="grid corner"><div class="label-rotate">${this.title}</div></div>
        ${this.xAxis.map(label => `<div class="grid-cell x-axis-label"><div class="label-rotate">${label}</div></div>`).join('')}
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
