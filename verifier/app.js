import createHlsVerifierModule from "./hls_verifier.js";

const manifestInput = document.getElementById("manifest");
const backdrop = document.getElementById("backdrop");
const outputView = document.getElementById("output");

const LINE_HEIGHT_PX = 18;
let wasmModule = null;

function findErrorLocation(status) {
  let loc = null;
  let curr = status;
  while (curr && typeof curr === "object") {
    if (
      curr.data &&
      typeof curr.data.line === "number" &&
      typeof curr.data.column === "number"
    ) {
      loc = {
        line: curr.data.line,
        column: curr.data.column,
        columnEnd:
          typeof curr.data.column_end === "number"
            ? curr.data.column_end
            : curr.data.column + 1,
      };
    }
    curr = curr.cause;
  }
  return loc;
}

function syncScroll() {
  backdrop.style.transform =
    `translate(${-manifestInput.scrollLeft}px, ${-manifestInput.scrollTop}px)`;
}

function renderHighlight(text, loc) {
  backdrop.replaceChildren();
  if (!loc || loc.line < 1) {
    return;
  }

  const lines = text.split("\n");
  const lineIdx = Math.min(loc.line - 1, lines.length - 1);
  const lineText = lines[lineIdx] ?? "";
  const colStart = Math.max(0, loc.column - 1);
  const colEnd = Math.max(colStart, loc.columnEnd - 1);

  const lineEl = document.createElement("div");
  lineEl.className = "error-line";
  lineEl.style.marginTop = `${lineIdx * LINE_HEIGHT_PX}px`;

  const markEl = document.createElement("mark");
  markEl.className = "error-mark";

  if (colStart >= lineText.length) {
    if (lineText) {
      lineEl.appendChild(document.createTextNode(lineText));
    }
    markEl.classList.add("caret");
    markEl.textContent = " ";
    lineEl.appendChild(markEl);
  } else if (colEnd <= colStart) {
    const before = lineText.slice(0, colStart);
    const at = lineText[colStart];
    const after = lineText.slice(colStart + 1);
    if (before) {
      lineEl.appendChild(document.createTextNode(before));
    }
    markEl.classList.add("caret");
    markEl.textContent = at;
    lineEl.appendChild(markEl);
    if (after) {
      lineEl.appendChild(document.createTextNode(after));
    }
  } else {
    const clampedEnd = Math.min(colEnd, lineText.length);
    const before = lineText.slice(0, colStart);
    const span = lineText.slice(colStart, clampedEnd);
    const after = lineText.slice(clampedEnd);
    if (before) {
      lineEl.appendChild(document.createTextNode(before));
    }
    markEl.textContent = span;
    lineEl.appendChild(markEl);
    if (after) {
      lineEl.appendChild(document.createTextNode(after));
    }
  }

  backdrop.style.width =
    `${Math.max(manifestInput.clientWidth, manifestInput.scrollWidth)}px`;
  backdrop.appendChild(lineEl);
  syncScroll();
}

function verify() {
  if (!wasmModule) {
    return;
  }
  const text = manifestInput.value;
  const ptr = wasmModule.ccall(
    "VerifyHlsManifest",
    "number",
    ["string"],
    [text]
  );
  if (!ptr) {
    outputView.textContent = "{}";
    renderHighlight(text, null);
    return;
  }
  const raw = wasmModule.UTF8ToString(ptr);
  wasmModule._FreeVerifierResult(ptr);

  const parsed = JSON.parse(raw);
  const isError =
    typeof parsed.code === "number" && typeof parsed.group === "string";
  outputView.classList.toggle("error", isError);
  outputView.classList.toggle("valid", !isError);
  outputView.textContent = raw;

  renderHighlight(text, isError ? findErrorLocation(parsed) : null);
}

manifestInput.addEventListener("input", verify);
manifestInput.addEventListener("scroll", syncScroll);
window.addEventListener("resize", verify);

createHlsVerifierModule()
  .then((mod) => {
    wasmModule = mod;
    verify();
  })
  .catch((err) => {
    outputView.classList.add("error");
    outputView.textContent = String(err);
  });
