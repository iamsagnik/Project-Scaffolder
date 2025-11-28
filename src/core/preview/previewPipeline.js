const { buildPreviewTree } = require("./buildPreviewTree");
const { enhancePreviewTree } = require("./enhancePreviewTree");
const { previewTreeToPlain } = require("./previewTreeToPlain");
const { renderPreviewPanel } = require("./renderPreviewPanel");

const { loadSgmtrIgnore } = require("../ignore/loadSgmtrIgnore");
const { buildIgnoreMatchers } = require("../ignore/buildIgnoreMatchers");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const stats = require("../diagnostics/statsCollector");
const { throwError } = require("../diagnostics/errorHandler");

async function runPreview({ uri, workspaceRoot, rawTree, showDetails }) {
  try {
    logger.info("previewPipeline", "Starting preview pipeline", {
      filePath: uri?.fsPath,
      showDetails
    });

    // -------------------------------
    // PHASE: BUILD PREVIEW TREE
    // -------------------------------
    stats.startPhase?.("preview_build");

    const previewRoot = buildPreviewTree(rawTree);

    stats.endPhase?.("preview_build");

    // -------------------------------
    // PHASE: IGNORE INITIALIZATION
    // -------------------------------
    let matchers = null;

    try {
      const patterns = await loadSgmtrIgnore(workspaceRoot);
      matchers = buildIgnoreMatchers(patterns);
    } catch (err) {
      warnings.recordWarning({
        code: "PREVIEW_IGNORE_INIT_FAILED",
        message: "Failed to initialize ignore system for preview",
        severity: "warn",
        filePath: workspaceRoot,
        module: "previewPipeline"
      });

      // Fallback: no ignores
      matchers = buildIgnoreMatchers([]);
    }

    // -------------------------------
    // PHASE: OPTIONAL ENHANCEMENT
    // -------------------------------
    if (showDetails) {
      stats.startPhase?.("preview_enhance");

      try {
        await enhancePreviewTree(
          previewRoot,
          workspaceRoot,
          matchers
        );
      } catch (err) {
        // Enhancement must never break preview
        warnings.recordWarning({
          code: "PREVIEW_ENHANCE_FAILED",
          message: "Preview enhancement failed",
          severity: "warn",
          filePath: uri?.fsPath,
          module: "previewPipeline",
          meta: { error: err?.message }
        });
      }

      stats.endPhase?.("preview_enhance");
    }

    // -------------------------------
    // PHASE: RENDER
    // -------------------------------
    stats.startPhase?.("preview_render");

    const plainTree = previewTreeToPlain(previewRoot);
    const asciiOutput = require("./buildAsciiTree")
      .buildAsciiTree(plainTree);

    renderPreviewPanel(asciiOutput);

    stats.endPhase?.("preview_render");

    logger.info("previewPipeline", "Preview rendered successfully", {
      filePath: uri?.fsPath
    });

  } catch (err) {
    // Any fatal error in the pipeline comes here
    throwError({
      code: "PREVIEW_PIPELINE_FAILED",
      message: "Preview pipeline failed",
      severity: "critical",
      filePath: uri?.fsPath,
      module: "previewPipeline",
      stack: err?.stack,
      meta: { original: err?.message }
    });
  }
}

module.exports = {
  runPreview
};