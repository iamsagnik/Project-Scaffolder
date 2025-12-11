const vscode = require("vscode");

const logger = require("../core/diagnostics/logger");
const stats = require("../core/diagnostics/statsCollector");
const { wrap, throwError } = require("../core/diagnostics/errorHandler");
const success = require("../core/diagnostics/successHandler");
const warnings = require("../core/diagnostics/warningsCollector");

const { extname } = require("../core/utils/pathUtils");
const { readFile } = require("../core/utils/fsUtils");

const flowPreviewPipeline = require("../core/flow/flowPreviewPipeline");
const FlowPreviewPanel = require("../core/flowPreview/flowPreviewPanel");

async function flowPreviewCommand(uri, context) {

  if (!context) {
    vscode.window.showErrorMessage("Flow Preview: Extension context is missing.");
    logger.error("flowPreview", "Context missing in command");
    return;
  }

  if (!uri) {
    const active = vscode.window.activeTextEditor;
    if (!active) {
      throwError({
        code: "NO_ACTIVE_FILE",
        message: "No file selected for Flow Preview",
        severity: "error",
        filePath: null,
        module: "flowPreview"
      });
      return;
    }
    uri = active.document.uri;
  }

  if (!uri || !uri.fsPath) {
    throwError({
      code: "INVALID_URI",
      message: "Selected resource does not have a valid file system path",
      severity: "error",
      filePath: null,
      module: "flowPreview"
    });
    return;
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (!workspaceFolder) {
    throwError({
      code: "OUTSIDE_WORKSPACE",
      message: "Selected file is not inside any workspace folder",
      severity: "error",
      filePath: uri.fsPath,
      module: "flowPreview"
    });
    return;
  }

  const workspaceRootPath = workspaceFolder.uri.fsPath;

  let fileStat;
  try {
    fileStat = await vscode.workspace.fs.stat(uri);
  } catch {
    throwError({
      code: "STAT_FAILED",
      message: "Unable to access selected file",
      severity: "error",
      filePath: uri.fsPath,
      module: "flowPreview"
    });
    return;
  }

  if (fileStat.type !== vscode.FileType.File) {
    vscode.window.showErrorMessage("Flow Preview can only be run on files.");
    return;
  }

  const extension = extname(uri.fsPath);

  const supported = [".java", ".cpp", ".h", ".hpp", ".cc", ".cxx", ".js", ".ts", ".py"];
  if (!supported.includes(extension)) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "flowPreview",
        "UNSUPPORTED_FILE",
        "Unsupported file type for Flow Preview",
        {
          severity: "warn",
          filePath: uri.fsPath,
          meta: { extension }
        }
      )
    );

    vscode.window.showErrorMessage(
      `Flow Preview does not support '${extension}' files yet.`
    );
    return;
  }

  logger.info("flowPreview", "Flow Preview invoked", {
    filePath: uri.fsPath,
    workspaceRootPath,
    extension
  });

  stats.startPhase("flow_read_file");

  const readRes = await readFile(uri.fsPath);

  if (!readRes.ok) {
    stats.endPhase("flow_read_file");

    throwError({
      code: "FLOW_READ_FAILED",
      message: "Failed to read file for Flow Preview",
      severity: "error",
      filePath: uri.fsPath,
      module: "flowPreview",
      meta: { reason: readRes.reason }
    });
    return;
  }

  const rawCode = readRes.content;
  stats.endPhase("flow_read_file");

  stats.startPhase("FlowPreviewPipeline");

  const res = await wrap(
    () =>
      flowPreviewPipeline(rawCode, uri.fsPath),
    { module: "flowPreview", filePath: uri.fsPath }
  );

  stats.endPhase("FlowPreviewPipeline");

  if (!res?.ok) {
    logger.error("flowPreview", "Flow Preview pipeline failed", res?.error);

    vscode.window.showErrorMessage(
      "Flow Preview failed: " +
        (res?.error?.message || res?.error?.code || "Unknown error")
    );
    return;
  }

  success.recordSuccessEvents(
    success.createSuccessResponse(
      "flowPreview",
      "FLOW_PREVIEW_OK",
      "Flow Preview generated successfully",
      {
        filePath: uri.fsPath,
      }
    )
  );

  try {
    logger.info("flowPreview", "Flow Preview about to start", { filePath: uri.fsPath });

    await FlowPreviewPanel.createOrShow(
      context,
      res.value.graph,
      uri
    );
    
    logger.info("flowPreview", "Flow Preview completed", { filePath: uri.fsPath });
  } catch (err) {
    logger.error("flowPreview", "UI Creation Failed", { error: err.message });
    vscode.window.showErrorMessage("Failed to open Flow Preview UI.");
  }
}

module.exports = flowPreviewCommand;
