function mergeIgnorePatterns(gitPatterns, autoPatterns) {
  const set = new Set();
  const added = [];

  // Add user patterns from .gitignore
  for (const p of gitPatterns) {
    if (!set.has(p)) set.add(p);
  }

  // Add header comment before auto-added items
  if (autoPatterns.length > 0) {
    const header = "# Added by SGMTR automatically";
    if (!set.has(header)) set.add(header);
  }

  // Add auto-generated patterns
  for (const p of autoPatterns) {
    if (!set.has(p)) {
      set.add(p);
      added.push(p);
    }
  }

  return {
    finalList: Array.from(set),
    addedPatterns: added
  };
}

module.exports = mergeIgnorePatterns;
