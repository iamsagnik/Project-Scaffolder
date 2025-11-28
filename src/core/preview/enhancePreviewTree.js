const path = require("path");

const { readFileContent } = require("../parser/readFileContent");
const { extractImportsExports } = require("../parser/extractImportsExports");
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
    const absPath = path.join(workspaceRoot, relPath);

    // Workspace escape guard
    if (!isInside(workspaceRoot, absPath)) {
      node.isIgnored = true;

      warnings.recordWarning({
        code: "PATH_ESCAPE_PREVIEW",
        message: "File resolved outside workspace during preview",
        severity: "warn",
        filePath: relPath,
        module: "enhancePreviewTree"
      });

      return;
    }

    // Ignore guard
    const check = matchers.shouldIgnore(relPath);
    if (check.ignored) {
      node.isIgnored = true;
      return;
    }

    // Safe file read
    const result = await readFileContent(absPath, relPath);

    if (!result || !result.ok) {
      node.isIgnored = true;
      return;
    }

    const content = result.content || "";

    // Language detection
    const ext = path.extname(relPath);
    const language = langDetector(ext, content);

    node.language = language || "unknown";

    // Unknown language → no imports/exports
    if (!language || language === "unknown") {
      node.imports = null;
      node.exports = null;
      return;
    }

    // Extract imports/exports (safe by contract)
    const meta = extractImportsExports(content, language);

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

module.exports = {
  enhancePreviewTree
};