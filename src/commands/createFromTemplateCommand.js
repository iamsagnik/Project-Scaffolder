const vscode = require("vscode");

const logger = require("../core/diagnostics/logger");
const stats = require("../core/diagnostics/statsCollector");
const { wrap, throwError } = require("../core/diagnostics/errorHandler");
const success = require("../core/diagnostics/successHandler");

const runTemplatePipeline = require("../core/templates/templatePipeline");

async function createFromTemplateCommand(uri) {

  logger.info("createFromTemplate", "Create from template invoked", {
    uri: uri?.fsPath || null
  });

  let workspaceFolder;

  if (uri) {
    workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  } else if (vscode.workspace.workspaceFolders?.length) {
    workspaceFolder = vscode.workspace.workspaceFolders[0];
  }

  if (!workspaceFolder) {
    throwError({
      code: "NO_WORKSPACE",
      message: "No workspace folder found for template generation",
      severity: "error",
      filePath: uri?.fsPath || null,
      module: "createFromTemplate"
    });
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;

  logger.info("createFromTemplate", "Workspace resolved", {
    workspaceRoot
  })

  stats.startPhase("template_pipeline");
  const res = await wrap(
    () => runTemplatePipeline({ uri, workspaceRoot}),
    { module: "createFromTemplate", filePath: uri.fsPath }
  );
  stats.endPhase("template_pipeline");

  console.log("REPORT:", res?.value?.report);

  if (!res?.ok) {
    logger.error("createFromTemplate", "Template generation failed", res?.error);

    vscode.window.showErrorMessage(
      "Template generation failed: " +
      (res?.error?.message || "Unknown error")
    );
    return;
  }

  const { templateId, targetPath } = res.value;
  
  success.recordSuccessEvents(
    success.createSuccessResponse(
      "createFromTemplate",
      "TEMPLATE_PROJECT_CREATED",
      "Project created successfully from template",
      {
        filePath: targetPath,
        meta: { templateId }
      }
    )
  );

  vscode.window.showInformationMessage(
    "Project created successfully from template."
  );

  logger.info("createFromTemplate", "Project created from template", {
    templateId: res.templateId,
    targetPath
  });

  const summary = stats.getStats();
  logger.info("ReverseStats", "Reverse generation summary", summary);
}

module.exports = createFromTemplateCommand;