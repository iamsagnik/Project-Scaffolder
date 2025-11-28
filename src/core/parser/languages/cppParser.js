const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

function parse(content) {
  const imports = [];
  const exports = [];

  if (typeof content !== "string") {
    warnings.recordWarning({
      code: "CPP_INVALID_CONTENT",
      message: "Non-string content passed to C++ parser",
      severity: "warn",
      filePath: null,
      module: "cppParser"
    });
    return { imports, exports };
  }

  const includeRegex = /^\s*#include\s*[<"]([^>"]+)[>"]/gm;
  const classRegex = /^\s*(class|struct)\s+([A-Za-z0-9_]+)/gm;

  let m;
  while ((m = includeRegex.exec(content))) imports.push(m[1]);
  while ((m = classRegex.exec(content))) exports.push(m[2]);

  logger.debug("cppParser", "Parsed C++ file", {
    importCount: imports.length,
    exportCount: exports.length
  });

  return { imports, exports };
}

module.exports = { parse };