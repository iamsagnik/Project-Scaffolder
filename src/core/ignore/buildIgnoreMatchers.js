const minimatch = require("minimatch");

/**
 * Convert gitignore-style pattern into a recursive-friendly minimatch pattern.
 * Must preserve the original pattern (`raw`) and a clean rule (`rule`).
 */
function expandPattern(p) {
  p = (p || "").trim();
  if (!p || p.startsWith("#")) return null;

  const isNeg = p.startsWith("!");
  const core = isNeg ? p.slice(1) : p;

  let rule = core;
  let expanded;

  // folder/
  if (core.endsWith("/")) {
    const folder = core.slice(0, -1);
    expanded = `**/${folder}/**`;
    return { neg: isNeg, raw: p, rule, expanded };
  }

  // *.ext, .env, .gitignore
  if (!core.includes("/")) {
    expanded = `**/${core}`;
    return { neg: isNeg, raw: p, rule, expanded };
  }

  // nested path
  expanded = `**/${core}`;
  return { neg: isNeg, raw: p, rule, expanded };
}

function buildIgnoreMatchers(patterns) {
  const matchers = [];

  for (const p of patterns) {
    const exp = expandPattern(p);
    if (!exp) continue;

    const matcher = new minimatch.Minimatch(exp.expanded, {
      dot: true,
      nocomment: false,
      noglobstar: false,
    });

    matchers.push({
      raw: exp.raw,
      rule: exp.rule,
      negated: exp.neg,
      matcher,
    });
  }

  function shouldIgnore(rel) {
    let ignored = false;
    let lastRule = null;

    for (const m of matchers) {
      if (m.matcher.match(rel)) {
        ignored = !m.negated;
        lastRule = m.rule;     // pipeline needs this
      }
    }

    return {
      ignored,
      rule: lastRule,
    };
  }

  return { shouldIgnore };
}

module.exports = buildIgnoreMatchers;
