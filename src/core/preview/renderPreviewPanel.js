const vscode = require("vscode");

const MAX_LINE_WIDTH = 300;
const MAX_OUTPUT_SIZE = 2 * 1024 * 1024; // 2 MB

let previewPanel = null;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeLineWidth(output) {
  const lines = output.split("\n");
  const normalized = lines.map(line => {
    if (line.length <= MAX_LINE_WIDTH) return line;
    return line.slice(0, MAX_LINE_WIDTH) + "…";
  });
  return normalized.join("\n");
}

function enforceOutputSizeLimit(output) {
  if (Buffer.byteLength(output, "utf8") <= MAX_OUTPUT_SIZE) {
    return output;
  }

  const truncated = output.slice(0, MAX_OUTPUT_SIZE);
  return truncated + "\n...[truncated]";
}

function buildHtml(asciiOutput) {
  const safe = escapeHtml(asciiOutput);

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: monospace;
    padding: 16px;
    white-space: pre;
    background: #0f0f0f;
    color: #e0e0e0;
  }
  h3 {
    margin-top: 0;
    font-weight: normal;
    color: #9cdcfe;
  }
  .meta {
    margin-bottom: 10px;
    font-size: 12px;
    opacity: 0.8;
  }
</style>
</head>
<body>
<h3>SGMTR Preview</h3>
<div class="meta">Read-only structural preview</div>
${safe}
</body>
</html>`;
}

function renderPreviewPanel(asciiOutput) {
  let output = asciiOutput || "";

  output = normalizeLineWidth(output);
  output = enforceOutputSizeLimit(output);

  const html = buildHtml(output);

  if (previewPanel) {
    previewPanel.webview.html = html;
    previewPanel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  previewPanel = vscode.window.createWebviewPanel(
    "sgmtrPreview",
    "SGMTR Preview",
    vscode.ViewColumn.Beside,
    {
      enableScripts: false,
      retainContextWhenHidden: true
    }
  );

  previewPanel.webview.html = html;

  previewPanel.onDidDispose(() => {
    previewPanel = null;
  });
}

module.exports = {
  renderPreviewPanel
};