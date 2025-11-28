const { toPosix } = require("../utils/pathUtils");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

function folderToSgmtr(rootPath, fileMetas) {
  const tree = {};
  const seen = new Set();

  function ensureNode(dirParts) {
    let cursor = tree;
    for (const part of dirParts) {
      if (!cursor[part]) cursor[part] = {};
      cursor = cursor[part];
    }
    return cursor;
  }

  for (const meta of fileMetas) {
    if (!meta || typeof meta.path !== "string") {
      warnings.recordWarning({
        code: "INVALID_METADATA_ENTRY",
        message: "Invalid metadata entry skipped",
        severity: "warn",
        filePath: null,
        module: "folderToSgmtr"
      });
      continue;
    }

    const rel = toPosix(meta.path);

    if (seen.has(rel)) {
      warnings.recordWarning({
        code: "DUPLICATE_METADATA_PATH",
        message: "Duplicate metadata path skipped",
        severity: "warn",
        filePath: rel,
        module: "folderToSgmtr"
      });
      continue;
    }

    seen.add(rel);

    const parts = rel.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    const fileName = parts.pop();
    const dirNode = ensureNode(parts);

    dirNode[fileName] = {
      $meta: {
        lang: meta.lang,
        size: meta.size,
        mtime: meta.mtime,
        imports: Array.isArray(meta.imports) ? meta.imports : [],
        exports: Array.isArray(meta.exports) ? meta.exports : []
      }
    };

    stats.increment("sgmtrNodesCreated");
  }

  logger.info("folderToSgmtr", "SGMTR tree constructed", {
    nodeCount: seen.size
  });

  return tree;
}

module.exports = { folderToSgmtr };