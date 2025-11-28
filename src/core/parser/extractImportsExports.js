const { getParser } = require("./languageRegistry");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");

function extractImportsExports(content, lang) {
  const parser = getParser(lang);

  try {
    const result = parser.parse(content);

    const imports = Array.isArray(result?.imports) ? result.imports : [];
    const exports = Array.isArray(result?.exports) ? result.exports : [];

    logger.debug("extractImportsExports", "Imports/exports extracted", {
      lang,
      importCount: imports.length,
      exportCount: exports.length
    });

    return { imports, exports };

  } catch (err) {
    warnings.recordWarning({
      code: "IMPORT_EXPORT_EXTRACTION_FAILED",
      message: "Parser threw during import/export extraction",
      severity: "warn",
      filePath: null,
      module: "extractImportsExports",
      meta: { lang }
    });

    logger.warn("extractImportsExports", "Parser failure", {
      lang,
      error: err?.message
    });

    return { imports: [], exports: [] };
  }
}

module.exports = {
  extractImportsExports
};