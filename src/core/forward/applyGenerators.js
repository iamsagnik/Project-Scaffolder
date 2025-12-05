// applyGenerators.js
const { resolveGenerator } = require("../../../generators");  // adjust relative path if needed

/**
 * Applies all generators inside the forwardTree and produces a "generatedTree":
 * - File nodes become: { __type: "file", content: "string", meta: {...} }
 * - Folder nodes remain plain objects with recursively generated children
 *
 * IMPORTANT: one $meta node -> EXACTLY ONE FILE.
 */
async function applyGenerators(rawTree) {

  /*
   * Recursively processes nodes.
   * @param {*} node         - current forwardTree node
   * @param {*} pathSegments - array of folder keys leading to this node
   */
  async function walk(node, pathSegments) {

    // CASE 1: Empty file (null)
    if (node === null) {
      return {
        __type: "file",
        content: "",
        meta: {
          generator: null,
          variant: "default",
          options: {},
          overwrite: false,
          encoding: "utf8",
          permissions: null,
          standard: null
        }
      };
    }

    // CASE 2: Generated file ($meta)
    if (node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, "$meta")) {

      const meta = node.$meta || {};
      const generatorName = (meta.generator || "").trim();

      if (!generatorName) {
        const e = new Error(
          `Missing or empty 'generator' field at path: ${pathSegments.join("/")}`
        );
        e.code = "GENERATOR_MISSING";
        throw e;
      }

      try {
        // We request generator to produce exactly one file
        const result = await resolveGenerator({
          generator: generatorName,
          variant: meta.variant || "default",
          standard: meta.standard || null,
          options: meta.options || {},
          pathSegments,
          workspaceContext: meta.workspaceContext || {}
        });

        // Enforce result.type = single
        if (!result || result.type !== "single") {
          const e = new Error(
            `Generator "${generatorName}" did not return type="single" at ${pathSegments.join("/")}.`
          );
          e.code = "GENERATOR_RESULT_INVALID";
          throw e;
        }

        return {
          __type: "file",
          content: result.content,
          meta: {
            generator: generatorName,
            variant: meta.variant || "default",
            standard: meta.standard || null,
            options: meta.options || {},
            overwrite: meta.overwrite === true,
            encoding: meta.encoding || "utf8",
            permissions: meta.permissions || null
          }
        };

      } catch (err) {
        err.path = pathSegments.join("/");
        err.generator = generatorName;
        throw err;
      }
    }

    // CASE 3: Folder node
    if (node && typeof node === "object") {
      const out = {};
      for (const [key, child] of Object.entries(node)) {
        const childPath = pathSegments.concat(key);
        out[key] = await walk(child, childPath);
      }
      return out;
    }

    // CASE 4: Invalid node type
    const e = new Error(`Invalid node in forwardTree at path: ${pathSegments.join("/")}`);
    e.code = "FORWARD_NODE_INVALID";
    throw e;
  }

  return await walk(rawTree, []);
}

module.exports = applyGenerators;