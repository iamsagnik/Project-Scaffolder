const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

function stripComments(content) {
  // Remove block comments /* ... */
  let code = content.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove line comments // ...
  code = code.replace(/\/\/[^\n]*$/gm, "");
  return code;
}

function parseContent(content) {
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

  const code = stripComments(content);

  // ---------- IMPORTS (#include) ----------
  // #include <vector>
  // #include "myheader.h"
  const includeRegex = /^\s*#\s*include\s*([<"])([^>"]+)[>"]/gm;
  let m;

  while ((m = includeRegex.exec(code))) {
    const bracket = m[1]; // < or "
    const target = m[2].trim();

    const isSystem = bracket === "<";
    const type = "include";

    const local = null;
    const imported = target;
    const from = target;

    imports.push({
      type,            // always "include"
      local: local,    // always null in C++
      imported,        // header name
      from,            // same as imported
      isType: true,    // headers are type-level dependencies
      isSystem         // true for <...>, false for "..."
    });
  }

  // ---------- EXPORTS (Top-level symbols) ----------
  // Heuristic: class, struct, enum, union, free functions
  // Templates are also supported implicitly

  const exportRegex =
    /^\s*(?:template\s*<[^>]+>\s*)?(class|struct|enum|union)\s+([A-Za-z_]\w*)/gm;

  while ((m = exportRegex.exec(code))) {
    const name = m[2];

    exports.push({
      type: "named",
      local: name,
      exported: name,
      from: null
    });
  }

  // Free functions (not perfect but deterministic)
  const functionRegex =
    /^\s*(?:inline\s+)?(?:constexpr\s+)?(?:[\w:\<\>\*\&]+\s+)+([A-Za-z_]\w*)\s*\([^;]*\)\s*(?:\{|;)/gm;

  while ((m = functionRegex.exec(code))) {
    const name = m[1];

    exports.push({
      type: "named",
      local: name,
      exported: name,
      from: null
    });
  }

  logger.debug("cppParser", "Parsed C++ file", {
    importCount: imports.length,
    exportCount: exports.length
  });

  return { imports, exports };
}

module.exports = parseContent;