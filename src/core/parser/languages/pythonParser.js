function parse(content) {
  const imports = [];
  const exports = [];

  const importRegex = /^import\s+([A-Za-z0-9_\.]+)/gm;
  const fromRegex = /^from\s+([A-Za-z0-9_\.]+)\s+import\s+/gm;

  let m;
  while ((m = importRegex.exec(content))) imports.push(m[1]);
  while ((m = fromRegex.exec(content))) imports.push(m[1]);

  return { imports, exports };
}

module.exports = { parse };