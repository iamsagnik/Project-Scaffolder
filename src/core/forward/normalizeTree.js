const path = require("path");
const { isInside } = require("../utils/pathUtils");
const { throwError } = require("../diagnostics/errorHandler");
const logger = require("../diagnostics/logger");


function normalizeTree(generatedTree, { workspaceRootPath }) {
  const folders = [];
  const files = [];

  function fail(code, message, relPath, meta = {}) {
    throwError({
      code,
      module: "normalizeTree",
      severity: "error",
      message,
      filePath: relPath || null,
      meta
    });
  }

  function assertInside(absPath, relPath) {
    if (!isInside(workspaceRootPath, absPath)) {
      fail(
        "NORMALIZE_PATH_OUTSIDE_WORKSPACE",
        `Path resolved outside workspace: ${absPath}`,
        relPath,
        { absPath, relPath, workspaceRootPath }
      );
    }
  }

  function walk(node, relPath) {
    const absPath = path.join(workspaceRootPath, relPath);

    // FILE NODE
    if (node && typeof node === "object" && node.__type === "file") {
      const illegal = Object.keys(node).filter(
        k => !["__type", "content", "meta"].includes(k)
      );
      if (illegal.length > 0) {
        fail(
          "NORMALIZE_FILE_HAS_CHILDREN",
          `File node '${relPath}' contains illegal children: ${illegal.join(", ")}`,
          relPath,
          { illegal }
        );
      }

      assertInside(absPath, relPath);

      files.push({
        absPath,
        relPath,
        content: node.content,
        meta: node.meta || {}
      });

      return;
    }

    // FOLDER NODE
    if (node && typeof node === "object") {
      if (Object.prototype.hasOwnProperty.call(node, "$meta")) {
        fail(
          "NORMALIZE_FOLDER_HAS_META",
          `Folder-like node '${relPath}' illegally contains '$meta'`,
          relPath
        );
      }

      if (relPath !== "") {
        assertInside(absPath, relPath);
        folders.push({ absPath, relPath });
      }

      for (const [key, child] of Object.entries(node)) {
        walk(child, relPath ? `${relPath}/${key}` : key);
      }

      return;
    }

    // INVALID NODE
    fail(
      "NORMALIZE_INVALID_NODE",
      `Invalid node type at '${relPath}'. Expected folder or file.`,
      relPath,
      { value: node }
    );
  }

  logger.info("normalizeTree", "Normalization started");

  walk(generatedTree, "");

  folders.sort((a, b) => a.absPath.localeCompare(b.absPath));
  files.sort((a, b) => a.absPath.localeCompare(b.absPath));

  logger.info("normalizeTree", "Normalization completed", {
    folders: folders.length,
    files: files.length
  });

  return { folders, files };
}

module.exports = normalizeTree;
