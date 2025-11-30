const path = require("path");
const vscode = require("vscode");

const { readDir, safeStat, isDirectory } = require("../utils/fsUtils");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const { throwError } = require("../diagnostics/errorHandler");

async function readFolder(rootPath, ignoreMatchers) {
  const files = [];
  const skipped = [];

  async function walk(currentAbsPath) {

    if(isDirectory(currentAbsPath)) stats.incrementFoldersVisited();

    let entries = await readDir(currentAbsPath);

    if (!Array.isArray(entries)) return;
 
    for (const [name, type] of entries) {
      const abs = path.join(currentAbsPath, name);
      const rel = path.relative(rootPath, abs);

      if ((type & vscode.FileType.SymbolicLink) !== 0) {
        skipped.push({ path: rel, rule: "SYMLINK" });
        stats.incrementSymlinkSkipped();
        warnings.recordWarning(
          warnings.createWarningResponse(
            "fsUtils",
            "SYMLINK_SKIPPED",
            "Symlink skipped during traversal",
            {
              severity: "info",
              filePath: current,
            }
          )
        );
        continue;
      }

      if (name === ".sgmtrignore") {
        skipped.push({ path: rel, rule: "INTERNAL_ALWAYS_IGNORE" });
        stats.incrementFilesSkipped();
        continue;
      }

      const check = ignoreMatchers.shouldIgnore(rel);

      if (check.ignored) {
        skipped.push({ path: rel, rule: check.rule });
        stats.incrementFilesSkipped();
        logger.debug(
          "readFolder", 
          "Path ignored by rule", 
          {
            relPath: rel,
            rule: check.rule
          }
        );
        continue;
      }

      if (type === vscode.FileType.Directory) {
        await walk(abs);
        continue;
      }

      if (type === vscode.FileType.File) {
        let s = await safeStat(abs);
        if (!s) {
          continue;
        }

        files.push({
          workspaceRoot: rootPath,
          absPath: abs,
          relPath: rel,
          size: s.size,
          mtime: s.mtime
        });
      }
    }
  }

  try {
    await walk(rootPath);

    logger.info(
      "readFolder", 
      "Folder scan completed", 
      {
        rootPath,
        fileCount: files.length,
        skippedCount: skipped.length
      }
    );

    return { files, skipped };
  } catch (err) {
      throwError({
        code: "RECURSIVE_READ_FAILED",
        message: "Recursive directory traversal failed",
        severity: "critical",
        filePath: dirPath,
        module: "fsUtils",
        stack: err?.stack
      });
      throw err;
    }
}

module.exports = readFolder;