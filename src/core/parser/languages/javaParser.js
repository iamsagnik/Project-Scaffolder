const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

function parse(content) {
  const imports = [];
  const exports = [];

  if (typeof content !== "string") {
    warnings.recordWarning({
      code: "JAVA_INVALID_CONTENT",
      message: "Non-string content passed to Java parser",
      severity: "warn",
      filePath: null,
      module: "javaParser"
    });
    return { imports, exports };
  }

  const importRegex = /^\s*import\s+([A-Za-z0-9\._]+);/gm;
  const classRegex = /^\s*(public\s+)?class\s+([A-Za-z0-9_]+)/gm;

  let m;
  while ((m = importRegex.exec(content))) imports.push(m[1]);
  while ((m = classRegex.exec(content))) exports.push(m[2]);

  logger.debug("javaParser", "Parsed Java file", {
    importCount: imports.length,
    exportCount: exports.length
  });

  return { imports, exports };
}

module.exports = { parse };