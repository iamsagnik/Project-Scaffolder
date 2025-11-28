const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

function parse(content) {
  const imports = [];
  const exports = [];

  if (typeof content !== "string") {
    warnings.recordWarning({
      code: "JS_INVALID_CONTENT",
      message: "Non-string content passed to JavaScript parser",
      severity: "warn",
      filePath: null,
      module: "javascriptParser"
    });
    return { imports, exports };
  }

  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  const exportRegex =
    /export\s+(?:default\s+)?(class|function|const|let|var)?\s*([A-Za-z0-9_\$]*)/g;

  let m;
  while ((m = importRegex.exec(content))) imports.push(m[1]);

  while ((m = exportRegex.exec(content))) {
    if (m[2]) exports.push(m[2]);
    else exports.push("default");
  }

  logger.debug("javascriptParser", "Parsed JS file", {
    importCount: imports.length,
    exportCount: exports.length
  });

  return { imports, exports };
}

module.exports = { parse };