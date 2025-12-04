const path = require("path");

const validateSgmtr = require("./validateSgmtr");
const applyGenerators = require("./applyGenerators");
const normalizeTree = require("./normalizeTree");
const dryRunPlanner = require("./dryRunPlanner");
const verifyGeneration = require("./verifyGeneration");
const { execute } = require("../generator/fileWriter");

const stats = require("../diagnostics/statsCollector");
const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const success = require("../diagnostics/successHandler");
const { throwError } = require("../diagnostics/errorHandler");

async function runForwardPipeline({ uri, workspaceRootPath, rawTree }) {

  logger.info("ForwardPipeline", "Forward pipeline started", {
    filePath: uri?.fsPath,
    workspaceRootPath
  });


  stats.startPhase("validation");
  const semanticResult = await validateSgmtr(rawTree, {
    filePath: uri.fsPath,
    workspaceRootPath
  });
  if (!semanticResult.ok) {
    stats.endPhase("validation");
    throwError({
      code: "SGMTR_SEMANTIC_INVALID",
      message: "SGMTR failed semantic forward validation",
      severity: "error",
      filePath: uri?.fsPath,
      module: "ForwardPipeline",
      meta: semanticResult.errors || null
    });
  }
  stats.endPhase("validation");



  stats.startPhase("generation");
  const generatedTree = applyGenerators(rawTree);

  const normalizedTree = normalizeTree(generatedTree, {
    workspaceRootPath
  });

  const planResult = await dryRunPlanner(normalizedTree);

  if (!planResult.ok) {
    stats.endPhase("generation");
    throwError({
      code: "FORWARD_PLAN_FAILED",
      message: "Failed to build forward generation plan",
      severity: "error",
      filePath: uri?.fsPath,
      module: "ForwardPipeline",
      meta: planResult.errors || null
    });
  }
  const plan = planResult.plan;
  stats.endPhase("generation");


  
  stats.startPhase("writing");
  const writeResult = await execute(plan);
  if (!writeResult.ok) {
    stats.endPhase("writing");
    throwError({
      code: "FORWARD_WRITE_FAILED",
      message: "One or more files failed to write",
      severity: "critical",
      filePath: uri?.fsPath,
      module: "ForwardPipeline",
      meta: writeResult.errors || null
    });
  }
  stats.endPhase("writing");



  stats.startPhase("verify");

  const verifyResult = await verifyGeneration(plan, {
    workspaceRootPath
  });

  if (!verifyResult.ok) {
    throwError({
      code: "FORWARD_VERIFY_FAILED",
      message: "Post-write verification failed",
      severity: "critical",
      filePath: uri?.fsPath,
      module: "ForwardPipeline",
      meta: verifyResult.errors || null
    });
  }

  stats.endPhase("verify");

  const report = {
    plan: {
      filesCreated: plan.files?.length || 0,
      foldersCreated: plan.folders?.length || 0,
      skipped: plan.skipped?.length || 0
    },
    stats: stats.getStats(),
    warnings: warnings.getAllWarnings()
  };

  success.recordSuccessEvents(
    success.createSuccessResponse(
      "forwardPipeline",
      "FORWARD_PIPELINE_OK",
      "Forward generation pipeline completed successfully",
      { meta: report }
    )
  );

  logger.info("ForwardPipeline", "Forward pipeline completed", report);

  return {
    ok: true,
    report
  };
}

module.exports = runForwardPipeline;
