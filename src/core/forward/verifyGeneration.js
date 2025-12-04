const logger = require("../diagnostics/logger");
const { isFile, isDirectory, readFile } = require("../utils/fsUtils");


async function verifyGeneration(plan, context = {}) {
  const errors = [];

  const { folders = [], files = [] } = plan;

  logger.debug("verifyGeneration", "Verification started", {
    folders: folders.length,
    files: files.length
  });

  for (const folder of folders) {
    const exists = await isDirectory(folder.absPath);

    if (!exists) {
      errors.push({
        code: "FOLDER_MISSING_AFTER_WRITE",
        message: "Folder missing after write phase",
        severity: "critical",
        filePath: folder.absPath,
        module: "verifyGeneration"
      });
    }
  }

  for (const file of files) {
    const { absPath, relPath, content } = file;

    const exists = await isFile(absPath);

    if (!exists) {
      errors.push({
        code: "FILE_MISSING_AFTER_WRITE",
        message: "File missing after write phase",
        severity: "critical",
        filePath: absPath,
        module: "verifyGeneration",
        meta: { relPath }
      });
      continue;
    }

    const readRes = await readFile(absPath);
    if (!readRes.ok) {
      errors.push({
        code: "FILE_READ_VERIFY_FAILED",
        message: "File exists but failed integrity read",
        severity: "critical",
        filePath: absPath,
        module: "verifyGeneration",
        meta: { relPath, reason: readRes.reason }
      });
      continue;
    }

    if (typeof content === "string" && readRes.content !== content) {
      errors.push({
        code: "FILE_CONTENT_MISMATCH",
        message: "File content mismatch after write",
        severity: "critical",
        filePath: absPath,
        module: "verifyGeneration",
        meta: { relPath }
      });
    }
  }

  if (errors.length > 0) {
    logger.error("verifyGeneration", "Verification failed", {
      errorCount: errors.length,
      errors
    });

    return { ok: false, errors };
  }

  logger.debug("verifyGeneration", "Verification completed successfully", {});
  return { ok: true };
}

module.exports = verifyGeneration;
