const logger = require("../../diagnostics/logger");
const warnings = require("../../diagnostics/warningsCollector");

function stripComments(content) {
  // remove triple-quoted blocks
  content = content.replace(/'''[\s\S]*?'''/g, "");
  content = content.replace(/"""[\s\S]*?"""/g, "");
  // remove single-line comments
  content = content.replace(/#.*$/gm, "");
  return content;
}

function parseContent(content) {
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

  const code = stripComments(content);

  // ---------------- IMPORTS ----------------

  // import os
  // import numpy as np
  // import a.b.c
  const importRegex = /^\s*import\s+([a-zA-Z0-9_.]+)(?:\s+as\s+(\w+))?/gm;
  let m;

  while ((m = importRegex.exec(code))) {
    const full = m[1];
    const alias = m[2] || null;
    const last = full.split(".").pop();

    imports.push({
      type: "regular",
      local: alias || last,
      imported: last,
      from: full,
      isType: false
    });
  }

  // from a.b import x
  // from a import x as y
  // from a import *
  const fromImportRegex =
    /^\s*from\s+([a-zA-Z0-9_.]+)\s+import\s+([a-zA-Z0-9_.*, ]+)/gm;

  while ((m = fromImportRegex.exec(code))) {
    const source = m[1];
    const names = m[2].split(",").map(s => s.trim());

    for (const n of names) {
      if (n === "*") {
        imports.push({
          type: "wildcard",
          local: null,
          imported: "*",
          from: source,
          isType: false
        });
      } else {
        const [orig, alias] = n.split(/\s+as\s+/);

        imports.push({
          type: "named",
          local: alias || orig,
          imported: orig,
          from: source,
          isType: false
        });
      }
    }
  }

  // ---------------- EXPORTS ----------------
  // Only TOP-LEVEL definitions (no indent)

  // class Engine:
  const classRegex = /^\s*class\s+([A-Za-z_]\w*)\s*[:\(]/gm;
  while ((m = classRegex.exec(code))) {
    exports.push({
      type: "named",
      local: m[1],
      exported: m[1],
      from: null
    });
  }

  // def run():
  const funcRegex = /^\s*def\s+([A-Za-z_]\w*)\s*\(/gm;
  while ((m = funcRegex.exec(code))) {
    exports.push({
      type: "named",
      local: m[1],
      exported: m[1],
      from: null
    });
  }

  // async def fetch():
  const asyncFuncRegex = /^\s*async\s+def\s+([A-Za-z_]\w*)\s*\(/gm;
  while ((m = asyncFuncRegex.exec(code))) {
    exports.push({
      type: "named",
      local: m[1],
      exported: m[1],
      from: null
    });
  }

  // TOP-LEVEL assignments only (no indent)
  const varRegex = /^\s*([A-Z_][A-Z0-9_]*)\s*=/gm;
  while ((m = varRegex.exec(code))) {
    exports.push({
      type: "named",
      local: m[1],
      exported: m[1],
      from: null
    });
  }

  logger.debug("pythonParser", "Parsed Python file", {
    importCount: imports.length,
    exportCount: exports.length
  });

  return { imports, exports };
}

module.exports = parseContent;
