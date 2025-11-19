const vscode = require("vscode");
const path = require("path");

function stripComments(text) {
    // Remove /* block comments */
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove // line comments
    text = text.replace(/\/\/.*$/gm, "");

    return text;
}

// Recursively generate folders & files
async function createTree(baseUri, node) {
    for (const key of Object.keys(node)) {
        const value = node[key];
        const targetUri = vscode.Uri.joinPath(baseUri, key);

        // File
        if (typeof value === "string") {
            await vscode.workspace.fs.writeFile(
                targetUri,
                Buffer.from(value, "utf8")
            );
        }

        // Folder
        else if (typeof value === "object") {
            await vscode.workspace.fs.createDirectory(targetUri);
            await createTree(targetUri, value);
        }
    }
}

async function generateFromSgmtr(uri) {
    try {
        const raw = await vscode.workspace.fs.readFile(uri);
        let text = raw.toString();

        // Strip comments BEFORE parsing
        text = stripComments(text);

        const data = JSON.parse(text);

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

function activate(context) {
    const cmd = vscode.commands.registerCommand(
        "folderStructureGenerator.generateFromSgmtr",
        (uri) => generateFromSgmtr(uri)
    );

    context.subscriptions.push(cmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
