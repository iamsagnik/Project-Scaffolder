const vscode = require("vscode");
const path = require("path");

// Recursively create folder/file tree from object structure
async function createTree(baseUri, node) {
    for (const key of Object.keys(node)) {
        const value = node[key];
        const targetUri = vscode.Uri.joinPath(baseUri, key);

        // CASE: file (string content)
        if (typeof value === "string") {
            await vscode.workspace.fs.writeFile(
                targetUri,
                Buffer.from(value, "utf8")
            );
        }

        // CASE: folder (object)
        else if (typeof value === "object") {
            await vscode.workspace.fs.createDirectory(targetUri);
            await createTree(targetUri, value);
        }
    }
}

async function generateFromSgmtr(uri) {
    try {
        // Read file text
        const raw = await vscode.workspace.fs.readFile(uri);
        const json = JSON.parse(raw.toString());

        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
            vscode.window.showErrorMessage("Open a workspace folder first.");
            return;
        }

        // Generate recursively
        await createTree(workspace.uri, json);

        vscode.window.showInformationMessage("Folder structure generated successfully.");
    } catch (err) {
        vscode.window.showErrorMessage("Error: " + err.message);
    }
}

function activate(context) {
    const command = vscode.commands.registerCommand(
        "folderStructureGenerator.generateFromSgmtr",
        (uri) => generateFromSgmtr(uri)
    );

    context.subscriptions.push(command);
}

function deactivate() {}

module.exports = { activate, deactivate };
