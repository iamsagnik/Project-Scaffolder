const path = require("path");
const vscode = require("vscode");

const { readDir, safeStat } = require("../utils/fsUtils");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

async function readFolder(rootPath, ignoreMatchers) {
  const files = [];
  const skipped = [];

  async function walk(currentAbsPath) {

    let entries = await readDir(currentAbsPath);
    stats.incrementFoldersVisited();
 
    for (const [name, type] of entries) {
      const abs = path.join(currentAbsPath, name);
      const rel = path.relative(rootPath, abs);

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

        stats.incrementFilesProcessed();
      }
    }
  }

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

  return {
    files,
    skipped
  };
}

module.exports = readFolder;