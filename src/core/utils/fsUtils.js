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
    const warning = warnings.createWarningResponse(
      "fsUtils",
      "STAT_FAILED",
      "Failed to stat path",
      {
        severity: "warn",
        filePath,
      }
    );
    warnings.recordWarning(warning);
    logger.warn("fsUtils", "stat failed", { filePath, err });
    return null;
  }
}

async function readFile(filePath) {
  const content = await safeStat(filePath);
  if (!content) {
    return { ok: false, reason: "STAT_FAILED" };
  }

  if (content.size > MAX_FILE_SIZE_BYTES) {
    const warning = warnings.createWarningResponse(
      "fsUtils",
      "FILE_TOO_LARGE",
      "File exceeds size limit",
      {
        severity: "warn",
        filePath,
        meta: { size: content.size },
      }
    );
    warnings.recordWarning(warning);
    return { ok: false, reason: "FILE_TOO_LARGE", size: content.size };
  }

  try {
    const uri = vscode.Uri.file(filePath);
    const data = await vscode.workspace.fs.readFile(uri);

    if (looksBinary(data)) {
      const warning = warnings.createWarningResponse(
        "fsUtils module",
        "BINARY_FILE",
        "Binary file skipped",
        {
          severity: "warn",
          filePath,
        }
      );
      warnings.recordWarning(warning);
      return { ok: false, reason: "BINARY_FILE" };
    }
    return { ok: true, content: uint8ToString(data) };

  } catch (err) {
      warnings.recordWarning(
        warnings.createWarningResponse(
          "fsUtils",
          "READ_FILE_FAILED",
          "Failed to read file",
          {
            severity: "warn",
            filePath,
            meta: { stack: err?.stack }
          }
        )
      );
    return { ok: false, reason: "READ_FAILED" };
  }
}

async function readDir(dirPath) {
  try {
    const uri = vscode.Uri.file(dirPath);
    return await vscode.workspace.fs.readDirectory(uri);
  } catch (err) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "fsUtils",
        "READ_DIR_FAILED",
        "Failed to read directory",
        {
          severity: "warn",
          filePath: dirPath,
          meta: { stack: err?.stack }
        }
      )
    );

    logger.warn("fsUtils", "readDirectory failed", {
      dirPath,
      err
    });
    return [];
  }
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
    throw err;
  }
}

module.exports = {
  readFile,
  readDir,
  isFile,
  isDirectory,
  writeFile,
  safeStat
};