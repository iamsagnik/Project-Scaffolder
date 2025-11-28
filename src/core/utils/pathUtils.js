const path = require("path");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");

function join(...args) {
  return path.join(...args);
}

function normalize(p) {
  return path.normalize(p);
}

function extname(filePath) {
  return path.extname(filePath).toLowerCase();
}

function basename(filePath) {
  return path.basename(filePath);
}

function dirname(filePath) {
  return path.dirname(filePath);
}

function toPosix(p) {
  return p.replace(/\\/g, "/");
}

// Safe boundary check with path separator enforcement
function isInside(parent, child) {
  try {
    const parentNorm = toPosix(path.resolve(parent)).replace(/\/$/, "");
    const childNorm = toPosix(path.resolve(child));

    const inside =
      childNorm === parentNorm ||
      childNorm.startsWith(parentNorm + "/");

    if (!inside) {
      warnings.recordWarning({
        code: "PATH_ESCAPE_DETECTED",
        message: "Resolved path escapes parent boundary",
        severity: "warn",
        filePath: child,
        module: "pathUtils",
        meta: { parent: parentNorm }
      });

      logger.warn("pathUtils", "Path boundary violation", {
        parent: parentNorm,
        child: childNorm
      });
    }

    return inside;

  } catch (err) {
    warnings.recordWarning({
      code: "PATH_RESOLUTION_FAILED",
      message: "Failed to resolve or normalize path",
      severity: "warn",
      filePath: child,
      module: "pathUtils",
      meta: { parent }
    });

    logger.warn("pathUtils", "Path resolution failed", {
      parent,
      child,
      err: err?.message
    });

    return false;
  }
}

module.exports = {
  join,
  normalize,
  extname,
  basename,
  dirname,
  toPosix,
  isInside
};
