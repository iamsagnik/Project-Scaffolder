const vscode = require("vscode");

const runForwardPipeline = require("../core/forward/forwardGenerationPipeline");
const validateForPreview = require("../core/preview/resolveSgmtrMode");

const logger = require("../core/diagnostics/logger");
const { throwError, wrap } = require("../core/diagnostics/errorHandler");
const stats = require("../core/diagnostics/statsCollector");
const success = require("../core/diagnostics/successHandler");
const warnings = require("../core/diagnostics/warningsCollector");

const { extname } = require("../core/utils/pathUtils");
const { readFile } = require("../core/utils/fsUtils");

const Ajv = require("ajv");
const forwardSchema = require("../../schema/sgmtr-schema-frwd.json");

const ajv = new Ajv({ allErrors: true });

let validateForward;
try {
  validateForward = ajv.compile(forwardSchema);
} catch (err) {
  throwError({
    type: "schema",
    code: "FORWARD_SCHEMA_COMPILE_FAILED",
    message: "Forward SGMTR V1 schema failed to compile at startup",
    severity: "critical",
    module: "generateFromSgmtr",
    stack: err?.stack
  });
}

async function generateFromSgmtrCommand(uri) {

  if (!uri) {
    const active = vscode.window.activeTextEditor;
    if (!active) {
      throwError({
        code: "NO_ACTIVE_FILE",
        message: "No file selected for generation",
        severity: "error",
        filePath: null,
        module: "generateFromSgmtr"
      });
      return;
    }
    uri = active.document.uri;
  }

  if (uri.scheme !== "file") {
    throwError({
      code: "INVALID_URI_SCHEME",
      message: "Generation only supports local files",
      severity: "error",
      filePath: null,
      module: "generateFromSgmtr"
    });
    return;
  }  

  if (!uri.fsPath) {
    throwError({
      code: "INVALID_URI",
      message: "Selected resource does not have a valid file system path",
      severity: "error",
      filePath: null,
      module: "generateFromSgmtr"
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
      module: "generateFromSgmtr"
    });
    return;
  }

  const workspaceRootPath = workspaceFolder.uri.fsPath;

  let assetStat;
  try {
    assetStat = await vscode.workspace.fs.stat(uri);
  } catch {
    throwError({
      code: "STAT_FAILED",
      message: "Unable to access selected file",
      severity: "error",
      filePath: uri.fsPath,
      module: "generateFromSgmtr"
    });
    return;
  }

  if (assetStat.type !== vscode.FileType.File) {
    vscode.window.showErrorMessage("Generation can only be run on files, not folders.");
    return;
  }

  if (extname(uri.fsPath) !== ".sgmtr") {
    vscode.window.showErrorMessage("Generation can only be run on .sgmtr files.");
    return;
  }

  logger.info("generateFromSgmtr", "Forward generation invoked", {
    filePath: uri.fsPath,
    workspaceRootPath
  });

  stats.reset();
  warnings.clearWarnings();
  success.clearAllSuccesses();

  const readRes = await readFile(uri.fsPath);
  if (!readRes.ok) {
    throwError({
      code: "SGMTR_READ_FAILED",
      message: "Failed to read .sgmtr file",
      severity: "error",
      filePath: uri.fsPath,
      module: "generateFromSgmtr"
    });
    return;
  }

  const rawText = readRes.content; 

  stats.startPhase("parsing")
  let rawTree;
  try {
    rawTree = JSON.parse(rawText);
  } catch (err) {
    stats.endPhase("parsing");
    throwError({
      code: "SGMTR_PARSE_FAILED",
      message: "Invalid JSON in .sgmtr file",
      severity: "error",
      filePath: uri.fsPath,
      module: "generateFromSgmtr",
      stack: err?.stack
    });
    return;
  }

  stats.endPhase("parsing");

  const result = await validateForPreview(rawTree);
  const mode = result.mode;

  if (mode !== "forward") {
    throwError({
      code: "NOT_FORWARD_SGMTR",
      message: `Expected forward SGMTR, received ${mode}`,
      severity: "error",
      filePath: uri.fsPath,
      module: "generateFromSgmtr"
    });
    return;
  }

  stats.startPhase("validation");

  const valid = validateForward(rawTree);
  if (!valid) {
    stats.endPhase("validation");
    throwError({
      code: "SGMTR_FORWARD_SCHEMA_INVALID",
      message: "SGMTR file failed Forward V1 schema validation",
      severity: "error",
      filePath: uri.fsPath,
      module: "generateFromSgmtr",
      meta: { ajv: validateForward.errors }
    });
    return;
  }

  stats.endPhase("validation");

    stats.startPhase("ForwardPipeline");

  const res = await wrap(
    () =>
      runForwardPipeline({
        uri,
        workspaceRootPath,
        rawTree
      }),
    { module: "generateFromSgmtr", filePath: uri?.fsPath }
  );

  stats.endPhase("ForwardPipeline");

  if (!res?.ok) {
    logger.error("ForwardCommand", "Forward generation failed", res?.error);

    vscode.window.showErrorMessage(
      "Forward generation failed: " +
        (res?.error?.message || res?.error?.code || "Unknown error")
    );
    return;
  }

  const report = res.value.report;

  success.recordSuccessEvents(
    success.createSuccessResponse(
      "generateFromSgmtr",
      "FORWARD_GENERATION_OK",
      "Forward generation completed successfully",
      {
        filePath: uri.fsPath,
        meta: report
      }
    )
  );

  logger.info("ForwardCommand", "Forward generation completed", report);

  vscode.window.showInformationMessage("Project generated from .sgmtr");
}

module.exports = generateFromSgmtrCommand;