const { Minimatch } = require("minimatch");
const path = require("path");

const logger = require("../diagnostics/logger");
const stats = require("../diagnostics/statsCollector");
const warnings = require("../diagnostics/warningsCollector");

function normalize(relPath) {
  if (!relPath) return "";

  let norm = relPath.split(path.sep).join("/");

  if (norm.startsWith("./")) norm = norm.slice(2);
  if (norm.startsWith("/")) norm = norm.slice(1);

  norm = norm.replace(/\/+/g, "/");
  return norm;
}

function buildIgnoreMatchers(patterns = []) {
  const rules = [];

  logger.debug("ignore", "Building git-accurate ignore matchers", {
    patternCount: Array.isArray(patterns) ? patterns.length : 0
  });

  if (!Array.isArray(patterns)) {
    warnings.recordWarning(
      warnings.createWarningResponse(
        "ignore",
        "INVALID_IGNORE_PATTERN_ARRAY",
        "Ignore patterns must be an array",
        {
          severity: "warn",
          filePath: null,
          meta: { receivedType: typeof patterns }
        }
      )
    );
    patterns = [];
  }

  for (let i = 0; i < patterns.length; i++) {
    const raw = patterns[i];

    if (typeof raw !== "string") {
      warnings.recordWarning(
        warnings.createWarningResponse(
          "ignore",
          "INVALID_IGNORE_PATTERN",
          "Non-string ignore pattern skipped",
          {
            severity: "info",
            filePath: null,
            meta: { index: i, type: typeof raw }
          }
        )
      );
      continue;
    }

    const trimmed = raw.trim();
    if (!trimmed) continue;           // blank
    if (trimmed.startsWith("#")) continue; // comment

    let pattern = trimmed;
    let isNegation = false;

    if (pattern.startsWith("!")) {
      isNegation = true;
      pattern = pattern.slice(1);

      if (!pattern) {
        warnings.recordWarning(
          warnings.createWarningResponse(
            "ignore",
            "INVALID_NEGATION_PATTERN",
            "Bare '!' negation skipped",
            {
              severity: "info",
              filePath: null,
              meta: { index: i }
            }
          )
        );
        continue;
      }
    }

    const normalized = normalize(pattern);
    if (!normalized) continue;

    try {
      const mm = new Minimatch(normalized, {
        dot: true,         // match dotfiles
        matchBase: false,  // full relative-path only
        nocomment: true,
        nobrace: false,
        noglobstar: false
      });

      rules.push({
        raw,
        pattern: normalized,
        isNegation,
        mm
      });
    } catch (err) {
      warnings.recordWarning(
        warnings.createWarningResponse(
          "ignore",
          "INVALID_MINIMATCH_PATTERN",
          "Failed to compile ignore pattern",
          {
            severity: "warn",
            filePath: null,
            meta: { pattern: raw, error: err?.message }
          }
        )
      );
    }
  }

  function shouldIgnore(relPath) {
    const norm = normalizeRelPath(relPath);

    let ignored = false;
    let rule = null;

    // Git semantics: last matching rule wins
    for (const r of rules) {
      try {
        if (!r.mm.match(norm)) continue;
        ignored = !r.isNegation;
        rule = r.raw;
      } catch {
        continue;
      }
    }

    return { ignored, rule, relPath: norm };
  }

  return { rules, shouldIgnore};
}

module.exports = buildIgnoreMatchers;