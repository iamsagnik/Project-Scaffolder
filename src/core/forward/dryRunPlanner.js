// const logger = require("../diagnostics/logger");
// const stats = require("../diagnostics/statsCollector");
// const { createWarningResponse, recordWarning } = require("../diagnostics/warningsCollector");
// const { isFile, isDirectory } = require("../utils/fsUtils");

// async function dryRunPlanner(normalizedTree) {
//   const { folders = [], files = [] } = normalizedTree;

//   const plan = {
//     folders: [],
//     files: [],
//     skipped: []
//   };

//   const errors = [];

//   logger.debug("dryRunPlanner", "Dry run planning started", {
//     folderCount: folders.length,
//     fileCount: files.length
//   });

//   for (const folder of folders) {
//     const exists = await isDirectory(folder.absPath);

//     if (exists) {
//       plan.skipped.push({
//         type: "folder",
//         absPath: folder.absPath,
//         relPath: folder.relPath,
//         reason: "ALREADY_EXISTS"
//       });
//       stats.incrementFilesSkipped();
//       continue;
//     }

//     plan.folders.push({
//       absPath: folder.absPath,
//       relPath: folder.relPath
//     });
//   }

//   for (const file of files) {
//     const { absPath, relPath, meta, content } = file;

//     const exists = await isFile(absPath);

//     if (exists) {
//       if (meta.overwrite === true) {
//         plan.files.push({
//           absPath,
//           relPath,
//           content,
//           meta,
//           mode: "overwrite"
//         });
//       } else {
//         plan.skipped.push({
//           type: "file",
//           absPath,
//           relPath,
//           reason: "EXISTS_AND_OVERWRITE_FALSE"
//         });
//         stats.incrementFilesSkipped();

//         recordWarning(
//           createWarningResponse(
//             "dryRunPlanner",
//             "FILE_SKIPPED",
//             `File skipped (overwrite=false): ${relPath}`,
//             {
//               filePath: absPath,
//               meta: { relPath }
//             }
//           )
//         );
//       }

//       continue;
//     }

//     plan.files.push({
//       absPath,
//       relPath,
//       content,
//       meta,
//       mode: "create"
//     });
//   }

//   if (errors.length > 0) {
//     logger.error("dryRunPlanner", "Dry run planning failed", {
//       errorCount: errors.length,
//       errors
//     });

//     return { ok: false, errors };
//   }

//   logger.debug("dryRunPlanner", "Dry run planning completed", {
//     foldersPlanned: plan.folders.length,
//     filesPlanned: plan.files.length,
//     skipped: plan.skipped.length
//   });

//   return { ok: true, plan };
// }

// module.exports = dryRunPlanner;


// dryRunPlanner.js (FINAL VERSION)
const { isFile, isDirectory } = require("../utils/fsUtils");
const warnings = require("../diagnostics/warningsCollector");

/**
 * Builds a forward generation plan.
 *
 * Does NOT write anything.
 * Returns:
 *   { ok: true, plan: {...} }
 * Or:
 *   { ok: false, errors: [...] }
 */
async function dryRunPlanner(normalizedTree) {
  const { folders = [], files = [] } = normalizedTree;

  const errors = [];
  const skipped = [];
  const folderPlan = [];
  const filePlan = [];

  // ---- 1. Folder planning ----
  for (const folder of folders) {
    const { absPath, relPath } = folder;

    try {
      const exists = await isDirectory(absPath);
      if (!exists) {
        folderPlan.push({ absPath, relPath });
      }
    } catch (err) {
      errors.push({
        code: "PLAN_FOLDER_CHECK_FAILED",
        message: `Failed folder existence check for ${relPath}`,
        module: "dryRunPlanner",
        severity: "error",
        filePath: relPath,
        meta: { absPath, originalError: err.message }
      });
    }
  }

  // ---- 2. File planning ----
  for (const file of files) {
    const { absPath, relPath, content, meta } = file;

    const overwrite = meta.overwrite === true;

    try {
      const exists = await isFile(absPath);

      if (exists) {
        if (!overwrite) {
          // skip writing this file
          skipped.push({
            absPath,
            relPath,
            reason: "File exists and overwrite=false"
          });

          warnings.addWarning({
            code: "FORWARD_FILE_SKIPPED",
            message: `Skipping existing file (overwrite=false): ${relPath}`,
            module: "dryRunPlanner",
            filePath: relPath
          });

          continue;
        }

        // File exists, but overwrite=true → schedule write
        filePlan.push({ absPath, relPath, content, meta });
      } else {
        // File does not exist → schedule create
        filePlan.push({ absPath, relPath, content, meta });
      }

    } catch (err) {
      errors.push({
        code: "PLAN_FILE_CHECK_FAILED",
        message: `Failed file existence check for ${relPath}`,
        module: "dryRunPlanner",
        severity: "error",
        filePath: relPath,
        meta: { absPath, originalError: err.message }
      });
    }
  }

  // ---- 3. Final error check ----
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // ---- 4. Return completed plan ----
  const plan = {
    folders: folderPlan,
    files: filePlan,
    skipped
  };

  return { ok: true, plan };
}

module.exports = dryRunPlanner;
