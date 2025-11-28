const path = require("path");
const vscode = require("vscode");

const { readDir, stat } = require("../utils/fsUtils");
const { toPosix } = require("../utils/pathUtils");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");
const { throwError } = require("../diagnostics/errorHandler");

async function readFolder(rootPath, ignoreMatchers) {
  const files = [];
  const skipped = [];

  async function walk(currentAbsPath) {
    let entries;

    try {
      entries = await readDir(currentAbsPath);
      stats.increment("totalFoldersVisited");
    } catch (err) {
      throwError({
        code: "READ_DIR_FAILED",
        message: "Failed to read directory during traversal",
        severity: "critical",
        filePath: currentAbsPath,
        module: "readFolder",
        stack: err?.stack
      });
      return;
    }

    for (const [name, type] of entries) {
      const abs = path.join(currentAbsPath, name);
      const rel = toPosix(path.relative(rootPath, abs));

      const check = ignoreMatchers.shouldIgnore(rel);

      if (check.ignored) {
        skipped.push({ path: rel, rule: check.rule });

        stats.increment("totalFilesSkipped");

        logger.debug("readFolder", "Path ignored by rule", {
          relPath: rel,
          rule: check.rule
        });

        continue;
      }

      if (type === vscode.FileType.Directory) {
        await walk(abs);
        continue;
      }

      if (type === vscode.FileType.File) {
        let s;
        try {
          s = await stat(abs);
        } catch (err) {
          warnings.recordWarning({
            code: "STAT_FAILED",
            message: "Failed to stat file",
            severity: "warn",
            filePath: abs,
            module: "readFolder"
          });
          continue;
        }

        if (!s) {
          warnings.recordWarning({
            code: "STAT_NULL",
            message: "Stat returned null",
            severity: "warn",
            filePath: abs,
            module: "readFolder"
          });
          continue;
        }

        files.push({
          absPath: abs,
          relPath: rel,
          size: s.size,
          mtime: s.mtime
        });

        stats.increment("totalFilesProcessed");
      }
    }
  }

  await walk(rootPath);

  logger.info("readFolder", "Folder scan completed", {
    rootPath,
    fileCount: files.length,
    skippedCount: skipped.length
  });

  return {
    files,
    skipped
  };
}

module.exports = {
  readFolder
};