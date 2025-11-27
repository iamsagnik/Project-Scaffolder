function parse(content) {
  const imports = [];
  const exports = [];

  const includeRegex = /^\s*#include\s*[<"]([^>"]+)[>"]/gm;
  const classRegex = /^\s*(class|struct)\s+([A-Za-z0-9_]+)/gm;

  let m;

  while ((m = includeRegex.exec(content))) imports.push(m[1]);

  while ((m = classRegex.exec(content))) exports.push(m[2]);

  return { imports, exports };
}

module.exports = { parse };