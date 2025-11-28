const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

const MAX_CACHE_ENTRIES = 5000; // hard safety cap

class FileCache {
  constructor() {
    this.map = new Map();
  }

  makeKey(workspaceRoot, relPath, mtime, size) {
    return `${workspaceRoot}::${relPath}::${mtime}::${size}`;
  }

  _evictIfNeeded() {
    if (this.map.size <= MAX_CACHE_ENTRIES) return;

    const firstKey = this.map.keys().next().value;
    this.map.delete(firstKey);

    warnings.recordWarning({
      code: "FILE_CACHE_EVICTED",
      message: "Oldest cache entry evicted due to size limit",
      severity: "info",
      filePath: null,
      module: "fileCache"
    });

    logger.debug("fileCache", "Cache entry evicted", {
      currentSize: this.map.size
    });
  }

  get(relPath, mtime, size, workspaceRoot = "__default__") {
    const key = this.makeKey(workspaceRoot, relPath, mtime, size);
    const value = this.map.get(key) || null;

    if (value) {
      logger.debug("fileCache", "Cache hit", { relPath });
    } else {
      logger.debug("fileCache", "Cache miss", { relPath });
    }

    return value;
  }

  set(relPath, mtime, size, value, workspaceRoot = "__default__") {
    const key = this.makeKey(workspaceRoot, relPath, mtime, size);

    if (!this.map.has(key)) {
      stats.increment("cacheEntries");
    }

    this.map.set(key, value);
    this._evictIfNeeded();

    logger.debug("fileCache", "Cache entry set", {
      relPath,
      cacheSize: this.map.size
    });
  }

  clear() {
    const size = this.map.size;
    this.map.clear();

    logger.info("fileCache", "Cache cleared", { removedEntries: size });
  }
}

module.exports = new FileCache();