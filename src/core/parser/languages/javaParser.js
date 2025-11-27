function parse(content) {
  const imports = [];
  const exports = [];

  const importRegex = /^\s*import\s+([A-Za-z0-9\._]+);/gm;
  const classRegex = /^\s*(public\s+)?class\s+([A-Za-z0-9_]+)/gm;

  let m;

  while ((m = importRegex.exec(content))) imports.push(m[1]);

  while ((m = classRegex.exec(content))) exports.push(m[2]);

  return { imports, exports };
}

module.exports = { parse };
