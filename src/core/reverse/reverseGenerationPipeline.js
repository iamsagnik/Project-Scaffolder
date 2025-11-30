const path = require("path");

const loadSgmtrIgnore = require("../ignore/loadSgmtrIgnore");
const buildIgnoreMatchers = require("../ignore/buildIgnoreMatchers");
const readFolder = require("../parser/readFolder");
const processFileMetadata = require("./processFileMetadata");
const folderToSgmtr = require("./folderToSgmtr");
const validateSgmtr = require("./validationSgmtr");
const mergeSgmtr = require("./mergeSgmtr");
const { writeSgmtr } = require("../generator/fileWriter");

const stats = require("../diagnostics/statsCollector");
const logger = require("../diagnostics/logger");

async function reverseGenerate(rootPath) {

  const report = {
    filesProcessed: 0,
    skipped: [],
    errors: [],
    conflicts: [],
    outputPath: null
  };


  stats.startPhase("traversal");  
  const {processed, patterns} = await loadSgmtrIgnore(rootPath);
  if(processed) stats.incrementFilesProcessed();
  else stats.incrementFilesSkipped();
  const ign = buildIgnoreMatchers(patterns);

  const folderRes = await readFolder(rootPath, ign);
  const { files, skipped } = folderRes;
  report.skipped = skipped;
  stats.endPhase("traversal");



  stats.startPhase("parsing");
  const metas = [];
  for (const file of files) {
    try {
      logger.info("ReversePipeline", "Processing file", { relPath: file.relPath });
      const m = await processFileMetadata(file);
      if (!m.ok){
        stats.incrementFilesSkipped();
        if (m.reason === "BINARY_FILE") {
        stats.incrementBinarySkipped();
      }
      continue;
      }

      report.filesProcessed++;
      stats.incrementFilesProcessed();
      metas.push(m.value);
    } catch (err) {
      logger.error("ReversePipeline", "File crashed pipeline", {
        relPath: file.relPath,
        error: err?.message
      });
      throw err;
    }
  }
  stats.endPhase("parsing");



  stats.startPhase("generation");
  const tree = folderToSgmtr(metas);
  stats.endPhase("generation");



  stats.startPhase("validation"); 
  const val = await validateSgmtr(tree);
  if (!val.ok) {
    return {
      ok: false,
      report,
      error: val.error
    };
  }
  stats.endPhase("validation");



  stats.startPhase("merge");
  const mergeRes = mergeSgmtr(null, tree, "preferNewer");
  report.conflicts = mergeRes.conflicts;
  const finalTree = mergeRes.merged;
  stats.endPhase("merge");



  stats.startPhase("writing");
  const w = await writeSgmtr(rootPath, finalTree);
  if (!w?.ok) {
    return { ok: false, report, error: { message: "Write failed" } };
  }
  report.outputPath = w.path;
  stats.endPhase("writing");


  return { 
    ok: true, 
    report, 
    sgmtr: finalTree 
  };
}

module.exports = reverseGenerate;