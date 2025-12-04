const path = require("path");
const vscode = require("vscode");
const { writeFile } = require("../utils/fsUtils");

const stats = require("../diagnostics/statsCollector");
const logger = require("../diagnostics/logger");
const successes = require("../diagnostics/successHandler");
const { throwError } = require("../diagnostics/errorHandler");

async function writeSgmtr(rootPath, sgmtrObject) {
  const rootFolderName = path.basename(rootPath);
  const targetPath = path.join(rootPath, `${rootFolderName}.sgmtr`);

  let serialized;
  try {
    serialized = JSON.stringify(sgmtrObject, null, 2);
  } catch (err) {
    throwError({
      code: "SGMTR_SERIALIZE_FAILED",
      message: "Failed to serialize SGMTR object",
      severity: "critical",
      filePath: targetPath,
      module: "fileWriter",
      stack: err?.stack
    });
    throw err;
  }

  try {
    await writeFile(targetPath, serialized);

    successes.recordSuccessEvents(
      successes.createSuccessResponse(
        "fileWriter",
        "SGMTR_WRITTEN",
        "SGMTR file written successfully",
        {
          filePath: targetPath,
        }
      )
    );

    logger.info("fileWriter", "SGMTR file written", {
      outputPath: targetPath
    });

    return { ok: true, path: targetPath };

  } catch (err) {
    throwError({
      code: "SGMTR_WRITE_FAILED",
      message: "Failed to write .sgmtr file",
      severity: "critical",
      filePath: targetPath,
      module: "fileWriter",
      stack: err?.stack
    });
    throw err;
  }
}

async function execute(plan) {
  const errors = [];
  const { folders = [], files = [] } = plan;

  // Folders
  for (const folder of folders) {
    try {
      const uri = vscode.Uri.file(folder.absPath);
      await vscode.workspace.fs.createDirectory(uri);
      stats.incrementFoldersVisited();
    } catch (err) {
      errors.push({
        code: "FOLDER_CREATE_FAILED",
        message: "Failed to create folder",
        severity: "critical",
        filePath: folder.absPath,
        module: "fileWriter",
        stack: err?.stack
      });
    }
  }

  // Files
  for (const file of files) {
    try {
      await writeFile(file.absPath, file.content);
      stats.incrementFilesProcessed();

      successes.recordSuccessEvents(
        successes.createSuccessResponse(
          "fileWriter",
          "FILE_WRITTEN",
          "File written successfully",
          { filePath: file.absPath }
        )
      );
    } catch (err) {
      errors.push({
        code: "FILE_WRITE_FAILED",
        message: "Failed to write file",
        severity: "critical",
        filePath: file.absPath,
        module: "fileWriter",
        stack: err?.stack
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}

module.exports = { writeSgmtr, execute };