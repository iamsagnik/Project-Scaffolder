const { readFile } = require("../utils/fsUtils");
const fileCache = require("../cache/fileCache");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

async function readFileContent(absPath, relPath, mtime, size) {
  // cache lookup
  const cached = fileCache.get(relPath, mtime, size);
  if (cached) {
    logger.debug("readFileContent", "Cache hit", { relPath });
    return { ok: true, content: cached, cached: true };
  }

  const result = await readFile(absPath);

  // filtered / failed
  if (!result || !result.ok) {
    const reason = result?.reason || "READ_FAILED";

    warnings.recordWarning({
      code: reason,
      message: "File content could not be loaded",
      severity: "info",
      filePath: relPath,
      module: "readFileContent"
    });

    logger.debug("readFileContent", "File skipped", {
      relPath,
      reason
    });

    stats.increment("totalFilesSkipped");

    return { ok: false, reason };
  }

  // success
  fileCache.set(relPath, mtime, size, result.content);
  stats.increment("totalFilesProcessed");

  logger.debug("readFileContent", "File content loaded", {
    relPath,
    size,
    cached: false
  });

  return {
    ok: true,
    content: result.content,
    cached: false
  };
}

module.exports = { readFileContent };