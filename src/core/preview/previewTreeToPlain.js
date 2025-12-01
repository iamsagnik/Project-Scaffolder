//  Convert a PreviewNode tree into a plain object structure
//  consumable by buildAsciiTree.
//  Shape rules:
//  - Folder node  → { [childName]: childPlain, ... }
//  - File node:
//     - If imports/exports available → { imports: [...], exports: [...] }
//     - Otherwise                    → "(file)"
//  @param {Object} previewRoot - Root PreviewNode produced by buildPreviewTree
//  @returns {Object} Plain object tree for ASCII rendering
 

function previewTreeToPlain(previewRoot) {
  if (!previewRoot || typeof previewRoot !== "object") return {};

  function fileToPlain(node) {
    if (Array.isArray(node.imports) || Array.isArray(node.exports)) {
      return {
        imports: Array.isArray(node.imports) ? node.imports : [],
        exports: Array.isArray(node.exports) ? node.exports : []
      };
    }
    return "(file)";
  }

  function folderToPlain(node) {
    const out = {};

    if (!Array.isArray(node.children)) {
      return out;
    }

    for (const child of node.children) {
      if (!child || typeof child !== "object" || !child.name) continue;

      if (child.type === "folder") {
        out[child.name] = folderToPlain(child);
      } else if (child.type === "file") {
        out[child.name] = fileToPlain(child);
      }
    }

    return out;
  }

  // Root from buildPreviewTree has name "" and children at top level
  if (previewRoot.type === "folder") {
    return folderToPlain(previewRoot);
  }

  // Degenerate case: root is a single file (unlikely but safe)
  const single = {};
  single[previewRoot.name || "(root)"] = fileToPlain(previewRoot);
  return single;
}

module.exports = previewTreeToPlain;