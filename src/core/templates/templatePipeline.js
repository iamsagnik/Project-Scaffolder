const vscode = require("vscode");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const success = require("../diagnostics/successHandler");
const { wrap, throwError } = require("../diagnostics/errorHandler");

const loadTemplates = require("./templateLoader");
const pickTemplate = require("./templatePicker");
const validateTemplateHeader = require("../../../templates/schema/validateTemplateHeader");

const runForwardPipeline = require("../forward/forwardGenerationPipeline");

async function runTemplatePipeline({ uri, workspaceRoot }) {

  logger.info("templatePipeline", "Template pipeline started", {
    workspaceRoot,
    sourceUri: uri?.fsPath || null
  });



  stats.startPhase("template_load");
  let registry;
  try {
    registry = await loadTemplates(workspaceRoot);   // map
  } catch (err) {
    throwError({
      code: "TEMPLATE_LOAD_FAILED",
      message: "Failed to load templates",
      severity: "error",
      module: "templatePipeline",
      stack: err?.stack
    });
  }
  if (!registry) {
    throwError({
      code: "TEMPLATE_NOT_FOUND",
      message: "Selected template could not be resolved after loading",
      severity: "error",
      module: "templatePipeline"
    });
  }
  stats.endPhase("template_load");




  stats.startPhase("template_pick");

  const pickedTemplateId = await pickTemplate(registry);

  stats.endPhase("template_pick");

  if (!pickedTemplateId) {
    logger.info("templatePipeline", "Template selection cancelled");
    return { ok: false };
  }

  const selectedTemplate = registry.get(pickedTemplateId);


  stats.startPhase("template_header_validation");

  const headerValidation = await validateTemplateHeader(
    selectedTemplate.templateMeta
  );

  if (!headerValidation?.ok) {
    throwError({
      code: "TEMPLATE_HEADER_INVALID",
      message: headerValidation?.error?.message || "Invalid template header",
      severity: "error",
      module: "templatePipeline",
      meta: headerValidation?.error
    });
  }

  stats.endPhase("template_header_validation");

  const targetUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select Target Folder"
  });

  if (!targetUri || !targetUri.length) {
    logger.info("templatePipeline", "Target folder selection cancelled");
    return { ok: false };
  }

  const targetPath = targetUri[0].fsPath;

  const forwardTree = selectedTemplate.forwardTree;

  if (!forwardTree || typeof forwardTree !== "object") {
    throwError({
      code: "FORWARD_TREE_MISSING",
      message: "Selected template does not contain a valid forwardTree",
      severity: "critical",
      module: "templatePipeline"
    });
  }

  stats.startPhase("template_forward_handoff");

  const forwardRes = await wrap(
    () =>
      runForwardPipeline({
        uri: uri || { fsPath: targetPath },
        workspaceRootPath: targetPath,
        rawTree: forwardTree
      }),
    { module: "templatePipeline", filePath: targetPath }
  );

  stats.endPhase("template_forward_handoff");

  if (!forwardRes.ok) {
    return { ok: false, error: forwardRes.error };
  }

  const templateId = selectedTemplate.templateMeta.id;

  success.recordSuccessEvents(
    success.createSuccessResponse(
      "templatePipeline",
      "TEMPLATE_GENERATION_OK",
      "Template-based project generated successfully",
      {
        filePath: targetPath,
        meta: {
          templateId,
          forwardReport: forwardRes.value.report
        }
      }
    )
  );

  logger.info("templatePipeline", "Template generation completed", {
    templateId,
    targetPath
  });

  return {
    ok: true,
    value: {
      templateId,
      targetPath,
      report: forwardRes.value.report
    }
  };
}

module.exports = runTemplatePipeline;