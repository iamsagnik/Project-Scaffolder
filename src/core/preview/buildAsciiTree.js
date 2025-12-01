// Build an ASCII box-drawing tree from a plain object.
// Input shape:
// - Folder  -> { name: { ... } }
// - File    -> "(file)" OR { imports: [], exports: [] }
function formatImport(imp) {
  if (!imp || typeof imp !== "object") return String(imp);

  const parts = [];

  if (imp.type === "default") {
    parts.push(`default ${imp.local}`);
  } else if (imp.type === "named") {
    parts.push(`${imp.imported} as ${imp.local}`);
  } else if (imp.type === "namespace") {
    parts.push(`* as ${imp.local}`);
  } else if (imp.type === "side-effect") {
    parts.push(`(side-effect)`);
  } else if (imp.type === "dynamic") {
    parts.push(`(dynamic)`);
  } else if (imp.type === "include") {
    parts.push(imp.imported);
  } else {
    parts.push(imp.local || imp.imported || "*");
  }

  if (imp.from) parts.push(`from ${imp.from}`);
  if (imp.isType) parts.push(`[type]`);
  if (imp.isSystem === true) parts.push(`[system]`);

  return parts.join(" ");
}

function formatExport(exp) {
  if (!exp || typeof exp !== "object") return String(exp);

  if (exp.type === "default") return "default";
  if (exp.type === "wildcard") return "*";
  if (exp.type === "re-export") return `${exp.exported} from ${exp.from}`;

  return exp.exported || exp.local || "unnamed";
}

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

      // ---- IMPORT GROUP ----
      if (imports.length > 0) {
        output += `${nextPrefix}├── import\n`;
        imports.forEach((imp, i) => {
          const isLastImport = i === imports.length - 1;
          const subPrefix = nextPrefix + "│   ";
          const subBranch = isLastImport ? "└── " : "├── ";
          output += `${subPrefix}${subBranch}${formatImport(imp)}\n`;
        });
      }

      // ---- EXPORT GROUP ----
      if (exports.length > 0) {
        const exportPrefix =
          imports.length > 0 ? nextPrefix : nextPrefix;

        const exportBranch = imports.length > 0 ? "└── " : "├── ";
        output += `${exportPrefix}${exportBranch}export\n`;

        exports.forEach((exp, i) => {
          const isLastExport = i === exports.length - 1;
          const subPrefix = exportPrefix + "    ";
          const subBranch = isLastExport ? "└── " : "├── ";

          output += `${subPrefix}${subBranch}${formatExport(exp)}\n`;
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

module.exports = buildAsciiTree;