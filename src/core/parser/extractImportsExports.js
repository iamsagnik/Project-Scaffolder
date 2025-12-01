const getParser = require("./languageRegistry");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");

function extractImportsExports(content, lang) {
  const parser = getParser(lang);

  try {
    const result = parser(content);

    const imports = Array.isArray(result?.imports) ? result.imports : [];
    const exports = Array.isArray(result?.exports) ? result.exports : [];

    logger.debug("extractImportsExports", "Imports/exports extracted", {
      lang,
      importCount: imports.length,
      exportCount: exports.length
    });

    return { imports, exports };

  } catch (err) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "extractImportsExports",
        "IMPORT_EXPORT_EXTRACTION_FAILED",
        "Parser threw during import/export extraction",
        {
          severity: "warn",
          filePath: null,
          meta: { lang }
        }
      )
    );

    logger.warn("extractImportsExports", "Parser failure", {
      lang,
      error: err?.message
    });

    return { imports: [], exports: [] };
  }
}

module.exports = extractImportsExports;