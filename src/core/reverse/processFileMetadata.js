const fileCache = require("../cache/fileCache");
const { readFile } = require("../utils/fsUtils");
const { basename, dirname } = require("../utils/pathUtils");
const detectLang = require("../utils/langDetector");
const extractImportsExports = require("../parser/extractImportsExports");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

async function processFileMetadata(fileObj) {
  const { absPath, relPath, size, mtime, workspaceRoot } = fileObj;

  const cachedMeta = fileCache.get(relPath, mtime, size, workspaceRoot);
  if (cachedMeta) {
    logger.debug("processFileMetadata", "Metadata cache hit", { relPath });
    return { ok: true, value: cachedMeta, cached: true };
  }

  const readRes = await readFile(absPath);
  if (!readRes.ok) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "processFileMetadata",
        readRes.reason,
        "File content unavailable for metadata",
        {
          severity: "info",
          filePath: relPath,
        }
      )
    );
    return { ok: false, reason: readRes?.reason || "READ_FAILED" };
  }

  const content = readRes.content;
  const lang = detectLang(relPath, content);

  let imports = [];
  let exports = [];

  try {
    const extracted = extractImportsExports(content, lang);
    imports = extracted.imports || [];
    exports = extracted.exports || [];
  } catch (err) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "processFileMetadata",
        "IMPORT_EXPORT_PARSE_FAILED",
        "Import/export extraction failed",
        {
          severity: "warn",
          filePath: relPath, 
        }
      )
    );
  }

  const value = {
    path: relPath,
    lang,
    imports,
    exports,
    size,
    mtime,
    fileName: basename(relPath),
    dir: dirname(relPath)
  };

  fileCache.set(relPath, mtime, size, value, workspaceRoot);

  stats.incrementFilesProcessed();

  logger.debug("processFileMetadata", "Metadata generated", {
    relPath,
    lang
  });

  return { ok: true, value, cached: false };
}

module.exports = processFileMetadata;