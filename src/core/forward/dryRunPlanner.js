const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const { createWarningResponse, recordWarning } = require("../diagnostics/warningsCollector");
const { isFile, isDirectory } = require("../utils/fsUtils");

async function dryRunPlanner(normalizedTree) {
  const { folders = [], files = [] } = normalizedTree;

  const plan = {
    folders: [],
    files: [],
    skipped: []
  };

  const errors = [];

  logger.debug("dryRunPlanner", "Dry run planning started", {
    folderCount: folders.length,
    fileCount: files.length
  });

  for (const folder of folders) {
    const exists = await isDirectory(folder.absPath);

    if (exists) {
      plan.skipped.push({
        type: "folder",
        absPath: folder.absPath,
        relPath: folder.relPath,
        reason: "ALREADY_EXISTS"
      });
      stats.incrementFilesSkipped();
      continue;
    }

    plan.folders.push({
      absPath: folder.absPath,
      relPath: folder.relPath
    });
  }

  for (const file of files) {
    const { absPath, relPath, meta, content } = file;

    const exists = await isFile(absPath);

    if (exists) {
      if (meta.overwrite === true) {
        plan.files.push({
          absPath,
          relPath,
          content,
          meta,
          mode: "overwrite"
        });
      } else {
        plan.skipped.push({
          type: "file",
          absPath,
          relPath,
          reason: "EXISTS_AND_OVERWRITE_FALSE"
        });
        stats.incrementFilesSkipped();

        recordWarning(
          createWarningResponse(
            "dryRunPlanner",
            "FILE_SKIPPED",
            `File skipped (overwrite=false): ${relPath}`,
            {
              filePath: absPath,
              meta: { relPath }
            }
          )
        );
      }

      continue;
    }

    plan.files.push({
      absPath,
      relPath,
      content,
      meta,
      mode: "create"
    });
  }

  if (errors.length > 0) {
    logger.error("dryRunPlanner", "Dry run planning failed", {
      errorCount: errors.length,
      errors
    });

    return { ok: false, errors };
  }

  logger.debug("dryRunPlanner", "Dry run planning completed", {
    foldersPlanned: plan.folders.length,
    filesPlanned: plan.files.length,
    skipped: plan.skipped.length
  });

  return { ok: true, plan };
}

module.exports = dryRunPlanner;
