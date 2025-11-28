// Build an ASCII box-drawing tree from a plain object.
// Input shape:
// - Folder  -> { name: { ... } }
// - File    -> "(file)" OR { imports: [], exports: [] }

function buildAsciiTree(node, prefix = "") {
  if (!node || typeof node !== "object") return "";

  const entries = Object.keys(node).sort();

  const folders = entries.filter(
    k => typeof node[k] === "object" && !Array.isArray(node[k]) &&
         node[k] !== null && !(node[k].imports || node[k].exports)
  );

  const files = entries.filter(
    k => typeof node[k] === "string" ||
         (typeof node[k] === "object" && node[k] !== null &&
          (node[k].imports || node[k].exports))
  );

  const all = [...folders, ...files];

  let output = "";

  all.forEach((name, index) => {
    const value = node[name];
    const isLast = index === all.length - 1;

    const branch = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");

    // FILE WITH IMPORTS/EXPORTS
    if (typeof value === "object" && value !== null &&
        (value.imports || value.exports)) {

      output += `${prefix}${branch}${name}\n`;

      const imports = Array.isArray(value.imports) ? value.imports : [];
      const exports = Array.isArray(value.exports) ? value.exports : [];

      if (imports.length > 0) {
        imports.forEach((line, i) => {
          const isLastLine = exports.length === 0 && i === imports.length - 1;
          const subBranch = isLastLine ? "└── " : "├── ";
          output += `${nextPrefix}${subBranch}import: ${line}\n`;
        });
      }

      if (exports.length > 0) {
        exports.forEach((line, i) => {
          const isLastLine = i === exports.length - 1;
          const subBranch = isLastLine ? "└── " : "├── ";
          output += `${nextPrefix}${subBranch}export: ${line}\n`;
        });
      }

      return;
    }

    // FOLDER
    if (typeof value === "object" && value !== null) {
      output += `${prefix}${branch}${name}/\n`;
      output += buildAsciiTree(value, nextPrefix);
      return;
    }

    // SIMPLE FILE
    output += `${prefix}${branch}${name}\n`;
  });

  return output;
}

module.exports = {
  buildAsciiTree
};