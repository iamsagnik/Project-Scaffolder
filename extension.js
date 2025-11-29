const vscode = require("vscode");

const reverseGenerateCommand = require("./src/commands/reverseGenerateCommand");
const { previewSgmtr } = require("./src/commands/previewSgmtr");

const logger  = require("./src/core/diagnostics/logger");
const { throwError } = require("./src/core/diagnostics/errorHandler");

function activate(context) {
  logger.info("extension", "SGMTR extension activating");

  try {
    // Reverse Generate Command
    const reverseDisposable = vscode.commands.registerCommand(
      "sgmtr.reverseGenerate",
      reverseGenerateCommand
    );

    // Preview Command
    const previewDisposable = vscode.commands.registerCommand(
      "sgmtr.preview",
      previewSgmtr
    );

    context.subscriptions.push(reverseDisposable, previewDisposable);

    logger.info("extension", "Commands registered", {
      commands: ["sgmtr.reverseGenerate", "sgmtr.preview"]
    });

  } catch (err) {
    throwError({
      code: "COMMAND_REGISTRATION_FAILED",
      message: "Failed to register VS Code commands",
      severity: "critical",
      filePath: null,
      module: "extension",
      stack: err?.stack
    });
  }
}

function deactivate() {
  logger.info("extension", "SGMTR extension deactivated");
}

module.exports = { 
  activate, 
  deactivate 
};