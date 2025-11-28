const vscode = require("vscode");
const path = require("path");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");
const { throwError } = require("../diagnostics/errorHandler");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function uint8ToString(uint8) {
  return Buffer.from(uint8).toString("utf8");
}

function stringToUint8(str) {
  return Buffer.from(str, "utf8");
}

function looksBinary(uint8) {
  const len = Math.min(uint8.length, 512);
  for (let i = 0; i < len; i++) {
    if (uint8[i] === 0) return true;
  }
  return false;
}

async function safeStat(filePath) {
  try {
    const uri = vscode.Uri.file(filePath);
    return await vscode.workspace.fs.stat(uri);
  } catch (err) {
    stats.increment("totalFilesSkipped");
    warnings.recordWarning({
      code: "STAT_FAILED",
      message: "Failed to stat path",
      severity: "warn",
      filePath,
      module: "fsUtils"
    });
    logger.warn("fsUtils", "stat failed", { filePath, err });
    return null;
  }
}

async function readFile(filePath) {
  const stat = await safeStat(filePath);
  if (!stat) {
    return { ok: false, reason: "STAT_FAILED" };
  }

  if (stat.size > MAX_FILE_SIZE_BYTES) {
    stats.increment("totalFilesSkipped");
    warnings.recordWarning({
      code: "FILE_TOO_LARGE",
      message: "File exceeds size limit",
      severity: "warn",
      filePath,
      meta: { size: stat.size },
      module: "fsUtils"
    });
    return { ok: false, reason: "FILE_TOO_LARGE", size: stat.size };
  }

  try {
    const uri = vscode.Uri.file(filePath);
    const data = await vscode.workspace.fs.readFile(uri);

    if (looksBinary(data)) {
      stats.increment("binaryFilesSkipped");
      warnings.recordWarning({
        code: "BINARY_FILE",
        message: "Binary file skipped",
        severity: "warn",
        filePath,
        module: "fsUtils"
      });
      return { ok: false, reason: "BINARY_FILE" };
    }

    stats.increment("totalFilesProcessed");
    return { ok: true, content: uint8ToString(data) };

  } catch (err) {
    throwError({
      code: "READ_FILE_FAILED",
      message: "Failed to read file",
      severity: "error",
      filePath,
      module: "fsUtils",
      stack: err?.stack
    });
  }
}

async function readDir(dirPath) {
  try {
    const uri = vscode.Uri.file(dirPath);
    return await vscode.workspace.fs.readDirectory(uri);
  } catch (err) {
    throwError({
      code: "READ_DIR_FAILED",
      message: "Failed to read directory",
      severity: "critical",
      filePath: dirPath,
      module: "fsUtils",
      stack: err?.stack
    });
  }
}

async function stat(filePath) {
  return safeStat(filePath);
}

async function isFile(filePath) {
  const s = await safeStat(filePath);
  return !!s && s.type === vscode.FileType.File;
}

async function isDirectory(filePath) {
  const s = await safeStat(filePath);
  return !!s && s.type === vscode.FileType.Directory;
}

async function writeFile(filePath, text) {
  try {
    const uri = vscode.Uri.file(filePath);
    await vscode.workspace.fs.writeFile(uri, stringToUint8(text));
    logger.debug("fsUtils", "File written", { filePath });
  } catch (err) {
    throwError({
      code: "WRITE_FILE_FAILED",
      message: "Failed to write file",
      severity: "critical",
      filePath,
      module: "fsUtils",
      stack: err?.stack
    });
  }
}

async function readDirRecursive(dirPath) {
  const results = new Set();
  const visited = new Set();

  async function walk(current) {
    const real = path.resolve(current);
    if (visited.has(real)) return;
    visited.add(real);

    const currentStat = await safeStat(current);
    if (!currentStat) return;

    if ((currentStat.type & vscode.FileType.SymbolicLink) !== 0) {
      stats.increment("symlinksSkipped");
      warnings.recordWarning({
        code: "SYMLINK_SKIPPED",
        message: "Symlink skipped during traversal",
        severity: "info",
        filePath: current,
        module: "fsUtils"
      });
      return;
    }

    const uri = vscode.Uri.file(current);
    const entries = await vscode.workspace.fs.readDirectory(uri);
    stats.increment("totalFoldersVisited");

    for (const [name, type] of entries) {
      const fullPath = path.join(current, name);

      if (type === vscode.FileType.File) {
        results.add(fullPath);
      } else if (type === vscode.FileType.Directory) {
        await walk(fullPath);
      }
    }
  }

  try {
    await walk(dirPath);
    logger.debug("fsUtils", "Recursive directory scan complete", {
      root: dirPath,
      fileCount: results.size
    });
    return Array.from(results);
  } catch (err) {
    throwError({
      code: "RECURSIVE_READ_FAILED",
      message: "Recursive directory traversal failed",
      severity: "critical",
      filePath: dirPath,
      module: "fsUtils",
      stack: err?.stack
    });
  }
}

module.exports = {
  readFile,
  readDir,
  stat,
  isFile,
  isDirectory,
  writeFile,
  readDirRecursive
};