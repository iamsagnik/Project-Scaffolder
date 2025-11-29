const path = require("path");

const loadSgmtrIgnore = require("../ignore/loadSgmtrIgnore");
const buildIgnoreMatchers = require("../ignore/buildIgnoreMatchers");
const { readFolder } = require("../parser/readFolder");
const { processFileMetadata } = require("./processFileMetadata");
const { folderToSgmtr } = require("./folderToSgmtr");
const { validateSgmtr } = require("./validationSgmtr");
const { mergeSgmtr } = require("./mergeSgmtr");
const { writeSgmtr } = require("../generator/fileWriter");

const stats = require("../diagnostics/statsCollector");

async function reverseGenerate(rootPath) {

  const report = {
    filesProcessed: 0,
    skipped: [],
    errors: [],
    conflicts: [],
    outputPath: null
  };

  // iniating traversal phase
  stats.startPhase("traversal");  

  const patterns = await loadSgmtrIgnore(rootPath);
  const ign = buildIgnoreMatchers(patterns);

  const folderRes = await readFolder(rootPath, ign);
  const { files, skipped } = folderRes;
  report.skipped = skipped;
  stats.incrementFoldersVisited();

  // ending of traversal phase
  stats.endPhase("traversal");

  // iniating content parsing phase
  stats.startPhase("parsing");

  const metas = [];

  for (const f of folderRes.files) {
    const m = await processFileMetadata(f);
    if (!m.ok) continue;
    report.filesProcessed++;
    metas.push(m.meta);
  }

  // ending of parsing phase
  stats.endPhase("parsing");

  // iniating generation phase
  stats.startPhase("generation");

  const tree = folderToSgmtr(rootPath, metas);

  // ending of generation phase
  stats.endPhase("generation");


  // initiating validation phase
  stats.startPhase("validation"); 

  const val = await validateSgmtr(tree, rootPath);
  if (!val.ok) {
    return {
      ok: false,
      report,
      error: val.error
    };
  }

  // ending of validation phase
  stats.endPhase("validation");

  // iniating merging phase
  stats.startPhase("merge");

  const mergeRes = mergeSgmtr(null, tree, "preferNewer");
  report.conflicts = mergeRes.conflicts;
  const finalTree = mergeRes.merged;

  // ending merging phase
  stats.endPhase("merge");

  // initiating writing phase
  stats.startPhase("writing");

  const w = await writeSgmtr(rootPath, finalTree);
  if (!w.ok) {
    return {
      ok: false,
      report,
      error: { type: "writeError", message: w.error }
    };
  }

  report.outputPath = w.path;

  stats.endPhase("writing");

  // done
  return { 
    ok: true, 
    report, 
    sgmtr: finalTree 
  };
}

module.exports = reverseGenerate;