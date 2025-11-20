const vscode = require("vscode");
const path = require("path");
const { buildAsciiTree } = require("./treeStyler");
const { expandReactSnippet, isReactSnippetKeyword } = require("./snippets/reactSnippets");

/* --------------------------------------------
   Utility: Strip comments before JSON.parse()
--------------------------------------------- */
function stripComments(text) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");
    text = text.replace(/\/\/.*$/gm, "");
    return text;
}

/* --------------------------------------------
   Utility: Recursively create folders & files
--------------------------------------------- */
async function createTree(baseUri, node) {
    for (const key of Object.keys(node)) {

        let value = node[key];   // <-- FIX HERE (let, not const)

        const targetUri = vscode.Uri.joinPath(baseUri, key);

        if (typeof value === "string") {
            const ext = path.extname(key);

            // React snippet expansion
            if ((ext === ".jsx" || ext === ".tsx") && isReactSnippetKeyword(value)) {
                value = expandReactSnippet(value, key); // expand shorthand
            }

            const parentDir = path.dirname(targetUri.fsPath);
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));
            await vscode.workspace.fs.writeFile(targetUri, Buffer.from(value, "utf8"));

        } else if (typeof value === "object") {

            await vscode.workspace.fs.createDirectory(targetUri);
            await createTree(targetUri, value);
        }
    }
}


/* --------------------------------------------
   Preview (ASCII tree with Webview)
--------------------------------------------- */
async function previewSgmtr(uri) {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        let text = stripComments(raw.toString());
        const data = JSON.parse(text);

        const tree = buildAsciiTree(data);

        const panel = vscode.window.createWebviewPanel(
            "sgmtrPreview",
            "SGMTR Preview",
            vscode.ViewColumn.Beside,
            {}
        );

        panel.webview.html = `
        <html>
        <body style="font-family: monospace; padding: 20px; white-space: pre;">
            <h3>Preview – Folder Structure</h3>
${tree}
        </body>
        </html>`;
    } catch (err) {
        vscode.window.showErrorMessage("Preview Error: " + err.message);
    }
}

/* --------------------------------------------
   Generate folder structure
--------------------------------------------- */
async function generateFromSgmtr(uri) {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        let text = stripComments(raw.toString());
        const data = JSON.parse(text);

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
            return vscode.window.showErrorMessage("Open a workspace folder first.");
        }

        await createTree(workspace.uri, data);

        vscode.window.showInformationMessage("Folder structure generated successfully.");
    } catch (err) {
        vscode.window.showErrorMessage("Generation Error: " + err.message);
    }
}

/* --------------------------------------------
   Activate extension
--------------------------------------------- */
function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "folderStructureGenerator.previewSgmtr",
            (uri) => previewSgmtr(uri)
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "folderStructureGenerator.generateFromSgmtr",
            (uri) => generateFromSgmtr(uri)
        )
    );
}

function deactivate() {}

module.exports = { activate, deactivate };