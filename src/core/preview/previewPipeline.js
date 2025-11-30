const buildPreviewTree = require("./buildPreviewTree");
const enhancePreviewTree = require("./enhancePreviewTree");
const previewTreeToPlain = require("./previewTreeToPlain");
const renderPreviewPanel = require("./renderPreviewPanel");
const buildAsciiTree = require("./buildAsciiTree")

const loadSgmtrIgnore = require("../ignore/loadSgmtrIgnore");
const buildIgnoreMatchers = require("../ignore/buildIgnoreMatchers");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const stats = require("../diagnostics/statsCollector");

async function runPreview({ uri, workspaceRootPath, rawTree, showDetails }) {
  logger.info("previewPipeline", "Starting preview pipeline", {
    filePath: uri?.fsPath,
    showDetails
  });

  stats.startPhase("preview_build");
  const previewRoot = buildPreviewTree(rawTree);
  stats.endPhase("preview_build");

  const patterns = await loadSgmtrIgnore(workspaceRootPath);
  const matchers = buildIgnoreMatchers(patterns);

  if (showDetails) {
    stats.startPhase("preview_enhance");

    try {
      await enhancePreviewTree(
        previewRoot,
        workspaceRootPath,
        matchers
      );
    } catch (err) {
      // Enhancement must never break preview
      warnings.recordWarning(
        warnings.createWarningResponse(
          "previewPipeline",
          "PREVIEW_ENHANCE_FAILED",
          "Preview enhancement failed",
          {
            severity: "warn",
            filePath: uri?.fsPath,
            meta: { error: err?.message }            
          }
        )
      );
    }

    stats.endPhase("preview_enhance");
  }

  stats.startPhase("preview_render");

  const plainTree = previewTreeToPlain(previewRoot);
  const asciiOutput = buildAsciiTree(plainTree);
  renderPreviewPanel(asciiOutput);

  stats.endPhase("preview_render");

  logger.info("previewPipeline", "Preview rendered successfully", {
    filePath: uri?.fsPath
  });

  return {
    ok: true,
    report: {
      nodes: plainTree?.length ?? 0,
      detailed: showDetails === true
    }
  }
}
module.exports = runPreview;