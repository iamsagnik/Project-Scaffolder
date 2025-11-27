function parse(content) {
  const imports = [];
  const exports = [];

  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  const exportRegex = /export\s+(?:default\s+)?(class|function|const|let|var)?\s*([A-Za-z0-9_\$]*)/g;

  let m;
  while ((m = importRegex.exec(content))) imports.push(m[1]);
  while ((m = exportRegex.exec(content))) exports.push(m[2] || "default");

  return { imports, exports };
}

module.exports = { parse };
