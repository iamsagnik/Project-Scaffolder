const vscode = require("vscode");

const reverseGenerate = require("../core/reverse/reverseGeneratePipeline");
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

  const res = await wrap(
    () => reverseGenerate(rootPath),
    { module: "ReverseCommand", filePath: rootPath }
  );

  if (!res?.ok) {
    logger.error("ReverseCommand", "Reverse generation failed", res?.error);

    vscode.window.showErrorMessage(
      "Reverse generation failed: " +
      (res?.error?.message || res?.error?.code || "Unknown error")
    );
    return;
  }

  const report = res.value.report;

  const successEvent = successes.createSuccessResponse(
    "reverse",
    "REVERSE_GENERATE_OK",
    "Reverse generation completed",
    {
      filePath: report.outputPath,
      meta: report
    }
  );

  successes.recordSuccessEvents(successEvent);

  logger.info("ReverseCommand", "Reverse generation completed", report);

  vscode.window.showInformationMessage(
    "Generated .sgmtr at: " + res.value.report.outputPath
  );

  const summary = stats.getStats();
  logger.info("ReverseStats", "Reverse generation summary", summary);

}

module.exports = reverseGenerateCommand;
