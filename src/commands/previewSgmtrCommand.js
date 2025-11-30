const vscode = require("vscode");

const runPreview = require("../core/preview/previewPipeline");

const logger = require("../core/diagnostics/logger");
const { throwError, wrap } = require("../core/diagnostics/errorHandler");
const stats = require("../core/diagnostics/statsCollector");
const success = require("../core/diagnostics/successHandler");

const Ajv = require("ajv");
const schema = require("../../schema/sgmtr-schema.json");

const { extname } = require("../core/utils/pathUtils");

const ajv = new Ajv({ allErrors: true });
let validate;
try {
  validate = ajv.compile(schema);
} catch (e) {
  throw new Error("Schema compilation failed at startup");
}

async function previewSgmtrCommand(uri) {   

  if (!uri) {
    const active = vscode.window.activeTextEditor;
    if (!active) {
      throwError({
        code: "NO_ACTIVE_FILE",
        message: "No file selected for preview",
        severity: "error",
        filePath: null,
        module: "previewSgmtr"
      });
      return;
    }
    uri = active.document.uri;
  }

  if (!uri.fsPath) {
    throwError({
      code: "INVALID_URI",
      message: "Selected resource does not have a valid file system path",
      severity: "error",
      filePath: null,
      module: "previewSgmtr"
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
      module: "previewSgmtr"
    });
    return;
  }

  const workspaceRootPath = workspaceFolder.uri.fsPath;

  if (uri.scheme !== "file") {
    vscode.window.showErrorMessage("Preview only supports local files.");
    return;
  }

  let assetStat;
  try {
    assetStat = await vscode.workspace.fs.stat(uri);
  } catch {
    throwError({
      code: "STAT_FAILED",
      message: "Unable to access selected file",
      severity: "error",
      filePath: uri.fsPath,
      module: "previewSgmtr"
    });
    return;
  }

  if (assetStat.type !== vscode.FileType.File) {
    vscode.window.showErrorMessage("Preview can only be run on files, not folders.");
    return;
  }


  if (extname(uri.fsPath) !== ".sgmtr") {
    vscode.window.showErrorMessage("Preview can only be run on .sgmtr files.");
    return;
  }

  logger.info("previewSgmtr", "Preview command invoked", {
    filePath: uri.fsPath,
    workspaceRootPath
  });

  // LOAD + PARSE + SCHEMA GATE
    
  stats.startPhase("sgmtr_read");

  let rawText;
  try {
    const raw = await vscode.workspace.fs.readFile(uri);
    rawText = Buffer.from(raw).toString("utf8");
  } catch (err) {
    throwError({
      code: "SGMTR_READ_FAILED",
      message: "Failed to read .sgmtr file",
      severity: "error",
      filePath: uri.fsPath,
      module: "previewSgmtr",
      stack: err?.stack
    });
    return;
  }

  let rawTree;
  try {
    rawTree = JSON.parse(rawText);
  } catch (err) {
    throwError({
      code: "SGMTR_PARSE_FAILED",
      message: "Invalid JSON in .sgmtr file",
      severity: "error",
      filePath: uri.fsPath,
      module: "previewSgmtr",
      stack: err?.stack
    });
    return;
  }

  const valid = validate(rawTree);
  if (!valid) {
    throwError({
      code: "SGMTR_SCHEMA_INVALID",
      message: "SGMTR file failed schema validation",
      severity: "error",
      filePath: uri.fsPath,
      module: "previewSgmtr",
      meta: { errors: validate.errors }
    });
    return;
  }

  stats.endPhase("sgmtr_read");

  // preview mode selection
    
  const choice = await vscode.window.showQuickPick(
    ["Structure only", "Structure + imports/exports"],
    { placeHolder: "Select preview mode" }
  );

  if (!choice) return; // user cancelled

  const showDetails = choice === "Structure + imports/exports";

  logger.info("previewSgmtr", "Preview mode selected", {
    showDetails
  });

    
  // delegate the preview pipeline

  stats.startPhase("PreviewPipeline");

  const res = await wrap(
      () => runPreview({
              uri,
              workspaceRootPath,
              rawTree,
              showDetails
            }),
      { module: "previewSgmtr", filePath: uri?.fsPath }
    );
  stats.endPhase("PreviewPipeline");

  if (!res?.ok) {
    logger.error("PreviewCommand", "Preview generation failed", res?.error);

    vscode.window.showErrorMessage(
      "Preview generation failed: " +
      (res?.error?.message || res?.error?.code || "Unknown error")
    );
    return;
  }

  const report = res.value.report;    

  // SUCCESS RECORD
  success.recordSuccessEvents(
    success.createSuccessResponse(
      "previewSgmtr",
      "PREVIEW_OK",
      "Preview rendered successfully",
      {
        filePath: uri.fsPath,
        meta: report
      }
    )
  );

  logger.info("PreviewCommand", "Preview generation completed", report);

  vscode.window.showInformationMessage(
    "Showing the Preview"
  );
}

module.exports = previewSgmtrCommand;
