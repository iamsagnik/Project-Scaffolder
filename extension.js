const vscode = require("vscode");
const { parse } = require("jsonc-parser");

// ----------- ASCII TREE BUILDER -----------------------
function buildTextTree(obj, indent = "") {
    const entries = Object.entries(obj || {});
    if (entries.length === 0) return indent + "└── (empty)\n";

    let result = "";

    entries.forEach(([name, value], index) => {
        const isLast = index === entries.length - 1;
        const pointer = isLast ? "└── " : "├── ";

        if (typeof value === "string") {
            // File
            result += indent + pointer + name + "\n";
        } else {
            // Folder
            result += indent + pointer + name + "\n";
            const newIndent = indent + (isLast ? "    " : "│   ");
            result += buildTextTree(value, newIndent);
        }
    });

    return result;
}

// ----------- PREVIEW HTML (ASCII TREE OUTPUT) -----------------------
function getPreviewHtml(treeObj) {
    const asciiTree = buildTextTree(treeObj);

    return `
<!DOCTYPE html>
<html>
<head>
<style>
body {
  font-family: Consolas, monospace;
  background: #1e1e1e;
  color: #e0e0e0;
  margin: 0;
  padding: 16px;
}
h3 {
  margin: 0 0 12px 0;
  font-weight: 600;
}
pre {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.4;
}
</style>
</head>
<body>
<h3>Generated Structure Preview</h3>
<pre>${asciiTree.replace(/</g, "&lt;")}</pre>
</body>
</html>
`;
}

// ----------- GENERATE COMMAND -----------------------
async function createTree(baseUri, node) {
    for (const key of Object.keys(node)) {
        const value = node[key];
        const targetUri = vscode.Uri.joinPath(baseUri, key);

        if (typeof value === "string") {
            await vscode.workspace.fs.writeFile(
                targetUri,
                Buffer.from(value, "utf8")
            );
        } else if (typeof value === "object") {
            await vscode.workspace.fs.createDirectory(targetUri);
            await createTree(targetUri, value);
        }
    }
}

async function generateFromSgmtr(uri) {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        const text = raw.toString();

        const data = parse(text);

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
            vscode.window.showErrorMessage("Open a workspace folder first.");
            return;
        }

        await createTree(workspace.uri, data);

        vscode.window.showInformationMessage("Structure generated successfully.");
    } catch (err) {
        vscode.window.showErrorMessage("Error: " + err.message);
        console.error(err);
    }
}

// ----------- PREVIEW COMMAND -----------------------
async function previewStructure(uri) {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        const text = raw.toString();

        const data = parse(text);

        const panel = vscode.window.createWebviewPanel(
            "sgmtrPreview",
            "SGMTR Structure Preview",
            vscode.ViewColumn.One,
            { enableScripts: false }
        );

        panel.webview.html = getPreviewHtml(data);
    } catch (err) {
        vscode.window.showErrorMessage("Preview Error: " + err.message);
        console.error(err);
    }
}

// ----------- ACTIVATE / DEACTIVATE -----------------------
function activate(context) {
    const generateCmd = vscode.commands.registerCommand(
        "folderStructureGenerator.generateFromSgmtr",
        (uri) => generateFromSgmtr(uri)
    );

    const previewCmd = vscode.commands.registerCommand(
        "folderStructureGenerator.previewStructure",
        (uri) => previewStructure(uri)
    );

    context.subscriptions.push(generateCmd, previewCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };