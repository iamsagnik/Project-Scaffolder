const vscode = require("vscode");

const runGenerateIgnore = require("../core/ignore/generateSgmtrIgnorePipeline");

const logger = require("../core/diagnostics/logger");
const { wrap, throwError } = require("../core/diagnostics/errorHandler");
const success = require("../core/diagnostics/successHandler");

async function generateSgmtrIgnoreCommand() {

  const ws = vscode.workspace.workspaceFolders;
  if (!ws || ws.length === 0) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const workspaceRoot = ws[0].uri.fsPath;

  logger.info("generateSgmtrIgnore", "Generate .sgmtrignore command invoked", {
    workspaceRoot
  });

  // Check if .sgmtrignore already exists
  const targetUri = vscode.Uri.file(`${workspaceRoot}/.sgmtrignore`);

  let exists = false;
  try {
    await vscode.workspace.fs.stat(targetUri);
    exists = true;
  } catch (_) {
    exists = false;
  }

  if (exists) {
    const choice = await vscode.window.showWarningMessage(
      ".sgmtrignore already exists. Overwrite?",
      "Overwrite",
      "Cancel"
    );

    if (choice !== "Overwrite") {
      return;
    }
  }

  const res = await wrap(
    () => runGenerateIgnore({ workspaceRoot }),
    { module: "generateSgmtrIgnore", filePath: workspaceRoot }
  );

  if (!res.ok) {
    logger.error("generateSgmtrIgnore", "Generation failed", res.error);

    vscode.window.showErrorMessage(
      "Failed to generate .sgmtrignore: " +
      (res.error.message || res.error.code || "Unknown error")
    );
    return;
  }

  const report = res.value.report;

  success.recordSuccessEvents(
    success.createSuccessResponse(
      "generateSgmtrIgnore",
      "SGMTRIGNORE_OK",
      ".sgmtrignore generated successfully",
      {
        filePath: `${workspaceRoot}/.sgmtrignore`,
        meta: report
      }
    )
  );

  logger.info("generateSgmtrIgnore", "Generation completed", report);

  vscode.window.showInformationMessage(".sgmtrignore generated successfully");
}

module.exports = generateSgmtrIgnoreCommand;
