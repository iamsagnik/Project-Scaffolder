const path = require("path");

const { loadSgmtrIgnore } = require("../ignore/loadSgmtrIgnore");
const { buildIgnoreMatchers } = require("../ignore/buildIgnoreMatchers");
const { readFolder } = require("../parser/readFolder");
const { processFileMetadata } = require("./processFileMetadata");
const { folderToSgmtr } = require("./folderToSgmtr");
const { validateSgmtr } = require("./validationSgmtr");
const { mergeSgmtr } = require("./mergeSgmtr");
const { writeSgmtr } = require("../generator/fileWriter");

async function reverseGenerate(rootPath) {
  const report = {
    filesProcessed: 0,
    skipped: [],
    errors: [],
    conflicts: [],
    outputPath: null
  };

  // 1) load ignore
  const patterns = await loadSgmtrIgnore(rootPath);
  const ign = buildIgnoreMatchers(patterns);

  // 2) read folder
  const folderRes = await readFolder(rootPath, ign);
  report.skipped = folderRes.skipped;
  report.errors.push(...folderRes.errors);

  // 3) process files
  const metas = [];

  for (const f of folderRes.files) {
    const m = await processFileMetadata(f);
    if (!m.ok) {
      report.errors.push({
        type: "processError",
        path: f.relPath,
        message: m.error?.message
      });
      continue;
    }
    report.filesProcessed++;
    metas.push(m.meta);
  }

  // 4) build DSL
  const tree = folderToSgmtr(rootPath, metas);

  // 5) validate
  const val = await validateSgmtr(tree, rootPath);
  if (!val.ok) {
    return {
      ok: false,
      report,
      error: val.error
    };
  }

  // 6) merge with existing (optional)
  // user must load existing before calling this (not included)
  const mergeRes = mergeSgmtr(null, tree, "preferNewer");
  report.conflicts = mergeRes.conflicts;
  const finalTree = mergeRes.merged;

  // 7) write final
  const w = await writeSgmtr(rootPath, finalTree);
  if (!w.ok) {
    return {
      ok: false,
      report,
      error: { type: "writeError", message: w.error }
    };
  }

  report.outputPath = w.path;

  // done
  return { ok: true, report, sgmtr: finalTree };
}

module.exports = { reverseGenerate };