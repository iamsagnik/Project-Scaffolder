const vscode = require("vscode");
const path = require("path");

const logger = require("../diagnostics/logger");
const warnings = require("../diagnostics/warningsCollector");
const { throwError } = require("../diagnostics/errorHandler");

const MAX_IGNORE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function loadSgmtrIgnore(rootPath) {
  const ignorePath = path.join(rootPath, ".sgmtrignore");
  const ignoreUri = vscode.Uri.file(ignorePath);

  try {
    const stat = await vscode.workspace.fs.stat(ignoreUri);

    if (stat.size > MAX_IGNORE_FILE_SIZE) {
      warnings.recordWarning({
        code: "IGNORE_FILE_TOO_LARGE",
        message: ".sgmtrignore exceeds size limit",
        severity: "warn",
        filePath: ignorePath,
        module: "ignore",
        meta: { size: stat.size }
      });
      return [];
    }

    const rawBytes = await vscode.workspace.fs.readFile(ignoreUri);
    const raw = Buffer.from(rawBytes).toString("utf8");

    const patterns = raw
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"));

    logger.info("ignore", ".sgmtrignore loaded", {
      filePath: ignorePath,
      patternCount: patterns.length
    });

    return patterns;

  } catch (err) {
    if (err && (err.code === "FileNotFound" || err.name === "EntryNotFound")) {
      logger.debug("ignore", "No .sgmtrignore file found", { rootPath });
      return [];
    }

    throwError({
      code: "IGNORE_FILE_READ_FAILED",
      message: "Failed to load .sgmtrignore",
      severity: "error",
      filePath: ignorePath,
      module: "ignore",
      stack: err?.stack
    });
  }
}

module.exports = {
  loadSgmtrIgnore
};