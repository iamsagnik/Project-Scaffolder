const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

function isPlainObject(v) {
  return v !== null && !Array.isArray(v) && typeof v === "object";
}

function isFileNode(v) {
  return isPlainObject(v) && v.$meta;
}

function mergeSgmtr(existing, generated, mode = "preferNewer") {
  if (!existing) {
    logger.info("mergeSgmtr", "No existing SGMTR, using generated only");
    return { ok: true, merged: generated, conflicts: [] };
  }

  const conflicts = [];

  function mergeNode(a, b, pathParts = []) {
    const result = {};
    const keys = new Set([
      ...Object.keys(a || {}),
      ...Object.keys(b || {})
    ]);

    for (const key of keys) {
      const aVal = a ? a[key] : undefined;
      const bVal = b ? b[key] : undefined;
      const nodePath = [...pathParts, key];

      if (
        isPlainObject(aVal) &&
        isPlainObject(bVal) &&
        !isFileNode(aVal) &&
        !isFileNode(bVal)
      ) {
        result[key] = mergeNode(aVal, bVal, nodePath);
        continue;
      }

      if (aVal !== undefined && bVal === undefined) {
        result[key] = aVal;
        continue;
      }

      if (bVal !== undefined && aVal === undefined) {
        result[key] = bVal;
        continue;
      }

      if (aVal !== undefined && bVal !== undefined && aVal !== bVal) {
        conflicts.push({
          path: nodePath.join("/"),
          existing: aVal,
          generated: bVal
        });

        warnings.recordWarning({
          code: "SGMTR_CONFLICT",
          message: "Conflict during SGMTR merge",
          severity: "warn",
          filePath: nodePath.join("/"),
          module: "mergeSgmtr"
        });

        if (mode === "overwrite") {
          result[key] = bVal;
          continue;
        }

        if (mode === "preferExisting") {
          result[key] = aVal;
          continue;
        }

        if (mode === "preferNewer") {
          const aTime = aVal?.$meta?.mtime || 0;
          const bTime = bVal?.$meta?.mtime || 0;
          result[key] = bTime >= aTime ? bVal : aVal;
          continue;
        }

        result[key] = bVal;
        continue;
      }

      result[key] = aVal !== undefined ? aVal : bVal;
    }

    return result;
  }

  const merged = mergeNode(existing, generated);

  logger.info("mergeSgmtr", "SGMTR merge completed", {
    conflictCount: conflicts.length
  });

  stats.increment("mergeOperations");

  return { ok: true, merged, conflicts };
}

module.exports = mergeSgmtr;