const { Minimatch } = require("minimatch");
const path = require("path");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

function normalizeRelPath(relPath) {
  if (!relPath) return "";
  return relPath.split(path.sep).join("/");
}

function buildIgnoreMatchers(patterns = []) {
  const includes = [];
  const excludes = [];

  logger.debug("ignore", "Building ignore matchers", { patternCount: patterns.length });

  for (let raw of patterns) {
    if (!raw || typeof raw !== "string") {

      const warning = warnings.createWarningResponse(
        "non-string pattern",
        "INVALID_IGNORE_PATTERN",
        "Non-string ignore pattern skipped",
        {
          severity: "info",
          filePath: null,
          meta: "Array object"
        }
      );
      warnings.recordWarning(warning);
      continue;
    }

    const p = raw.trim();
    if (!p) continue;

    try {
      // negation
      if (p.startsWith("!")) {
        const body = p.slice(1);

        if (body.endsWith("/**")) {
          const base = body.slice(0, -3);
          includes.push({ raw: "!" + base, mm: new Minimatch(base, { dot: true, matchBase: true }) });
          includes.push({ raw: p, mm: new Minimatch(body, { dot: true, matchBase: true }) });
        } else {
          includes.push({ raw: p, mm: new Minimatch(body, { dot: true, matchBase: true }) });
        }
        continue;
      }

      // auto-expansion
      if (p.endsWith("/**")) {
        const base = p.slice(0, -3);
        excludes.push({ raw: base, mm: new Minimatch(base, { dot: true, matchBase: true }) });
        excludes.push({ raw: p, mm: new Minimatch(p, { dot: true, matchBase: true }) });
        continue;
      }

      excludes.push({ raw: p, mm: new Minimatch(p, { dot: true, matchBase: true }) });

    } catch (err) {
      const warning = warnings.createWarningResponse(
        "ignore",
        "INVALID_MINIMATCH_PATTERN",
        "Failed to compile ignore pattern",
        {
          severity: "warn",
          filePath: p,
          meta: { error: err?.message }
        }
      );
      warnings.recordWarning(warning);
    }
  }

  function shouldIgnore(relPath) {
    const norm = normalizeRelPath(relPath);
    let ignored = false;
    let rule = null;

    for (const ex of excludes) {
      try {
        if (ex.mm.match(norm)) {
          ignored = true;
          rule = ex.raw;
        }
      } catch {}
    }

    for (const inc of includes) {
      try {
        if (inc.mm.match(norm)) {
          ignored = false;
          rule = inc.raw;
          break;
        }
      } catch {}
    }

    if (ignored) {
      stats.increment("totalFilesSkipped");
      logger.debug("ignore", "Path ignored", { relPath: norm, rule });
    }

    return { ignored, rule, relPath: norm };
  }

  return { includes, excludes, shouldIgnore };
}

module.exports = buildIgnoreMatchers;