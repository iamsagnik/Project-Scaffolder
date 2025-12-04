const fileCache = require("../cache/fileCache");
const { readFile } = require("../utils/fsUtils");
const { basename, dirname } = require("../utils/pathUtils");
const detectLang = require("../utils/langDetector");
const extractImportsExports = require("../parser/extractImportsExports");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");

async function processFileMetadata(fileObj) {
  logger.info("processFileMetadata", "ENTER", {
    relPath: fileObj.relPath
  });
  try{
    const { absPath, relPath, size, mtime, workspaceRoot } = fileObj;

    const cachedMeta = fileCache.get(relPath, mtime, size, workspaceRoot);
    if (cachedMeta) {
      logger.debug("processFileMetadata", "Metadata cache hit", { relPath });
      return { ok: true, value: cachedMeta, cached: true };
    }
    //logger.info("processFileMetadata", "CACHE_CHECK_DONE", { relPath });

    const readRes = await readFile(absPath);
    //logger.info("processFileMetadata", "READFILE_DONE", { relPath });
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
    let lang = "unknown";
    try {
      lang = detectLang(relPath, content);
    } catch {
      lang = "unknown";
    }
    //logger.info("processFileMetadata", "READFILE_DONE", { relPath });

    let imports = [];
    let exports = [];

    try {
      const extracted = extractImportsExports(content, lang);
      imports = Array.isArray(extracted.imports) 
              ? extracted.imports.map(imp => ({
                name: imp.imported || imp.local || "*",
                from: imp.from || null,
                type: imp.isType ? "type" : "value"
              })) : [];
      exports = Array.isArray(extracted.exports)
              ? extracted.exports.map(exp => ({
                  name: exp.exported || exp.local || "default",
                  type: exp.type || "value"
                })) : [];
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
    //logger.info("processFileMetadata", "IMPORT_EXPORT_DONE", { relPath });

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

    //logger.info("processFileMetadata", "CACHE_SET_START", { relPath });
    fileCache.set(relPath, mtime, size, value, workspaceRoot);
    //logger.info("processFileMetadata", "CACHE_SET_DONE", { relPath });

    logger.debug("processFileMetadata", "Metadata generated", {
      relPath,
      lang
    });

    logger.info("processFileMetadata", "RETURN_OK", { relPath });

    return { ok: true, value, cached: false };
  } catch (err) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "processFileMetadata",
        "FILE_METADATA_FAILED",
        "Metadata generation crashed for file",
        {
          severity: "warn",
          filePath: fileObj?.absPath,
          meta: { error: err?.message }
        }
      )
    );
    logger.error("processFileMetadata", "CRASH", {
      relPath: fileObj?.relPath,
      error: err?.message,
      stack: err?.stack
    });
    return { ok: false, reason: "METADATA_CRASH" };
  }
}

module.exports = processFileMetadata;