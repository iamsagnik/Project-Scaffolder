// flowPreviewPanel.js
// Final working Flow Preview Panel for CFG-based function flowcharts.

const vscode = require("vscode");
const path = require("path");
const { readFile } = require("../utils/fsUtils");
const logger = require("../diagnostics/logger");

class FlowPreviewPanel {
  static currentPanel = null;

  static async createOrShow(context, graphData, uri) {
    logger.info("flowPreviewPanel", "createOrShow has been called", { filePath: uri.fsPath });
    try {
      const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

      // If already open → update + reveal
      if (FlowPreviewPanel.currentPanel) {
        FlowPreviewPanel.currentPanel.update(graphData);
        FlowPreviewPanel.currentPanel.panel.reveal(column);
        return;
      }

      console.log("About to create webview panel");
      // localResourceRoots now valid
      const panel = vscode.window.createWebviewPanel(
        "flowPreview",
        "Flow Preview",
        column,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "src", "core","flowPreview"),
            vscode.Uri.joinPath(context.extensionUri, "src", "core", "flowPreview", "libs")
          ]
        }
      );

      FlowPreviewPanel.currentPanel = new FlowPreviewPanel(panel, context, graphData);
    } catch (err) {
      logger.error("flowPreviewPanel", "createOrShow() failed", { error: err.message });
      vscode.window.showErrorMessage("Flow Preview failed to open: " + err.message);
    }
  }

  async initialize() {
    try {
      const html = await this.getHtml();
      this.panel.webview.html = html;
    } catch (err) {
      logger.error("flowPreviewPanel", "HTML load failed", { error: err.message });

      this.panel.webview.html = `
        <html><body style="color: red; padding: 20px;">
          Failed to load Flow Preview UI.<br/><pre>${err.message}</pre>
        </body></html>`;
    }
  }

  constructor(panel, context, graphData) {
    console.log("FlowPreviewPanel constructor called");
    this.panel = panel;
    this.context = context;
    this.graphData = graphData;

    // async HTML load
    this.initialize();

    // Webview Message Handlers
    this.panel.webview.onDidReceiveMessage(
      (msg) => {
        if (!msg || !msg.type) return;

        switch (msg.type) {
          case "ready":
            this.postGraph();
            break;

          case "jumpToFunction":
            this.panel.webview.postMessage({
              type: "switchFunction",
              target: msg.targetFullName
            });
            break;

          case "highlightCode":
            this.highlightCode(msg.range);
            break;

          default:
            break;
        }
      },
      null,
      this.context.subscriptions
    );

    // Cleanup
    this.panel.onDidDispose(() => {
      FlowPreviewPanel.currentPanel = null;
    });
  }

  // Sends CFG Graph Data to Webview
  postGraph() {
    this.panel.webview.postMessage({
      type: "graphData",
      graph: this.graphData
    });
  }

  // Update graph in an existing panel
  update(graphData) {
    this.graphData = graphData;
    this.postGraph();
  }


  // Highlight Code in Editor
  highlightCode(range) {
    if (!range) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    try {
      const start = new vscode.Position(range.start.row, range.start.column);
      const end = new vscode.Position(range.end.row, range.end.column);

      editor.selection = new vscode.Selection(start, end);
      editor.revealRange(
        new vscode.Range(start, end),
        vscode.TextEditorRevealType.InCenter
      );
    } catch (err) {
      logger.error("flowPreviewPanel", "highlightCode failed", { error: err.message });
    }
  }

  validateTemplatePlaceholders(html, placeholders) {
    for (const ph of placeholders) {
      if (!html.includes(ph)) {
        const msg = `Missing placeholder in HTML: ${ph}`;
        logger.error("flowPreviewPanel", msg);
        throw new Error(msg);
      }
    }
  }

  // Webview HTML Loader
  async getHtml() {
    const webview = this.panel.webview;
    const cspSource = webview.cspSource;


    const flowRoot = vscode.Uri.joinPath(this.context.extensionUri, "src", "core", "flowPreview");
    const libsRoot = vscode.Uri.joinPath(flowRoot, "libs");
    const htmlUri = vscode.Uri.joinPath(flowRoot, "flowPreview.html");

    // Validate file exists
    try {
      await vscode.workspace.fs.stat(htmlUri);
    } catch {
      const msg = `flowPreview.html not found at: ${htmlUri.fsPath}`;
      logger.error("flowPreviewPanel", msg);
      throw new Error(msg);
    }

    // generate webview-safe URIs
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(flowRoot, "flowPreview.js"));
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(flowRoot, "flowPreview.css"));
    const d3Uri = webview.asWebviewUri(vscode.Uri.joinPath(libsRoot, "d3.v7.min.js"));
    const dagreUri = webview.asWebviewUri(vscode.Uri.joinPath(libsRoot, "dagre.min.js"));
    const dagreD3Uri = webview.asWebviewUri(vscode.Uri.joinPath(libsRoot, "dagre-d3.min.js"));

    // Read HTML
    const readRes = await readFile(htmlUri.fsPath, "utf8");
    if (!readRes || !readRes.ok) {
      const msg = `Failed to read flowPreview.html: ${readRes?.reason || "unknown"}`;
      logger.error("flowPreviewPanel", msg);
      return `<!doctype html><html><body><pre style="color:tomato">${msg}</pre></body></html>`;
    }

    let html = readRes.content;

    // Validate required placeholders BEFORE replacement
    this.validateTemplatePlaceholders(html, [
      "${cssUri}",
      "${scriptUri}",
      "${d3Uri}",
      "${dagreUri}",
      "${dagreD3Uri}",
      "${cspSource}"
    ]);

    // Safe global replacements
    html = html
      .replace(/\$\{cssUri\}/g, cssUri)
      .replace(/\$\{scriptUri\}/g, scriptUri)
      .replace(/\$\{d3Uri\}/g, d3Uri)
      .replace(/\$\{dagreUri\}/g, dagreUri)
      .replace(/\$\{dagreD3Uri\}/g, dagreD3Uri)
      .replace(/\$\{cspSource\}/g, cspSource);

    return html;
  }

}

module.exports = FlowPreviewPanel;
