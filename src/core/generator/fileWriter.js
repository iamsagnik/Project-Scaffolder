const path = require("path");
const { writeFile } = require("../utils/fsUtils");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const successes = require("../diagnostics/successHandler");
const { throwError } = require("../diagnostics/errorHandler");

async function writeSgmtr(rootPath, sgmtrObject) {
  const targetPath = path.join(rootPath, ".sgmtr");

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
  }

  try {
    await writeFile(targetPath, serialized);

    stats.increment("sgmtrFilesWritten");

    successes.recordSuccess({
      code: "SGMTR_WRITTEN",
      message: "SGMTR file written successfully",
      filePath: targetPath,
      module: "fileWriter"
    });

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
  }
}

module.exports = { writeSgmtr };