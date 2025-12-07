function validateIgnorePatterns(patterns) {
  const errors = [];

  for (const p of patterns) {
    // Rule 1 — No bare "!"
    if (p === "!") {
      errors.push({ pattern: p, reason: "Empty negation operator" });
      continue;
    }

    // Rule 2 — Must not contain illegal escapes
    if (p.includes("\\")) {
      errors.push({ pattern: p, reason: "Backslash escape is not allowed" });
    }

    // Rule 3 — Basic minimatch sanity check (no spaces at start, etc.)
    if (/^\s/.test(p)) {
      errors.push({ pattern: p, reason: "Pattern begins with whitespace" });
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

module.exports = validateIgnorePatterns;
