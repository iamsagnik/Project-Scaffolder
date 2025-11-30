const vscode = require("vscode");
const path = require("path");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");
const successes = require("../diagnostics/successHandler");
const { throwError } = require("../diagnostics/errorHandler");

const MAX_IGNORE_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

async function loadSgmtrIgnore(rootPath) {
  const ignorePath = path.join(rootPath, ".sgmtrignore");
  const ignoreUri = vscode.Uri.file(ignorePath);

  try {
    const ignoreFileStat = await vscode.workspace.fs.stat(ignoreUri);

    if (ignoreFileStat.size > MAX_IGNORE_FILE_SIZE) {
      const warning = warnings.createWarningResponse(
        "ignore",
        "IGNORE_FILE_TOO_LARGE",
        ".sgmtrignore exceeds size limit",
        {
          severity: "warn",
          filePath: ignorePath,
          meta: { size: ignoreFileStat.size }
        }
      );

      warnings.recordWarning(warning);
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

    const success = successes.createSuccessResponse(
      "ignore",
      "IGNORE_FILE_LOADED",
      ".sgmtrignore loaded successfully",
      {
        filePath: ignorePath,
        meta: { patternCount: patterns.length }
      }
    );

    successes.recordSuccessEvents(success);

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

module.exports = loadSgmtrIgnore;