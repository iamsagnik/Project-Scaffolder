const logger = require("./logger");

let counters = {};
let timings = {};
let phaseTimes = {};

function reset() {
  counters = {
    totalFilesProcessed: 0,
    totalFoldersVisited: 0,
    totalFilesSkipped: 0,
    binaryFilesSkipped: 0,
    symlinksSkipped: 0,
    totalWarnings: 0,
    cacheEntries: 0
  };

  timings = {
    traversal: 0,
    parsing: 0,
    generation: 0,
    validation: 0,
    merge: 0,
    writing: 0,
    total: 0
  };

  phaseTimes = {};
}

function startPhase(phase) {
  phaseTimes[phase] = Date.now();
  logger.debug(`Phase ${phase} started`, null, "statsCollector");
}

function endPhase(phase) {
  if (!phaseTimes[phase]) return;

  const duration = Date.now() - phaseTimes[phase];
  timings[phase] = duration;
  logger.debug(`Phase ${phase} ended`, { duration }, "statsCollector");
}

function incrementFilesProcessed() {
  counters.totalFilesProcessed++;
}

function incrementFoldersVisited() {
  counters.totalFoldersVisited++;
}

function incrementFilesSkipped() {
  counters.totalFilesSkipped++;
}

function incrementBinarySkipped() {
  counters.binaryFilesSkipped++;
}

function incrementSymlinkSkipped() {
  counters.symlinksSkipped++;
}

function incrementWarnings() {
  counters.totalWarnings++;
}

function incrementCacheEntries(){
  counters.cacheEntries++;
}

function getStats() {
  timings.total =
    timings.traversal +
    timings.parsing +
    timings.generation +
    timings.validation +
    timings.merge +
    timings.writing;

  return {
    ...counters,
    timings: { ...timings }
  };
}

module.exports = {
  reset,
  startPhase,
  endPhase,
  incrementFilesProcessed,
  incrementFoldersVisited,
  incrementFilesSkipped,
  incrementBinarySkipped,
  incrementSymlinkSkipped,
  incrementWarnings,
  incrementCacheEntries,
  getStats
};
