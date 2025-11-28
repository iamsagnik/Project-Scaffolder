const { toPosix } = require("../utils/pathUtils");
const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const { throwError } = require("../diagnostics/errorHandler");

const MAX_DEPTH = 10;
const MAX_NODES = 35;

function buildPreviewTree(rawTree) {
  let nodeCount = 0;
  const visited = new WeakSet();

  function walk(node, name, relPath, depth) {
    // Depth guard
    if (depth > MAX_DEPTH) {
      warnings.recordWarning({
        code: "PREVIEW_DEPTH_LIMIT",
        message: "Maximum preview depth exceeded",
        severity: "warn",
        filePath: relPath,
        module: "buildPreviewTree"
      });

      return {
        name,
        type: "folder",
        relPath,
        isIgnored: false,
        children: []
      };
    }

    // Node count guard
    nodeCount++;
    if (nodeCount > MAX_NODES) {
      throwError({
        code: "PREVIEW_NODE_LIMIT_EXCEEDED",
        message: "Preview node limit exceeded",
        severity: "critical",
        filePath: relPath,
        module: "buildPreviewTree",
        meta: { maxNodes: MAX_NODES }
      });
    }

    // Cycle detection
    if (typeof node === "object" && node !== null) {
      if (visited.has(node)) {
        warnings.recordWarning({
          code: "PREVIEW_CYCLE_DETECTED",
          message: "Cycle detected in SGMTR tree",
          severity: "warn",
          filePath: relPath,
          module: "buildPreviewTree"
        });

        return {
          name,
          type: "folder",
          relPath,
          isIgnored: false,
          children: []
        };
      }
      visited.add(node);
    }

    // FILE NODE
    if (typeof node === "string") {
      return {
        name,
        type: "file",
        relPath,
        isIgnored: false
      };
    }

    // INVALID LEAF (defensive fallback)
    if (!node || typeof node !== "object") {
      warnings.recordWarning({
        code: "PREVIEW_INVALID_NODE",
        message: "Invalid SGMTR node encountered",
        severity: "warn",
        filePath: relPath,
        module: "buildPreviewTree"
      });

      return {
        name,
        type: "file",
        relPath,
        isIgnored: false
      };
    }

    // FOLDER NODE
    const children = [];

    for (const key of Object.keys(node)) {
      const child = node[key];
      const childRel = toPosix(
        relPath ? `${relPath}/${key}` : key
      );

      const previewChild = walk(
        child,
        key,
        childRel,
        depth + 1
      );

      children.push(previewChild);
    }

    return {
      name,
      type: "folder",
      relPath,
      isIgnored: false,
      children
    };
  }

  logger.debug("buildPreviewTree", "Building PreviewNode tree", {
    maxDepth: MAX_DEPTH,
    maxNodes: MAX_NODES
  });

  const root = walk(rawTree, "", "", 0);

  logger.info("buildPreviewTree", "PreviewNode tree built", {
    nodeCount
  });

  return root;
}

module.exports = {
  buildPreviewTree
};