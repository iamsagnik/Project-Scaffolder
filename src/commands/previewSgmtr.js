const vscode = require("vscode");
const path = require("path");

const { runPreview } = require("../core/preview/previewPipeline");

const logger = require("../core/diagnostics/logger");
const { throwError, wrap } = require("../core/diagnostics/errorHandler");
const stats = require("../core/diagnostics/statsCollector");
const success = require("../core/diagnostics/successHandler");

const Ajv = require("ajv");
const schema = require("../../schema/sgmtr-schema.json");

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

async function previewSgmtr(uri) {
  return wrap(async () => {
     
    // ENVIRONMENT VALIDATION
     
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      throwError({
        code: "NO_WORKSPACE",
        message: "No workspace is currently open",
        severity: "error",
        filePath: null,
        module: "previewSgmtr"
      });
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

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

    if (path.extname(uri.fsPath) !== ".sgmtr") {
      vscode.window.showErrorMessage("Preview can only be run on .sgmtr files.");
      return;
    }

    logger.info("previewSgmtr", "Preview command invoked", {
      filePath: uri.fsPath,
      workspaceRoot
    });

     
    // LOAD + PARSE + SCHEMA GATE
     
    stats.startPhase?.("preview_load");

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

    stats.endPhase?.("preview_load");

     
    // PREVIEW MODE SELECTION
     
    const choice = await vscode.window.showQuickPick(
      ["Structure only", "Structure + imports/exports"],
      { placeHolder: "Select preview mode" }
    );

    if (!choice) return; // user cancelled

    const showDetails = choice === "Structure + imports/exports";

    logger.info("previewSgmtr", "Preview mode selected", {
      showDetails
    });

     
    // DELEGATE TO PREVIEW PIPELINE
     
    await runPreview({
      uri,
      workspaceRoot,
      rawTree,
      showDetails
    });
 
    // SUCCESS RECORD
    success.recordSuccessEvents?.({
      code: "PREVIEW_OK",
      message: "Preview rendered successfully",
      module: "previewSgmtr",
      filePath: uri.fsPath
    });

  }, {
    module: "previewSgmtr",
    filePath: uri?.fsPath
  });
}

module.exports = {
  previewSgmtr
};
