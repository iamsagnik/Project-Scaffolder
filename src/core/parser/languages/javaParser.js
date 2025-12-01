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
      code: "JAVA_INVALID_CONTENT",
      message: "Non-string content passed to Java parser",
      severity: "warn",
      filePath: null,
      module: "javaParser"
    });
    return { imports, exports };
  }

  const code = stripComments(content);

  // import [static] a.b.C;
  // import [static] a.b.C.MEMBER;
  // import [static] a.b.*;
  // import [static] a.b.C.*;
  const importRegex = /^\s*import\s+(static\s+)?([\w\.]+(?:\.\*)?|\w+(?:\.\w+)*\*?)\s*;/gm;
  let m;

  while ((m = importRegex.exec(code))) {
    const isStatic = !!m[1];
    const full = m[2].trim(); // full import target as written

    let type;
    let local = null;
    let imported;
    let from;

    const isWildcard = full.endsWith(".*");

    if (isWildcard) {
      const owner = full.slice(0, -2); // drop .*
      imported = "*";
      local = null;
      from = owner || null;
      type = isStatic ? "static-wildcard" : "wildcard";
    } else {
      const parts = full.split(".");
      const last = parts.pop(); // simple class or member name
      const owner = parts.join(".") || null;

      if (isStatic) {
        // import static a.b.C.MEMBER;
        // from = owner of MEMBER (a.b.C), imported = MEMBER
        from = owner;
        imported = last;
        local = last;
        type = "static";
      } else {
        // import a.b.C;
        // from = full FQN, imported/local = simple type name
        from = full;
        imported = last;
        local = last;
        type = "regular";
      }
    }

    imports.push({
      type,        // "regular" | "static" | "wildcard" | "static-wildcard"
      local,       // simple name or null
      imported,    // simple name or "*"
      from,        // package or FQN or owner FQN
      isType: true // all Java imports are type-level
    });
  }

  // Top-level type declarations treated as exports:
  // public class X
  // class X
  // public interface Y
  // public enum Z
  const typeDeclRegex =
    /^\s*(public\s+)?(class|interface|enum)\s+([A-Za-z_]\w*)/gm;

  while ((m = typeDeclRegex.exec(code))) {
    const name = m[3];

    exports.push({
      type: "named",   // aligned with JS "named" exports
      local: name,
      exported: name,
      from: null
    });
  }

  logger.debug("javaParser", "Parsed Java file", {
    importCount: imports.length,
    exportCount: exports.length
  });

  return { imports, exports };
}

module.exports = parseContent;
