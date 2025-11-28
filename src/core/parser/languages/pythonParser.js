const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

function parse(content) {
  const imports = [];
  const exports = [];

  if (typeof content !== "string") {
    warnings.recordWarning({
      code: "PY_INVALID_CONTENT",
      message: "Non-string content passed to Python parser",
      severity: "warn",
      filePath: null,
      module: "pythonParser"
    });
    return { imports, exports };
  }

  const importRegex = /^import\s+([A-Za-z0-9_\.]+)/gm;
  const fromRegex = /^from\s+([A-Za-z0-9_\.]+)\s+import\s+/gm;

  let m;
  while ((m = importRegex.exec(content))) imports.push(m[1]);
  while ((m = fromRegex.exec(content))) imports.push(m[1]);

  logger.debug("pythonParser", "Parsed Python file", {
    importCount: imports.length
  });

  return { imports, exports };
}

module.exports = { parse };