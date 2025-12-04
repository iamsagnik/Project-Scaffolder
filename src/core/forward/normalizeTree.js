const logger = require("../diagnostics/logger");
const { join, toPosix, isInside } = require("../utils/pathUtils");


function normalizeTree(generatedTree, context = {}) {
  const { workspaceRootPath } = context;

  const folders = [];
  const files = [];

  logger.debug("normalizeTree", "Normalization started", {
    workspaceRootPath
  });

  walk({
    node: generatedTree,
    parentAbsPath: workspaceRootPath,
    parentRelPath: "",
    folders,
    files,
    workspaceRootPath
  });

  // Deterministic ordering (planner relies on this)
  folders.sort((a, b) => a.absPath.localeCompare(b.absPath));
  files.sort((a, b) => a.absPath.localeCompare(b.absPath));

  logger.debug("normalizeTree", "Normalization completed", {
    folderCount: folders.length,
    fileCount: files.length
  });

  return { folders, files };
}

function walk({
  node,
  parentAbsPath,
  parentRelPath,
  folders,
  files,
  workspaceRootPath
}) {
  // File node
  if (node && node.__type === "file") {
    const absPath = parentAbsPath;
    const relPath = toPosix(parentRelPath);

    if (!isInside(workspaceRootPath, absPath)) {
      logger.warn("normalizeTree", "Path escape blocked", {
        absPath,
        workspaceRootPath
      });
      return;
    }

    files.push({
      absPath,
      relPath,
      content: node.content,
      meta: node.meta || {}
    });

    return;
  }

  // Folder node (plain object)
  for (const [name, child] of Object.entries(node)) {
    const childAbsPath = join(parentAbsPath, name);
    const childRelPath = parentRelPath
      ? toPosix(parentRelPath + "/" + name)
      : toPosix(name);

    if (child && child.__type === "file") {
      if (!isInside(workspaceRootPath, childAbsPath)) {
        logger.warn("normalizeTree", "Path escape blocked", {
          absPath: childAbsPath,
          workspaceRootPath
        });
        continue;
      }

      files.push({
        absPath: childAbsPath,
        relPath: childRelPath,
        content: child.content,
        meta: child.meta || {}
      });

      continue;
    }

    // Folder
    if (!isInside(workspaceRootPath, childAbsPath)) {
      logger.warn("normalizeTree", "Path escape blocked", {
        absPath: childAbsPath,
        workspaceRootPath
      });
      continue;
    }

    folders.push({
      absPath: childAbsPath,
      relPath: childRelPath
    });

    walk({
      node: child,
      parentAbsPath: childAbsPath,
      parentRelPath: childRelPath,
      folders,
      files,
      workspaceRootPath
    });
  }
}

module.exports = normalizeTree;
