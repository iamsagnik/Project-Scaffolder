const path = require("path");

const loadGitignore = require("./helpers/loadGitignore");
const detectSystemIgnores = require("./helpers/detectSystemIgnores");
const mergeIgnorePatterns = require("./helpers/mergeIgnorePatterns");
const validateIgnorePatterns = require("./helpers/validateIgnorePatterns");
const writeSgmtrIgnore = require("./helpers/writeSgmtrIgnore");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");
const success = require("../diagnostics/successHandler");
const { throwError } = require("../diagnostics/errorHandler");

async function generateSgmtrIgnore({ workspaceRoot }) {

  logger.info("ignorePipeline", "Starting .sgmtrignore generation pipeline", {
    workspaceRoot
  });

  stats.startPhase("load_gitignore");

  let gitignoreData;
  try {
    gitignoreData = await loadGitignore(workspaceRoot);
  } catch (err) {
    stats.endPhase("load_gitignore");
    throwError({
      code: "GITIGNORE_LOAD_FAILED",
      message: "Failed to load .gitignore",
      severity: "warn",
      filePath: path.join(workspaceRoot, ".gitignore"),
      module: "ignorePipeline",
      stack: err?.stack
    });
  }

  const gitPatterns = gitignoreData?.patterns || [];
  const gitignoreFound = gitignoreData?.found === true;

  stats.endPhase("load_gitignore");


  stats.startPhase("detect_system");

  const autoPatterns = await detectSystemIgnores(workspaceRoot);

  stats.endPhase("detect_system");


  stats.startPhase("merge");

  const { finalList, addedPatterns } = mergeIgnorePatterns(
    gitPatterns,
    autoPatterns
  );

  stats.endPhase("merge");


  stats.startPhase("validate");

  const validation = validateIgnorePatterns(finalList);

  if (!validation.ok) {
    stats.endPhase("validate");
    throwError({
      code: "SGMTRIGNORE_VALIDATION_FAILED",
      message: "Generated .sgmtrignore contains invalid patterns",
      severity: "error",
      filePath: path.join(workspaceRoot, ".sgmtrignore"),
      module: "ignorePipeline",
      meta: validation.errors
    });
  }

  stats.endPhase("validate");


  stats.startPhase("writing");

  const outputPath = path.join(workspaceRoot, ".sgmtrignore");

  try {
    await writeSgmtrIgnore(outputPath, finalList);
  } catch (err) {
    stats.endPhase("writing");
    throwError({
      code: "SGMTRIGNORE_WRITE_FAILED",
      message: "Failed to write .sgmtrignore",
      severity: "critical",
      filePath: outputPath,
      module: "ignorePipeline",
      stack: err?.stack
    });
  }

  stats.endPhase("writing");


  const report = {
    written: true,
    outputPath,
    gitignoreFound,
    addedPatterns,
    stats: stats.getStats(),
    warnings: warnings.getAllWarnings()
  };

  success.recordSuccessEvents(
    success.createSuccessResponse(
      "ignorePipeline",
      "SGMTRIGNORE_PIPELINE_OK",
      ".sgmtrignore generation pipeline completed successfully",
      { meta: report }
    )
  );

  logger.info("ignorePipeline", "Pipeline completed", report);

  return {
    ok: true,
    report
  };
}

module.exports = generateSgmtrIgnore;
