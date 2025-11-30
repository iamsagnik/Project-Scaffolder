const path = require("path");

const { readFile } = require("../utils/fsUtils");
const extractImportsExports = require("../parser/extractImportsExports");
const langDetector = require("../utils/langDetector");
const { isInside, toPosix } = require("../utils/pathUtils");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const stats = require("../diagnostics/statsCollector");

async function enhancePreviewTree(previewRoot, workspaceRoot, matchers) {
  if (!previewRoot || typeof previewRoot !== "object") return;

  async function walk(node) {
    if (!node) return;

    // Folder
    if (node.type === "folder" && Array.isArray(node.children)) {
      for (const child of node.children) {
        await walk(child);
      }
      return;
    }

    // File
    if (node.type !== "file") return;

    const relPath = toPosix(node.relPath || "");

    if (path.isAbsolute(relPath)) {
      node.isIgnored = true;
      warnings.recordWarning(
        warnings.createWarningResponse(
          "enhancePreviewTree",
          "ABSOLUTE_PATH_PREVIEW",
          "Absolute path detected in preview",
          {
            severity: "warn",
            filePath: relPath,
          }
        )
      );
      return;
    }

    const absPath = path.join(workspaceRoot, relPath);

    // Workspace escape guard
    if (!isInside(workspaceRoot, absPath)) {
      node.isIgnored = true;

      warnings.recordWarning(
        warnings.createWarningResponse(
          "enhancePreviewTree",
          "PATH_ESCAPE_PREVIEW",
          "File resolved outside workspace during preview",
          {
            severity: "warn",
            filePath: relPath,
          }
        )
      );
      return;
    }

    // Ignore guard
    let ignored = false;
    try {
      if (matchers?.shouldIgnore) {
        const check = matchers.shouldIgnore(relPath);
        ignored = check?.ignored === true;
      }
    } catch (err) {
      warnings.recordWarning(
        warnings.createWarningResponse(
          "enhancePreviewTree",
          "IGNORE_MATCHER_FAILED",
          "Ignore matcher failed during preview",
          {
            severity: "warn",
          filePath: relPath,
          meta: { error: err?.message }
          }
        )
      );
    }

    if (ignored) {
      node.isIgnored = true;
      return;
    }

    // Safe file read
    let result;
    try {
      result = await readFile(absPath, relPath);
    } catch (err) {
      node.isIgnored = true;
      return;
    }

    if (!result || !result.ok) {
      node.isIgnored = true;
      return;
    }

    const content = result.content || "";

    // Language detection
    let language = "unknown";
    try {
      language = langDetector(relPath, content);
    } catch (err) {
      warnings.recordWarning(
        warnings.createWarningResponse(
          "enhancePreviewTree",
          "LANG_DETECT_FAILED",
          "Language detection failed",
          {
            severity: "warn",
            filePath: relPath,
            meta: { error: err?.message }
          }
        )
      );
    }

    node.language = language || "unknown";

    // Unknown language → no imports/exports
    if (!language || language === "unknown") {
      node.imports = null;
      node.exports = null;
      return;
    }

    // Extract imports/exports (safe by contract)
    let meta = { imports: [], exports: [] };
    try {
      meta = extractImportsExports(content, language);
    } catch (err) {
      warnings.recordWarning(
        warnings.createWarningResponse(
          "enhancePreviewTree",
          "IMPORT_EXPORT_CRASH",
          "Import/export extraction crashed",
          {
            severity: "warn",
          filePath: relPath,
          meta: { error: err?.message }
          }
        )
      );
    }

    node.imports = Array.isArray(meta.imports) ? meta.imports : [];
    node.exports = Array.isArray(meta.exports) ? meta.exports : [];

    stats.increment("totalFilesProcessed");

    logger.debug("enhancePreviewTree", "File enhanced", {
      relPath,
      language,
      importCount: node.imports.length,
      exportCount: node.exports.length
    });
  }

  await walk(previewRoot);
}

module.exports = enhancePreviewTree;