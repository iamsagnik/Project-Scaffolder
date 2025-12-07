const { getGeneratorInfo } = require("../../../generators"); 
/**
 * Semantic validation of forwardTree.
 * Ensures:
 *  - Node shape is valid
 *  - $meta fields are valid
 *  - Generator exists
 *  - Variant exists (if variantMap)
 *  - No file node has children
 */
async function validateSgmtr(rawTree, context = {}) {
  const errors = [];

  async function validateNode(node, pathSegments) {
    const pathStr = pathSegments.join("/") || "/";

    // CASE 1: empty file
    if (node === null) return;

    // CASE 2: file with $meta
    if (
      node &&
      typeof node === "object" &&
      Object.prototype.hasOwnProperty.call(node, "$meta")
    ) {
      const meta = node.$meta || {};

      // --- Check generator ---
      const generatorName = (meta.generator || "").trim();
      if (!generatorName) {
        errors.push({
          code: "GENERATOR_MISSING",
          message: `Missing or empty 'generator' at ${pathStr}`
        });
        return;
      }

      // --- Check variant ---
      if (meta.variant !== undefined) {
        const variant = (meta.variant || "").trim();
        if (!variant) {
          errors.push({
            code: "VARIANT_EMPTY",
            message: `Variant cannot be empty at ${pathStr}`
          });
        }
      }

      // --- Check standard ---
      if (meta.standard !== undefined) {
        const standard = (meta.standard || "").trim();
        if (!standard) {
          errors.push({
            code: "STANDARD_EMPTY",
            message: `Standard cannot be empty at ${pathStr}`
          });
        }
      }

      // --- Mixed node check (file node must not have children) ---
      const keys = Object.keys(node).filter(k => k !== "$meta");
      if (keys.length > 0) {
        errors.push({
          code: "MIXED_FILE_AND_CHILDREN",
          message: `File node at ${pathStr} contains children: ${keys.join(", ")}`
        });
      }

      // --- Check generator existence ---
      let info = null;
      try {
        info = getGeneratorInfo(generatorName);
      } catch (e) {
        errors.push({
          code: "GENERATOR_NOT_FOUND",
          message: `Generator "${generatorName}" not found at ${e.message}`
        });
        return;
      }

      if (!info.exists) {
        errors.push({
          code: "GENERATOR_NOT_FOUND",
          message: `Generator "${generatorName}" not found at ${e.message}`
        });
        return;
      }

      // --- Variant validation ---
      const variant = (meta.variant || "default").trim();

      if (info.kind === "variantMap") {
        if (!info.variants.includes(variant)) {
          errors.push({
            code: "VARIANT_NOT_FOUND",
            message: `Variant "${variant}" not found in generator "${generatorName}" at ${pathStr}. Available: ${info.variants.join(", ")}`
          });
        }
      }
      // If single function -> any variant is acceptable

      return;
    }

    // CASE 3: folder
    if (node && typeof node === "object") {
      for (const [key, child] of Object.entries(node)) {
        await validateNode(child, pathSegments.concat(key));
      }
      return;
    }

    // CASE 4: invalid type
    errors.push({
      code: "NODE_INVALID",
      message: `Invalid node type at ${pathStr}`
    });
  }

  await validateNode(rawTree, []);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}

module.exports = validateSgmtr;
