const vscode = require("vscode");

const { reverseGenerate } = require("../core/reverse/reverseGenerate");
const { wrap } = require("../core/diagnostics/errorHandler");
const logger = require("../core/diagnostics/logger");
const stats = require("../core/diagnostics/statsCollector");
const warnings = require("../core/diagnostics/warningsCollector");
const successes = require("../core/diagnostics/successHandler");

async function reverseGenerateCommand() {
  const ws = vscode.workspace.workspaceFolders;

  if (!ws || ws.length === 0) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const rootPath = ws[0].uri.fsPath;

  stats.reset();
  warnings.clearWarnings();
  successes.clearAllSuccesses();

  logger.info("ReverseCommand", "Reverse generation started", { rootPath });

  try {
    const wrapped = wrap(
      () => reverseGenerate(rootPath),
      { module: "ReverseCommand", filePath: rootPath }
    );

    const res = await wrapped();

    if (!res?.ok) {
      logger.error("ReverseCommand", "Reverse generation failed", res?.error);

      vscode.window.showErrorMessage(
        "Reverse generation failed: " +
        (res?.error?.message || res?.error?.code || "Unknown error")
      );
      return;
    }

    logger.info("ReverseCommand", "Reverse generation completed", res.report);

    vscode.window.showInformationMessage(
      "Generated .sgmtr at: " + res.report.outputPath
    );

  } catch (err) {
    logger.error("ReverseCommand", "Fatal reverse generation crash", err);

    vscode.window.showErrorMessage(
      "Reverse generation crashed: " +
      (err?.message || err?.code || "Unknown fatal error")
    );
  }
}

module.exports = { 
  reverseGenerateCommand 
};
