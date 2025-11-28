const { fileCache } = require("../cache/fileCache");
const { readFileContent } = require("../parser/readFileContent");
const { basename, dirname, toPosix } = require("../utils/pathUtils");
const { detect } = require("../parser/langDetector");
const { extract } = require("../parser/extractImportsExports");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");
const { throwError } = require("../diagnostics/errorHandler");

async function processFileMetadata(fileObj) {
  const { absPath, relPath, size, mtime, workspaceRoot } = fileObj;

  const cachedMeta = fileCache.get(relPath, mtime, size, workspaceRoot);
  if (cachedMeta && cachedMeta.__type === "meta") {
    logger.debug("processFileMetadata", "Metadata cache hit", { relPath });
    return { ok: true, meta: cachedMeta.value, cached: true };
  }

  const readRes = await readFileContent(absPath, relPath, mtime, size);
  if (!readRes.ok) {
    warnings.recordWarning({
      code: readRes.reason,
      message: "File content unavailable for metadata",
      severity: "info",
      filePath: relPath,
      module: "processFileMetadata"
    });
    return { ok: false, reason: readRes.reason };
  }

  const content = readRes.content;
  const lang = detect(relPath, content);

  let imports = [];
  let exports = [];

  try {
    const extracted = extract(content, lang);
    imports = extracted.imports || [];
    exports = extracted.exports || [];
  } catch (err) {
    warnings.recordWarning({
      code: "IMPORT_EXPORT_PARSE_FAILED",
      message: "Import/export extraction failed",
      severity: "warn",
      filePath: relPath,
      module: "processFileMetadata"
    });
  }

  const meta = {
    path: relPath,
    lang,
    imports,
    exports,
    size,
    mtime,
    fileName: basename(relPath),
    dir: toPosix(dirname(relPath))
  };

  fileCache.set(
    relPath,
    mtime,
    size,
    { __type: "meta", value: meta },
    workspaceRoot
  );

  stats.increment("totalFilesProcessed");

  logger.debug("processFileMetadata", "Metadata generated", {
    relPath,
    lang
  });

  return { ok: true, meta, cached: false };
}

module.exports = { processFileMetadata };